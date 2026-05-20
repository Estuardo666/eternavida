import "server-only";

import { createHmac } from "node:crypto";

import { WebhookEventStatus } from "@prisma/client";

import { externalApiConfigRepository } from "@/server/webhooks/external-api-config.repository";
import { webhookEventRepository } from "@/server/webhooks/webhook-event.repository";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown webhook error.";
}

export async function dispatchWebhookEvent(eventId: string) {
  const [config, event] = await Promise.all([
    externalApiConfigRepository.getConfig(),
    webhookEventRepository.getEventById(eventId),
  ]);

  if (!event) {
    throw new Error("WEBHOOK_EVENT_NOT_FOUND");
  }

  if (!config.enabled || !config.webhookUrl) {
    await webhookEventRepository.markFailed(eventId, "Webhook disabled or URL not configured.");
    return;
  }

  if (event.attemptCount >= config.retryAttempts) {
    await webhookEventRepository.markFailed(eventId, "Retry attempts exhausted.");
    return;
  }

  await webhookEventRepository.incrementAttempt(eventId);

  const payload = {
    event: event.eventType,
    timestamp: new Date().toISOString(),
    payload: event.payload,
  };
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": event.eventType,
    "X-Webhook-Id": event.id,
  };

  if (config.secretToken) {
    const signature = createHmac("sha256", config.secretToken).update(body).digest("hex");
    headers["X-Webhook-Signature"] = `sha256=${signature}`;
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    const responseBody = await response.text();

    if (response.ok) {
      await webhookEventRepository.markDelivered(eventId, response.status, responseBody);
      return;
    }

    const nextStatus =
      event.attemptCount + 1 < config.retryAttempts
        ? WebhookEventStatus.retrying
        : WebhookEventStatus.failed;

    await webhookEventRepository.markFailed(
      eventId,
      `Webhook request failed with status ${response.status}.`,
      response.status,
      responseBody,
      nextStatus,
    );
  } catch (error) {
    const nextStatus =
      event.attemptCount + 1 < config.retryAttempts
        ? WebhookEventStatus.retrying
        : WebhookEventStatus.failed;

    await webhookEventRepository.markFailed(eventId, getErrorMessage(error), undefined, null, nextStatus);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
