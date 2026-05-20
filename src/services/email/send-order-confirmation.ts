import "server-only";
import { orderRepository } from "@/server/orders/order.repository";
import { orderConfirmationTemplate } from "@/server/email/templates/order-confirmation.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";

export async function sendOrderConfirmation(orderId: string) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) return;

  const recipientEmail = order.guestEmail;
  if (!recipientEmail) return;

  const html = orderConfirmationTemplate(order);
  const subject = order.status === "pending"
    ? `Pedido recibido — pendiente de pago (${order.orderNumber})`
    : `Tu pedido ${order.orderNumber} ha sido recibido`;

  return sendTransactionalEmail({
    to: recipientEmail,
    templateKey: "order_confirmation",
    subject,
    html,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });
}
