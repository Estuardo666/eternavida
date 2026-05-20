import "server-only";
import { orderRepository } from "@/server/orders/order.repository";
import { emailSettingsRepository } from "@/server/email/email-settings.repository";
import { orderAdminNotificationTemplate } from "@/server/email/templates/order-admin-notification.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";

export async function sendAdminOrderNotification(orderId: string) {
  const [order, settings] = await Promise.all([
    orderRepository.getOrderById(orderId),
    emailSettingsRepository.getSettings(),
  ]);

  if (!order) return;
  if (settings.adminEmails.length === 0) return;

  const html = orderAdminNotificationTemplate(order);

  return sendTransactionalEmail({
    to: settings.adminEmails,
    templateKey: "order_admin_notification",
    subject: `Nuevo pedido ${order.orderNumber} — ${order.firstName} ${order.lastName}`,
    html,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });
}
