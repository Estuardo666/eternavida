import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { orderService } from "@/server/orders/order.service";
import { bulkOrderStatusSchema, orderListFiltersSchema } from "@/server/orders/order.schemas";
import { getAdminOrders } from "@/services/orders/get-admin-orders";

function readMultiValue(searchParams: URLSearchParams, key: string) {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  const { searchParams } = new URL(request.url);
  try {
    const status = readMultiValue(searchParams, "status");
    const paymentStatus = readMultiValue(searchParams, "paymentStatus");
    const orderIds = readMultiValue(searchParams, "orderIds");

    const filters = orderListFiltersSchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      status: status?.length === 1 ? status[0] : status,
      paymentStatus: paymentStatus?.length === 1 ? paymentStatus[0] : paymentStatus,
      shippingMethodName: searchParams.get("shippingMethodName") ?? undefined,
      paymentMethodName: searchParams.get("paymentMethodName") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      totalMin: searchParams.get("totalMin") ?? undefined,
      totalMax: searchParams.get("totalMax") ?? undefined,
      orderIds,
    });

    const normalizedFilters = {
      page: filters.page,
      pageSize: filters.pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
      ...(filters.shippingMethodName ? { shippingMethodName: filters.shippingMethodName } : {}),
      ...(filters.paymentMethodName ? { paymentMethodName: filters.paymentMethodName } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      ...(filters.totalMin != null ? { totalMin: filters.totalMin } : {}),
      ...(filters.totalMax != null ? { totalMax: filters.totalMax } : {}),
      ...(filters.orderIds?.length ? { orderIds: filters.orderIds } : {}),
    };

    const result = await getAdminOrders(normalizedFilters);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Filtros invalidos.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-orders-list]", error);
    return errorResponse(500, "No se pudieron cargar los pedidos.");
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const payload = bulkOrderStatusSchema.parse(body);
    const result = await orderService.bulkUpdateOrderStatus(
      payload.orderIds,
      payload.status,
      authResult.user.clerkUserId,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Payload invalido.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-orders-bulk-update]", error);
    return errorResponse(500, "No se pudieron actualizar los pedidos.");
  }
}
