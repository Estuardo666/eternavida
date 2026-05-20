import "server-only";

import { orderRepository, type OrderQueryParams } from "@/server/orders/order.repository";

function escapeCsvValue(value: string): string {
  const normalized = value.replace(/\r?\n/g, " ").replace(/"/g, '""');
  return /[;"\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

function joinRow(values: Array<string | number | null | undefined>): string {
  return values.map((value) => escapeCsvValue(value == null ? "" : String(value))).join(";");
}

export async function exportOrdersToCsv(filters: OrderQueryParams = {}) {
  const orders = await orderRepository.getOrdersForExport(filters);

  const header = joinRow([
    "orderNumber",
    "createdAt",
    "firstName",
    "lastName",
    "email",
    "phone",
    "province",
    "city",
    "address",
    "status",
    "paymentStatus",
    "shippingMethodName",
    "paymentMethodName",
    "subtotal",
    "shippingCost",
    "discountAmount",
    "taxAmount",
    "total",
    "trackingNumber",
    "items",
  ]);

  const rows = orders.map((order) =>
    joinRow([
      order.orderNumber,
      order.createdAt.toISOString(),
      order.firstName,
      order.lastName,
      order.guestEmail,
      order.phone,
      order.province,
      order.city,
      [order.address, order.apartment].filter(Boolean).join(", "),
      order.status,
      order.paymentStatus,
      order.shippingMethodName,
      order.paymentMethodName,
      order.subtotal.toString(),
      order.shippingCost.toString(),
      order.discountAmount.toString(),
      order.taxAmount.toString(),
      order.total.toString(),
      order.trackingNumber,
      order.items.map((item) => `${item.name} x ${item.quantity}`).join(" | "),
    ]),
  );

  return `\ufeff${[header, ...rows].join("\r\n")}`;
}
