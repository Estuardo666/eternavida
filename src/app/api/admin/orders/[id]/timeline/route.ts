import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
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
    const timeline = await orderService.getOrderTimeline(id);
    return NextResponse.json({ success: true, data: timeline });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return errorResponse(404, "Pedido no encontrado.");
    }

    console.error("[admin-order-timeline-get]", error);
    return errorResponse(500, "No se pudo cargar el timeline.");
  }
}
