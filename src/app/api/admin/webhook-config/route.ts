import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { orderRepository } from "@/server/orders/order.repository";
import { serializeOrderForWebhook } from "@/server/webhooks/serialize-order";
import { dispatchWebhookEvent } from "@/server/webhooks/webhook-dispatcher.service";
import { webhookEventRepository } from "@/server/webhooks/webhook-event.repository";
import { getWebhookConfig } from "@/services/webhooks/get-webhook-config";
import { updateWebhookConfig } from "@/services/webhooks/update-webhook-config";

const webhookConfigSchema = z.object({
  enabled: z.boolean(),
  webhookUrl: z.string().trim().optional().default(""),
  secretToken: z.string().trim().optional().default(""),
  retryAttempts: z.coerce.number().int().min(1).max(10),
  timeoutMs: z.coerce.number().int().min(1000).max(60000),
});

function toResponseConfig(config: Awaited<ReturnType<typeof getWebhookConfig>>) {
  return {
    id: config.id,
    enabled: config.enabled,
    webhookUrl: config.webhookUrl,
    retryAttempts: config.retryAttempts,
    timeoutMs: config.timeoutMs,
    hasSecretToken: Boolean(config.secretToken),
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

export async function GET(): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const config = await getWebhookConfig();
    return NextResponse.json({ success: true, data: toResponseConfig(config) });
  } catch (error) {
    console.error("[admin-webhook-config-get]", error);
    return NextResponse.json(
      { success: false, error: "No se pudo cargar la configuracion." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const payload = webhookConfigSchema.parse(body);
    const config = await updateWebhookConfig(payload);

    return NextResponse.json({ success: true, data: toResponseConfig(config) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Payload invalido.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-webhook-config-put]", error);
    return NextResponse.json(
      { success: false, error: "No se pudo guardar la configuracion." },
      { status: 500 },
    );
  }
}

export async function POST(): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const config = await getWebhookConfig();
    if (!config.enabled || !config.webhookUrl) {
      return NextResponse.json(
        { success: false, error: "Debes habilitar el webhook y configurar la URL antes de probar." },
        { status: 400 },
      );
    }

    const latestOrder = await orderRepository.getAllOrders({ page: 1, pageSize: 1 });
    const order = latestOrder.items[0] ? await orderRepository.getOrderById(latestOrder.items[0].id) : null;

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Necesitas al menos un pedido para enviar un evento de prueba." },
        { status: 400 },
      );
    }

    const event = await webhookEventRepository.createEvent(order.id, "test.ping", {
      sentAt: new Date().toISOString(),
      order: serializeOrderForWebhook(order),
    });

    void dispatchWebhookEvent(event.id).catch((error) => {
      console.error("[admin-webhook-config-test]", error);
    });

    return NextResponse.json({ success: true, data: { eventId: event.id } });
  } catch (error) {
    console.error("[admin-webhook-config-post]", error);
    return NextResponse.json(
      { success: false, error: "No se pudo enviar el evento de prueba." },
      { status: 500 },
    );
  }
}
