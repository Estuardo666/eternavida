import "server-only";
import type { OrderNoteVisibility, OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

import type { OrderWithRelations } from "@/server/orders/order.repository";
import {
  triggerOrderCreated,
  triggerOrderPaymentStatusChanged,
  triggerOrderStatusChanged,
  triggerOrderUpdated,
} from "@/server/webhooks/webhook-trigger.service";

import { orderRepository } from "./order.repository";
import {
  createOrderSchema,
  type CreateOrderInput,
  type OrderAddressInput,
  type OrderItemInput,
} from "./order.schemas";

const NOTIFIABLE_STATUSES: OrderStatus[] = [
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_EMAIL_STATUSES: PaymentStatus[] = ["paid", "refunded"];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown order service error.";
}

async function getOrderOrThrow(orderId: string) {
  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return order;
}

async function refreshOrder(orderId: string) {
  return getOrderOrThrow(orderId);
}

function queueOrderCreatedWebhook(order: OrderWithRelations) {
  void triggerOrderCreated(order).catch((error) => {
    console.error("[order-service] Failed to trigger order.created webhook:", error);
  });
}

function queueOrderUpdatedWebhook(order: OrderWithRelations, changes: Prisma.InputJsonValue) {
  void triggerOrderUpdated(order, changes).catch((error) => {
    console.error("[order-service] Failed to trigger order.updated webhook:", error);
  });
}

function queueOrderStatusChangedWebhook(
  order: OrderWithRelations,
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
) {
  void triggerOrderStatusChanged(order, oldStatus, newStatus).catch((error) => {
    console.error("[order-service] Failed to trigger order.status_changed webhook:", error);
  });
}

function queueOrderPaymentStatusChangedWebhook(
  order: OrderWithRelations,
  oldStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  void triggerOrderPaymentStatusChanged(order, oldStatus, newStatus).catch((error) => {
    console.error("[order-service] Failed to trigger payment status webhook:", error);
  });
}

export const orderService = {
  async createOrderFromCheckout(rawInput: CreateOrderInput) {
    const input = createOrderSchema.parse(rawInput);
    const order = await orderRepository.createOrder(input);

    await orderRepository.addOrderTimeline(
      order.id,
      "order_created",
      "Pedido creado desde checkout.",
      {
        source: order.source,
        itemsCount: order.items.length,
      },
      "system",
    );

    const refreshedOrder = await refreshOrder(order.id);

    // Auto-save addresses for authenticated users on first order
    if (input.clerkUserId) {
      try {
        const { addressRepository } = await import("@/server/addresses/address.repository");
        const { AddressType } = await import("@prisma/client");

        const hasAddresses = await addressRepository.hasAnyAddresses(input.clerkUserId);
        if (!hasAddresses) {
          await addressRepository.createAddress(input.clerkUserId, {
            type: AddressType.SHIPPING,
            firstName: input.firstName,
            lastName: input.lastName,
            address: input.address,
            apartment: input.apartment ?? null,
            province: input.province,
            city: input.city,
            phone: input.phone,
            idNumber: input.idNumber ?? null,
            isDefault: true,
          });

          if (input.billingFirstName && input.billingAddress) {
            await addressRepository.createAddress(input.clerkUserId, {
              type: AddressType.BILLING,
              firstName: input.billingFirstName,
              lastName: input.billingLastName ?? input.lastName,
              address: input.billingAddress,
              apartment: input.billingApartment ?? null,
              province: input.billingProvince ?? input.province,
              city: input.billingCity ?? input.city,
              phone: input.billingPhone ?? input.phone,
              idNumber: input.billingRuc ?? null,
              isDefault: true,
            });
          }
        }
      } catch (err) {
        console.error("[order-service] Failed to auto-save addresses:", err);
      }
    }

    try {
      const { sendAdminOrderNotification } = await import(
        "@/services/email/send-admin-order-notification"
      );
      await sendAdminOrderNotification(order.id);
    } catch (err) {
      console.error("[order-service] Failed to send admin notification:", err);
    }

    try {
      const recipientEmail = order.guestEmail;
      if (recipientEmail) {
        const { sendOrderConfirmation } = await import(
          "@/services/email/send-order-confirmation"
        );
        await sendOrderConfirmation(order.id);
      }
    } catch (err) {
      console.error("[order-service] Failed to send order confirmation:", err);
    }

    queueOrderCreatedWebhook(refreshedOrder);

    return refreshedOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, createdBy = "system") {
    const existingOrder = await getOrderOrThrow(orderId);
    if (existingOrder.status === status) return existingOrder;

    await orderRepository.updateOrderStatus(orderId, status);

    await orderRepository.addOrderTimeline(
      orderId,
      "status_changed",
      `Estado actualizado de ${existingOrder.status} a ${status}.`,
      {
        oldStatus: existingOrder.status,
        newStatus: status,
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);

    if (NOTIFIABLE_STATUSES.includes(status)) {
      try {
        const { sendOrderStatusUpdate } = await import(
          "@/services/email/send-order-status-update"
        );
        await sendOrderStatusUpdate(order.id, existingOrder.status, status);
      } catch (err) {
        console.error("[order-service] Failed to send status update email:", err);
      }
    }

    queueOrderStatusChangedWebhook(order, existingOrder.status, status);

    return order;
  },

  async addNote(
    orderId: string,
    content: string,
    visibility: OrderNoteVisibility,
    createdBy = "system",
  ) {
    await getOrderOrThrow(orderId);

    const note = await orderRepository.addOrderNote(orderId, content, visibility, createdBy);
    await orderRepository.addOrderTimeline(
      orderId,
      "note_added",
      visibility === "customer" ? "Nota visible para cliente agregada." : "Nota interna agregada.",
      {
        noteId: note.id,
        visibility,
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);
    queueOrderUpdatedWebhook(order, {
      noteId: note.id,
      visibility,
    });

    return order;
  },

  async updateTracking(
    orderId: string,
    input: { trackingNumber?: string | null; trackingUrl?: string | null },
    createdBy = "system",
  ) {
    const existingOrder = await getOrderOrThrow(orderId);
    await orderRepository.updateOrderTracking(orderId, input);

    await orderRepository.addOrderTimeline(
      orderId,
      "tracking_updated",
      "Datos de tracking actualizados.",
      {
        oldTrackingNumber: existingOrder.trackingNumber,
        newTrackingNumber: input.trackingNumber ?? null,
        oldTrackingUrl: existingOrder.trackingUrl,
        newTrackingUrl: input.trackingUrl ?? null,
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);
    queueOrderUpdatedWebhook(order, {
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
    });

    return order;
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, createdBy = "system") {
    const existingOrder = await getOrderOrThrow(orderId);
    if (existingOrder.paymentStatus === paymentStatus) return existingOrder;

    await orderRepository.updateOrderPaymentStatus(orderId, paymentStatus);
    await orderRepository.addOrderTimeline(
      orderId,
      "payment_status_changed",
      `Estado de pago actualizado de ${existingOrder.paymentStatus} a ${paymentStatus}.`,
      {
        oldStatus: existingOrder.paymentStatus,
        newStatus: paymentStatus,
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);

    if (PAYMENT_EMAIL_STATUSES.includes(paymentStatus)) {
      try {
        const { sendPaymentStatusUpdate } = await import(
          "@/services/email/send-payment-status-update"
        );
        await sendPaymentStatusUpdate(orderId, existingOrder.paymentStatus, paymentStatus);
      } catch (error) {
        console.error("[order-service] Failed to send payment status email:", error);
      }
    }

    queueOrderPaymentStatusChangedWebhook(order, existingOrder.paymentStatus, paymentStatus);

    return order;
  },

  async editOrderItems(orderId: string, newItems: OrderItemInput[], createdBy = "system") {
    const existingOrder = await getOrderOrThrow(orderId);
    await orderRepository.updateOrderItems(orderId, newItems);
    await orderRepository.addOrderTimeline(
      orderId,
      "item_edited",
      "Productos del pedido actualizados.",
      {
        previousItems: existingOrder.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        nextItems: newItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);
    queueOrderUpdatedWebhook(order, {
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    });

    return order;
  },

  async applyManualDiscount(orderId: string, amount: string | number, createdBy = "system") {
    const existingOrder = await getOrderOrThrow(orderId);
    await orderRepository.applyOrderDiscount(orderId, amount);
    await orderRepository.addOrderTimeline(
      orderId,
      "discount_modified",
      "Descuento manual actualizado.",
      {
        oldDiscountAmount: existingOrder.discountAmount.toString(),
        newDiscountAmount: String(amount),
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);
    queueOrderUpdatedWebhook(order, {
      discountAmount: order.discountAmount.toString(),
      total: order.total.toString(),
    });

    return order;
  },

  async updateShippingAddress(orderId: string, address: OrderAddressInput, createdBy = "system") {
    const existingOrder = await getOrderOrThrow(orderId);
    await orderRepository.updateOrderAddress(orderId, address);
    await orderRepository.addOrderTimeline(
      orderId,
      "address_updated",
      "Direccion de envio actualizada.",
      {
        previousAddress: {
          firstName: existingOrder.firstName,
          lastName: existingOrder.lastName,
          address: existingOrder.address,
          apartment: existingOrder.apartment,
          province: existingOrder.province,
          city: existingOrder.city,
          phone: existingOrder.phone,
          idNumber: existingOrder.idNumber,
        },
        nextAddress: address,
      },
      createdBy,
    );

    const order = await refreshOrder(orderId);
    queueOrderUpdatedWebhook(order, {
      address,
    });

    return order;
  },

  async resendOrderConfirmation(orderId: string, createdBy = "system") {
    const order = await getOrderOrThrow(orderId);

    const { sendOrderConfirmation } = await import("@/services/email/send-order-confirmation");
    await sendOrderConfirmation(orderId);

    await orderRepository.addOrderTimeline(
      orderId,
      "email_resent",
      "Correo de confirmacion reenviado.",
      {
        templateKey: "order_confirmation",
      },
      createdBy,
    );

    return refreshOrder(order.id);
  },

  async resendOrderStatusEmail(orderId: string, createdBy = "system") {
    const order = await getOrderOrThrow(orderId);

    const { sendOrderStatusUpdate } = await import("@/services/email/send-order-status-update");
    await sendOrderStatusUpdate(orderId, order.status, order.status);

    await orderRepository.addOrderTimeline(
      orderId,
      "email_resent",
      "Correo de estado reenviado.",
      {
        templateKey: "order_status_update",
        status: order.status,
      },
      createdBy,
    );

    return refreshOrder(order.id);
  },

  async resendOrderEmail(
    orderId: string,
    templateKey: "order_confirmation" | "order_status_update",
    createdBy = "system",
  ) {
    if (templateKey === "order_confirmation") {
      return orderService.resendOrderConfirmation(orderId, createdBy);
    }

    return orderService.resendOrderStatusEmail(orderId, createdBy);
  },

  async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus, createdBy = "system") {
    const results = await Promise.allSettled(
      orderIds.map((orderId) => orderService.updateOrderStatus(orderId, status, createdBy)),
    );

    return {
      updated: results.filter((result) => result.status === "fulfilled").length,
      failed: results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => getErrorMessage(result.reason)),
    };
  },

  async getDashboardStats() {
    return orderRepository.getOrderStats();
  },

  async getOrderNotes(orderId: string) {
    await getOrderOrThrow(orderId);
    return orderRepository.getOrderNotes(orderId);
  },

  async getOrderTimeline(orderId: string) {
    await getOrderOrThrow(orderId);
    return orderRepository.getOrderTimeline(orderId);
  },
};
