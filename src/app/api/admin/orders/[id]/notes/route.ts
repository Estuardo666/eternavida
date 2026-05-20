import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { orderNoteInputSchema } from "@/server/orders/order.schemas";
import { orderService } from "@/server/orders/order.service";

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    const notes = await orderService.getOrderNotes(id);
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return errorResponse(404, "Pedido no encontrado.");
    }

    console.error("[admin-order-notes-get]", error);
    return errorResponse(500, "No se pudieron cargar las notas.");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const payload = orderNoteInputSchema.parse(body);
    const order = await orderService.addNote(
      id,
      payload.content,
      payload.visibility,
      authResult.user.clerkUserId,
    );

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Payload invalido.", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return errorResponse(404, "Pedido no encontrado.");
    }

    console.error("[admin-order-notes-post]", error);
    return errorResponse(500, "No se pudo agregar la nota.");
  }
}
