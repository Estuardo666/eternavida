import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { orderListFiltersSchema } from "@/server/orders/order.schemas";
import { exportOrdersToCsv } from "@/services/orders/export-orders-to-csv";

function readMultiValue(searchParams: URLSearchParams, key: string) {
  const values = searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = readMultiValue(searchParams, "status");
    const paymentStatus = readMultiValue(searchParams, "paymentStatus");
    const orderIds = readMultiValue(searchParams, "orderIds");

    const filters = orderListFiltersSchema.parse({
      page: 1,
      pageSize: 100,
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

    const csv = await exportOrdersToCsv(normalizedFilters);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pedidos.csv"',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Filtros invalidos.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("[admin-orders-export]", error);
    return NextResponse.json(
      { success: false, error: "No se pudo exportar el CSV." },
      { status: 500 },
    );
  }
}
