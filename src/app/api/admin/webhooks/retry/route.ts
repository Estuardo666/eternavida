import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { retryFailedWebhooks } from "@/services/webhooks/retry-failed-webhooks";

const retrySchema = z.object({
  eventId: z.string().min(1).optional(),
  eventIds: z.array(z.string().min(1)).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json().catch(() => ({}));
    const payload = retrySchema.parse(body);
    const eventIds = payload.eventIds ?? (payload.eventId ? [payload.eventId] : undefined);
    const result = await retryFailedWebhooks({
      ...(eventIds?.length ? { eventIds } : {}),
      ...(payload.limit ? { limit: payload.limit } : {}),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Payload invalido.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-webhooks-retry]", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron reintentar los webhooks." },
      { status: 500 },
    );
  }
}
