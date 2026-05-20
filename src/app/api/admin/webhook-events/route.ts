import { NextRequest, NextResponse } from "next/server";
import { WebhookEventStatus } from "@prisma/client";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { webhookEventRepository } from "@/server/webhooks/webhook-event.repository";

function readMultiValue(searchParams: URLSearchParams, key: string) {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

const webhookEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.union([z.nativeEnum(WebhookEventStatus), z.array(z.nativeEnum(WebhookEventStatus))]).optional(),
  orderId: z.string().optional(),
  eventType: z.string().optional(),
  orderNumber: z.string().optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = readMultiValue(searchParams, "status");
    const query = webhookEventsQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      status: status?.length === 1 ? status[0] : status,
      orderId: searchParams.get("orderId") ?? undefined,
      eventType: searchParams.get("eventType") ?? undefined,
      orderNumber: searchParams.get("orderNumber") ?? undefined,
    });

    const normalizedQuery = {
      page: query.page,
      pageSize: query.pageSize,
      ...(query.status ? { status: query.status } : {}),
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.orderNumber ? { orderNumber: query.orderNumber } : {}),
    };

    const events = await webhookEventRepository.listEvents(normalizedQuery);
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Filtros invalidos.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-webhook-events-get]", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron cargar los eventos." },
      { status: 500 },
    );
  }
}
