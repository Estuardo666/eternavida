import "server-only";

import type { PaymentStatus } from "@prisma/client";

import { orderRepository } from "@/server/orders/order.repository";
import { paymentStatusUpdateTemplate } from "@/server/email/templates/payment-status-update.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";

export async function sendPaymentStatusUpdate(
  orderId: string,
  oldStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) return;

  const recipientEmail = order.guestEmail;
  if (!recipientEmail) return;

  const html = paymentStatusUpdateTemplate(order, oldStatus, newStatus);
  const subject =
    newStatus === "refunded"
      ? `Reembolso procesado — Pedido ${order.orderNumber}`
      : `Pago confirmado — Pedido ${order.orderNumber}`;

  return sendTransactionalEmail({
    to: recipientEmail,
    templateKey: "payment_status_update",
    subject,
    html,
    metadata: { orderId: order.id, oldStatus, newStatus },
  });
}
