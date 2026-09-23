import "server-only";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { orderRepository } from "@/server/orders/order.repository";
import { orderService } from "@/server/orders/order.service";
import { createCheckout, getPaymentStatus, parseResourcePath } from "./datafast.client";
import {
  DATAFAST_BRANDS,
  DATAFAST_PROVIDER,
  DATAFAST_WIDGET_SCRIPT_URL,
  DatafastError,
  assertDatafastConfigured,
} from "./datafast.config";
import { classifyResultCode, type DatafastOutcome } from "./datafast.result-codes";
import { roundCurrency, splitIvaIncluded } from "./datafast.tax";
import type { DatafastCartItem } from "./datafast.types";

const orderInclude = { items: true } satisfies Prisma.OrderInclude;
type DatafastOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export interface StartPaymentResult {
  checkoutId: string;
  widgetScriptUrl: string;
  brands: string;
  orderNumber: string;
  amount: number;
}

export interface ConfirmPaymentResult {
  outcome: DatafastOutcome;
  code: string;
  description: string;
  orderNumber: string;
  transactionId?: string | undefined;
}

function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

function splitName(fullName: string): { givenName: string; middleName?: string | undefined } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { givenName: parts[0] ?? "Cliente" };
  return { givenName: parts[0] ?? "Cliente", middleName: parts.slice(1).join(" ") };
}

async function getOrderByNumber(orderNumber: string): Promise<DatafastOrder> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: orderInclude,
  });
  if (!order) throw new DatafastError("Pedido no encontrado.");
  return order;
}

/**
 * Los precios del catalogo ya incluyen IVA, por lo que los items se envian tal
 * cual y el desglose viaja en los customParameters SHOPPER_VAL_*.
 */
function buildCartItems(order: DatafastOrder): DatafastCartItem[] {
  const items: DatafastCartItem[] = order.items.map((item) => ({
    name: item.name,
    description: [item.brand, item.name].filter(Boolean).join(" - "),
    price: toNumber(item.discountPrice ?? item.price),
    quantity: item.quantity,
  }));

  const shippingCost = toNumber(order.shippingCost);
  if (shippingCost > 0) {
    items.push({
      name: "Envio",
      description: order.shippingMethodName || "Envio",
      price: shippingCost,
      quantity: 1,
    });
  }

  const discount = toNumber(order.discountAmount);
  if (discount > 0) {
    items.push({
      name: "Descuento",
      description: order.couponCode ? `Cupon ${order.couponCode}` : "Descuento aplicado",
      price: -roundCurrency(discount),
      quantity: 1,
    });
  }

  return items;
}

export const datafastService = {
  /** Crea (o recrea, en caso de reintento) el checkoutId del widget. */
  async startPayment(orderNumber: string, customerIp: string): Promise<StartPaymentResult> {
    assertDatafastConfigured();
    const order = await getOrderByNumber(orderNumber);

    if (order.paymentStatus === PaymentStatus.paid) {
      throw new DatafastError("Este pedido ya fue pagado.");
    }
    if (order.status === OrderStatus.cancelled) {
      throw new DatafastError("Este pedido fue cancelado.");
    }

    const amount = roundCurrency(toNumber(order.total));
    if (amount <= 0) {
      throw new DatafastError("El total del pedido no es valido para cobro con tarjeta.");
    }

    const { givenName, middleName } = splitName(order.firstName);
    const tax = splitIvaIncluded(amount);

    const checkout = await createCheckout({
      merchantTransactionId: order.orderNumber,
      amount,
      customer: {
        givenName,
        middleName,
        surname: order.lastName,
        email: order.guestEmail ?? "",
        phone: order.phone,
        ip: customerIp,
        merchantCustomerId: order.orderNumber,
        identificationDocId: order.idNumber ?? "",
      },
      billing: { street1: order.billingAddress ?? order.address, country: "EC" },
      shipping: { street1: order.address, country: "EC" },
      items: buildCartItems(order),
      tax,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: DATAFAST_PROVIDER,
        paymentCheckoutId: checkout.id,
      },
    });

    await orderRepository.addOrderTimeline(
      order.id,
      "payment_checkout_created",
      "Se genero un formulario de pago con tarjeta (Datafast).",
      { checkoutId: checkout.id, amount, base0: tax.base0, baseImp: tax.baseImp, iva: tax.iva },
      DATAFAST_PROVIDER,
    );

    return {
      checkoutId: checkout.id,
      widgetScriptUrl: DATAFAST_WIDGET_SCRIPT_URL,
      brands: DATAFAST_BRANDS,
      orderNumber: order.orderNumber,
      amount,
    };
  },

  /** Verifica el resultado contra Datafast y persiste el desenlace. Idempotente. */
  async confirmPayment(orderNumber: string, resourcePath: string): Promise<ConfirmPaymentResult> {
    assertDatafastConfigured();
    const order = await getOrderByNumber(orderNumber);

    if (order.paymentStatus === PaymentStatus.paid) {
      return {
        outcome: "approved",
        code: order.paymentResultCode ?? "",
        description: order.paymentResultDescription ?? "Pago ya confirmado.",
        orderNumber: order.orderNumber,
        transactionId: order.paymentTransactionId ?? undefined,
      };
    }

    const { checkoutId } = parseResourcePath(resourcePath);
    if (!order.paymentCheckoutId || order.paymentCheckoutId !== checkoutId) {
      throw new DatafastError("El resultado de pago no corresponde a este pedido.");
    }

    const result = await getPaymentStatus(resourcePath);
    const outcome = classifyResultCode(result.result.code);

    const amountMatches =
      result.amount !== undefined &&
      roundCurrency(Number(result.amount)) === roundCurrency(toNumber(order.total));
    const referenceMatches =
      result.merchantTransactionId === undefined ||
      result.merchantTransactionId === order.orderNumber;

    const trusted = outcome === "approved" && amountMatches && referenceMatches;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: DATAFAST_PROVIDER,
        paymentTransactionId: result.id ?? null,
        paymentResultCode: result.result.code,
        paymentResultDescription: result.result.description,
        paymentAuthCode: result.resultDetails?.AuthCode ?? null,
        paymentCardLast4: result.card?.last4Digits ?? null,
        paymentCardBrand: result.paymentBrand ?? null,
        paymentPaidAt: trusted ? new Date() : null,
        paymentRaw: result.raw as Prisma.InputJsonValue,
      },
    });

    await orderRepository.addOrderTimeline(
      order.id,
      "payment_result",
      trusted
        ? `Pago aprobado por Datafast (${result.result.code}).`
        : `Pago no aprobado por Datafast (${result.result.code}): ${result.result.description}`,
      {
        code: result.result.code,
        description: result.result.description,
        outcome,
        transactionId: result.id ?? null,
        amount: result.amount ?? null,
        amountMatches,
        referenceMatches,
      },
      DATAFAST_PROVIDER,
    );

    if (trusted) {
      await orderService.updatePaymentStatus(order.id, PaymentStatus.paid, DATAFAST_PROVIDER);
      await orderService.updateOrderStatus(order.id, OrderStatus.confirmed, DATAFAST_PROVIDER);
      return {
        outcome: "approved",
        code: result.result.code,
        description: result.result.description,
        orderNumber: order.orderNumber,
        transactionId: result.id,
      };
    }

    if (outcome === "review" || outcome === "pending") {
      return {
        outcome,
        code: result.result.code,
        description: result.result.description,
        orderNumber: order.orderNumber,
        transactionId: result.id,
      };
    }

    await orderService.updatePaymentStatus(order.id, PaymentStatus.failed, DATAFAST_PROVIDER);

    return {
      outcome: "rejected",
      code: result.result.code,
      description:
        outcome === "approved" && !amountMatches
          ? "El monto autorizado no coincide con el del pedido."
          : result.result.description,
      orderNumber: order.orderNumber,
      transactionId: result.id,
    };
  },
};
