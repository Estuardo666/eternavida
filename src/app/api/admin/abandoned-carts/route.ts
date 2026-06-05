import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  abandonedCartRepository,
  abandonedCartSettingsRepository,
} from "@/server/abandoned-cart/abandoned-cart.repository";
import { ABANDONED_CART_STATUSES } from "@/types/abandoned-cart";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? "carts";

    if (tab === "settings") {
      const settings = await abandonedCartSettingsRepository.getSettings();
      return NextResponse.json(
        { success: true, data: settings, timestamp },
        { status: 200 },
      );
    }

    if (tab === "stats") {
      const stats = await abandonedCartRepository.getStats();
      return NextResponse.json(
        { success: true, data: stats, timestamp },
        { status: 200 },
      );
    }

    const statusParam = searchParams.get("status");
    const status = statusParam && ABANDONED_CART_STATUSES.includes(statusParam as typeof ABANDONED_CART_STATUSES[number])
      ? (statusParam as typeof ABANDONED_CART_STATUSES[number])
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      abandonedCartRepository.listAll({ status, skip, take: limit }),
      abandonedCartRepository.countAll(status),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: items.map((item) => ({
            ...item,
            cartData: item.cartData,
            createdAt: item.createdAt.toISOString(),
            lastActivityAt: item.lastActivityAt.toISOString(),
            recoveredAt: item.recoveredAt?.toISOString() ?? null,
          })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin abandoned carts GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch data." }, timestamp },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp },
        { status: 400 },
      );
    }

    const data = body as {
      isEnabled?: boolean;
      steps?: unknown;
      maxRecoverySteps?: number;
      includeDiscount?: boolean;
      discountPercent?: number | null;
      couponPrefix?: string | null;
    };

    const settings = await abandonedCartSettingsRepository.updateSettings(data);

    return NextResponse.json(
      { success: true, data: settings, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin abandoned carts PATCH error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update settings." }, timestamp },
      { status: 500 },
    );
  }
}
