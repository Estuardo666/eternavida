import "server-only";
import {
  restockAlertRepository,
  restockAlertSettingsRepository,
} from "@/server/restock-alert/restock-alert.repository";
import { prisma } from "@/server/db/prisma";

export async function subscribeRestockAlertService(email: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock > 0) {
    throw new Error("Product is currently in stock");
  }

  return await restockAlertRepository.subscribe(email, productId);
}

export async function processRestockNotifications(productId: string) {
  const settings = await restockAlertSettingsRepository.getSettings();
  if (!settings.isEnabled) return { notified: 0 };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, stock: true },
  });

  if (!product || product.stock <= 0) return { notified: 0 };

  const alerts = await restockAlertRepository.findPendingByProduct(productId);
  if (alerts.length === 0) return { notified: 0 };

  const { sendTransactionalEmail } = await import("@/server/email/email-sender.service");
  const { restockNotificationTemplate } = await import(
    "@/server/email/restock-notification.template"
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec";
  let notified = 0;
  const notifiedIds: string[] = [];

  for (const alert of alerts) {
    try {
      const html = restockNotificationTemplate({
        productName: product.name,
        productUrl: `${baseUrl}/productos/${product.slug}`,
      });

      await sendTransactionalEmail({
        to: alert.email,
        templateKey: "restock-notification",
        subject: settings.emailSubject,
        html,
      });

      notifiedIds.push(alert.id);
      notified++;
    } catch (error) {
      console.error(`Failed to send restock notification to ${alert.email}:`, error);
    }
  }

  if (notifiedIds.length > 0) {
    await restockAlertRepository.markNotified(notifiedIds);
  }

  return { notified };
}
