import "server-only";

import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

import type { OrderWithRelations } from "@/server/orders/order.repository";
import { externalApiConfigRepository } from "@/server/webhooks/external-api-config.repository";
import { serializeOrderForWebhook } from "@/server/webhooks/serialize-order";
import { dispatchWebhookEvent } from "@/server/webhooks/webhook-dispatcher.service";
import { webhookEventRepository } from "@/server/webhooks/webhook-event.repository";

async function enqueueWebhookEvent(order: OrderWithRelations, eventType: string, payload: Prisma.InputJsonValue) {
  const config = await externalApiConfigRepository.getConfig();
  if (!config.enabled || !config.webhookUrl) return null;

  const event = await webhookEventRepository.createEvent(order.id, eventType, payload);
  void dispatchWebhookEvent(event.id).catch((error) => {
    console.error("[webhook-trigger] Failed to dispatch webhook event:", error);
  });

  return event;
}

export async function triggerOrderCreated(order: OrderWithRelations) {
  return enqueueWebhookEvent(order, "order.created", {
    order: serializeOrderForWebhook(order),
  });
}

export async function triggerOrderUpdated(order: OrderWithRelations, changes: Prisma.InputJsonValue) {
  return enqueueWebhookEvent(order, "order.updated", {
    order: serializeOrderForWebhook(order),
    changes,
  });
}

export async function triggerOrderStatusChanged(
  order: OrderWithRelations,
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
) {
  return enqueueWebhookEvent(order, "order.status_changed", {
    order: serializeOrderForWebhook(order),
    changes: {
      oldStatus,
      newStatus,
    },
  });
}

export async function triggerOrderPaymentStatusChanged(
  order: OrderWithRelations,
  oldStatus: PaymentStatus,
  newStatus: PaymentStatus,
) {
  return enqueueWebhookEvent(order, "order.payment_status_changed", {
    order: serializeOrderForWebhook(order),
    changes: {
      oldStatus,
      newStatus,
    },
  });
}
