import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { orderRepository } from "@/server/orders/order.repository";
import { orderService } from "@/server/orders/order.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await orderRepository.getOrderByUserIdAndOrderId(id, userId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[order GET]", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pedido" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as { archived?: boolean };

    const order = await orderRepository.getOrderByUserIdAndOrderId(id, userId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    if (typeof body.archived === "boolean") {
      const updated = await orderRepository.updateOrderArchived(id, body.archived);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "No se proporcionaron campos para actualizar" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[order PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar pedido" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as { action: string };

    const order = await orderRepository.getOrderByUserIdAndOrderId(id, userId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    if (body.action === "resend-confirmation") {
      await orderService.resendOrderConfirmation(id, userId);
      return NextResponse.json({ success: true, message: "Correo de confirmación reenviado" });
    }

    return NextResponse.json(
      { success: false, error: "Acción no válida" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[order POST]", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar acción" },
      { status: 500 },
    );
  }
}
