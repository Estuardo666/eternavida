import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { orderRepository } from "@/server/orders/order.repository";
import { renderOrderPdfBuffer } from "@/server/orders/render-order-pdf";

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return errorResponse(401, "Unauthorized");

  try {
    const { id } = await params;
    const order = await orderRepository.getOrderByUserIdAndOrderId(id, userId);

    if (!order) return errorResponse(404, "Pedido no encontrado.");

    const buffer = await renderOrderPdfBuffer(order);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedido-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[client-order-export-pdf]", error);
    return errorResponse(500, "No se pudo generar el PDF.");
  }
}
