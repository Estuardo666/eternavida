import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { orderRepository } from "@/server/orders/order.repository";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const result = await orderRepository.getOrdersByUserId(userId, { page, pageSize });

  return NextResponse.json({ success: true, data: result });
}
