import "server-only";
import { emailSettingsRepository } from "@/server/email/email-settings.repository";
import { contactLeadNotificationTemplate } from "@/server/email/templates/contact-lead-notification.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";
import type { ContactLead } from "@/server/email/templates/contact-lead-notification.template";

export async function sendContactLeadNotification(lead: ContactLead) {
  const settings = await emailSettingsRepository.getSettings();
  if (settings.adminEmails.length === 0) return;

  const html = contactLeadNotificationTemplate(lead);

  return sendTransactionalEmail({
    to: settings.adminEmails,
    templateKey: "contact_lead_notification",
    subject: `Nuevo lead: ${lead.fullName}`,
    html,
    metadata: { leadId: lead.id },
  });
}
