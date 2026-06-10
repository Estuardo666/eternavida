import "server-only";
import { testEmailTemplate } from "@/server/email/templates/test-email.template";
import { sendTransactionalEmail } from "@/server/email/email-sender.service";

export async function sendTestEmail(to: string, _templateKey?: string) {
  const html = testEmailTemplate();

  return sendTransactionalEmail({
    to,
    templateKey: "test_email",
    subject: "Correo de prueba — Eterna Vida",
    html,
    metadata: { sentTo: to },
  });
}
