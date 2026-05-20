import "server-only";
import { orderRepository } from "@/server/orders/order.repository";
import { orderStatusUpdateTemplate } from "@/server/email/templates/order-status-update.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";
import type { OrderStatus } from "@prisma/client";

export async function sendOrderStatusUpdate(
  orderId: string,
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) return;

  const recipientEmail = order.guestEmail;
  if (!recipientEmail) return;

  const html = orderStatusUpdateTemplate(order, oldStatus);

  return sendTransactionalEmail({
    to: recipientEmail,
    templateKey: "order_status_update",
    subject: `Tu pedido ${order.orderNumber} — Estado actualizado`,
    html,
    metadata: { orderId: order.id, newStatus },
  });
}
