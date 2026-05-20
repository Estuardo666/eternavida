import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { orderRepository } from "@/server/orders/order.repository";
import { adminOrderMutationSchema } from "@/server/orders/order.schemas";
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

  const { id } = await params;
  if (!id) return errorResponse(400, "Order id is required.");

  const order = await orderRepository.getOrderById(id);
  if (!order) return errorResponse(404, "Pedido no encontrado.");

  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  const { id } = await params;
  if (!id) return errorResponse(400, "Order id is required.");

  try {
    const body = await request.json();
    const mutation = adminOrderMutationSchema.parse(body);
    let order;

    if ("status" in mutation) {
      order = await orderService.updateOrderStatus(id, mutation.status, authResult.user.clerkUserId);
    } else if ("paymentStatus" in mutation) {
      order = await orderService.updatePaymentStatus(
        id,
        mutation.paymentStatus,
        authResult.user.clerkUserId,
      );
    } else if ("address" in mutation) {
      order = await orderService.updateShippingAddress(
        id,
        mutation.address,
        authResult.user.clerkUserId,
      );
    } else if ("items" in mutation) {
      order = await orderService.editOrderItems(id, mutation.items, authResult.user.clerkUserId);
    } else if ("discountAmount" in mutation) {
      order = await orderService.applyManualDiscount(
        id,
        mutation.discountAmount,
        authResult.user.clerkUserId,
      );
    } else {
      order = await orderService.updateTracking(
        id,
        {
          trackingNumber:
            mutation.trackingNumber === "" ? null : (mutation.trackingNumber ?? null),
          trackingUrl: mutation.trackingUrl ?? null,
        },
        authResult.user.clerkUserId,
      );
    }

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

    console.error("[admin-order-detail]", error);
    return errorResponse(500, "No se pudo actualizar el pedido.");
  }
}
