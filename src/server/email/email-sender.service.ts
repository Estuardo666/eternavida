import "server-only";
import type { Prisma } from "@prisma/client";

import { resend } from "./resend.client";
import { emailSettingsRepository } from "./email-settings.repository";
import { emailLogRepository } from "./email-log.repository";

export type SendEmailInput = {
  to: string | string[];
  templateKey: string;
  subject: string;
  html: string;
  metadata?: Prisma.InputJsonObject;
};

export type SendEmailResult =
  | { success: true; logId: string; resendId: string; skipped?: false }
  | { success: true; logId: string; skipped: true; reason: string }
  | { success: false; logId: string; error: string };

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const settings = await emailSettingsRepository.getSettings();

  const toArray = Array.isArray(input.to) ? input.to : [input.to];

  const allowedEmails = new Set([
    ...settings.adminEmails.map((e) => e.toLowerCase()),
    ...settings.testEmails.map((e) => e.toLowerCase()),
  ]);

  const recipients = settings.testMode
    ? toArray.filter((e) => allowedEmails.has(e.toLowerCase()))
    : toArray;

  const log = await emailLogRepository.createLog({
    recipient: recipients.join(", ") || toArray.join(", "),
    templateKey: input.templateKey,
    subject: input.subject,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  });

  if (recipients.length === 0) {
    const reason = settings.testMode
      ? "El correo fue saltado porque Modo test está activo y el destinatario no está en Correos administrativos o Correos de prueba."
      : "El correo fue saltado porque no hay destinatarios válidos para este envío.";

    await emailLogRepository.updateLogStatus(log.id, "skipped", { error: reason });
    return { success: true, logId: log.id, skipped: true, reason };
  }

  const from = `${settings.fromName} <${settings.fromEmail}>`;

  try {
    const result = await resend.emails.send({
      from,
      to: recipients,
      ...(settings.replyTo ? { replyTo: settings.replyTo } : {}),
      subject: input.subject,
      html: input.html,
    });

    if (result.error) {
      await emailLogRepository.updateLogStatus(log.id, "failed", {
        error: result.error.message,
      });
      return { success: false, logId: log.id, error: result.error.message };
    }

    await emailLogRepository.updateLogStatus(log.id, "sent", {
      resendId: result.data?.id,
    });

    return { success: true, logId: log.id, resendId: result.data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email-sender] Failed to send email:", message);
    await emailLogRepository.updateLogStatus(log.id, "failed", { error: message });
    return { success: false, logId: log.id, error: message };
  }
}
