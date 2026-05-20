import "server-only";

import { OrderNoteVisibility, Prisma } from "@prisma/client";

import type { OrderWithRelations } from "@/server/orders/order.repository";

function serializeValue(value: unknown): Prisma.InputJsonValue | null {
  if (value == null) return null;

  if (value instanceof Prisma.Decimal) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]),
    ) as Prisma.InputJsonObject;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return String(value);
}

export function serializeOrderForWebhook(order: OrderWithRelations): Prisma.InputJsonValue {
  const { webhookEvents: _webhookEvents, ...rest } = order;

  return serializeValue({
    ...rest,
    notes: order.notes.filter((note) => note.visibility === OrderNoteVisibility.customer),
  }) as Prisma.InputJsonObject;
}
