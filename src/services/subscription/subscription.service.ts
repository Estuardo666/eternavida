import "server-only";
import {
  subscriptionRepository,
  subscriptionSettingsRepository,
} from "@/server/subscription/subscription.repository";
import { FREQUENCY_DAYS, type SubscriptionFrequency } from "@/types/subscription";

export async function createSubscriptionService(input: {
  clerkUserId: string;
  productId: string;
  frequency: SubscriptionFrequency;
  quantity: number;
}) {
  const existing = await subscriptionRepository.listByUser(input.clerkUserId);
  const activeCount = existing.filter((s) => s.status === "active").length;

  const settings = await subscriptionSettingsRepository.getSettings();
  if (activeCount >= settings.maxSubscriptionsPerUser) {
    throw new Error("Has alcanzado el máximo de suscripciones activas");
  }

  const duplicate = existing.find(
    (s) => s.productId === input.productId && s.status === "active",
  );
  if (duplicate) {
    throw new Error("Ya tienes una suscripción activa para este producto");
  }

  const days = FREQUENCY_DAYS[input.frequency];
  const nextOrderAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return await subscriptionRepository.create({
    ...input,
    nextOrderAt,
  });
}

export async function processSubscriptionReminders() {
  const settings = await subscriptionSettingsRepository.getSettings();
  if (!settings.reminderEnabled) return { sent: 0 };

  const subscriptions = await subscriptionRepository.findDueForReminder(
    settings.reminderDaysBefore,
  );

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      const { sendTransactionalEmail } = await import("@/server/email/email-sender.service");
      const { subscriptionReminderTemplate } = await import(
        "@/server/email/subscription-reminder.template"
      );

      const price = Number(sub.product.discountPrice ?? sub.product.price);
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dermatologika.com";

      const html = subscriptionReminderTemplate({
        productName: sub.product.name,
        productUrl: `${baseUrl}/productos/${sub.product.slug}`,
        quantity: sub.quantity,
        price,
        nextOrderDate: sub.nextOrderAt.toLocaleDateString("es-MX"),
      });

      await sendTransactionalEmail({
        to: sub.clerkUserId,
        templateKey: "subscription-reminder",
        subject: settings.reminderEmailSubject ?? "Recordatorio: tu reposición está próxima",
        html,
      });

      sent++;
    } catch (error) {
      console.error(`Failed to send subscription reminder for ${sub.id}:`, error);
    }
  }

  return { sent };
}
