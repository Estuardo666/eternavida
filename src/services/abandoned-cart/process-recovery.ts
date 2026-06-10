import "server-only";
import {
  abandonedCartRepository,
  abandonedCartSettingsRepository,
} from "@/server/abandoned-cart/abandoned-cart.repository";
import type { CartDataItem } from "@/types/abandoned-cart";

export async function trackCartActivityService(input: {
  clerkUserId?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  cartData: CartDataItem[];
}) {
  const settings = await abandonedCartSettingsRepository.getSettings();
  if (!settings.isEnabled) return null;

  return await abandonedCartRepository.trackActivity(input);
}

export async function processAbandonedCartRecovery() {
  const settings = await abandonedCartSettingsRepository.getSettings();
  if (!settings.isEnabled) return { processed: 0 };

  const steps = settings.steps as unknown as Array<{
    delayHours: number;
    subject: string;
    template: string;
  }>;

  let processed = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;

    const carts = await abandonedCartRepository.findEligibleForRecovery(i, step.delayHours);

    for (const cart of carts) {
      try {
        const email = cart.clerkUserId ? null : cart.guestEmail;
        if (!email && !cart.clerkUserId) continue;

        const { sendTransactionalEmail } = await import("@/server/email/email-sender.service");
        const { abandonedCartReminderTemplate } = await import(
          "@/server/email/abandoned-cart-reminder.template"
        );

        const cartItems = cart.cartData as unknown as CartDataItem[];
        const html = abandonedCartReminderTemplate({
          items: cartItems,
          cartUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec"}/checkout`,
          step: i + 1,
        });

        const recipientEmail = email || cart.guestEmail;
        if (!recipientEmail) continue;

        await sendTransactionalEmail({
          to: recipientEmail,
          templateKey: "abandoned-cart-reminder",
          subject: step.subject,
          html,
        });

        await abandonedCartRepository.createRecoveryLog(cart.id, i);
        await abandonedCartRepository.incrementRecoveryStep(cart.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process abandoned cart ${cart.id}:`, error);
      }
    }
  }

  return { processed };
}
