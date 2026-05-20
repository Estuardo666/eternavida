import "server-only";
import { emailSettingsRepository } from "@/server/email/email-settings.repository";
import type { EmailSettingsInput } from "@/server/email/email-settings.repository";

export async function getEmailSettings() {
  return emailSettingsRepository.getSettings();
}

export async function updateEmailSettings(input: EmailSettingsInput) {
  return emailSettingsRepository.updateSettings(input);
}
