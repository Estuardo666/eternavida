import "server-only";

import { externalApiConfigRepository } from "@/server/webhooks/external-api-config.repository";

export async function getWebhookConfig() {
  return externalApiConfigRepository.getConfig();
}
