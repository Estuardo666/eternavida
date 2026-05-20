import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { orderService } from "@/server/orders/order.service";
import { createOrderSchema } from "@/server/orders/order.schemas";
import { getPaymentMethodById } from "@/server/payment/payment-method.repository";
import { z } from "zod";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { userId } = await auth();
    if (userId) {
      body.clerkUserId = userId;
    }

    const parsedInput = createOrderSchema.parse(body);
    const paymentMethod = parsedInput.paymentMethodId
      ? await getPaymentMethodById(parsedInput.paymentMethodId)
      : null;
    const input = paymentMethod?.initialOrderStatus === "confirmed"
      ? { ...parsedInput, status: OrderStatus.confirmed }
      : paymentMethod?.initialOrderStatus === "pending"
        ? { ...parsedInput, status: OrderStatus.pending }
        : parsedInput;
    const order = await orderService.createOrderFromCheckout(input);

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: err.issues },
        { status: 400 },
      );
    }
    console.error("[create-order]", err);
    return NextResponse.json(
      { success: false, error: "Error al crear el pedido" },
      { status: 500 },
    );
  }
}
