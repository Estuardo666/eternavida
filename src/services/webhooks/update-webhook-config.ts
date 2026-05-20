import "server-only";

import {
  externalApiConfigRepository,
  type ExternalApiConfigInput,
} from "@/server/webhooks/external-api-config.repository";

export async function updateWebhookConfig(input: ExternalApiConfigInput) {
  return externalApiConfigRepository.updateConfig(input);
}
