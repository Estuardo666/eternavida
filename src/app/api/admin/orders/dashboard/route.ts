import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { getOrderDashboardStats } from "@/services/orders/get-order-dashboard-stats";

export async function GET(): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const data = await getOrderDashboardStats();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[admin-orders-dashboard]", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron cargar los KPIs." },
      { status: 500 },
    );
  }
}
