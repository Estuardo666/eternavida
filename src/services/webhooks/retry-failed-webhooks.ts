import "server-only";

import { dispatchWebhookEvent } from "@/server/webhooks/webhook-dispatcher.service";
import { webhookEventRepository } from "@/server/webhooks/webhook-event.repository";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown retry error.";
}

export async function retryFailedWebhooks(input: { eventIds?: string[]; limit?: number } = {}) {
  const eventIds =
    input.eventIds && input.eventIds.length > 0
      ? input.eventIds
      : (await webhookEventRepository.listRetryableEvents(input.limit ?? 50)).map((event) => event.id);

  const results = await Promise.allSettled(eventIds.map((eventId) => dispatchWebhookEvent(eventId)));

  return {
    requested: eventIds.length,
    delivered: results.filter((result) => result.status === "fulfilled").length,
    failed: results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => getErrorMessage(result.reason)),
  };
}
