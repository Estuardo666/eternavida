import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  subscriptionRepository,
  subscriptionSettingsRepository,
} from "@/server/subscription/subscription.repository";
import { SUBSCRIPTION_STATUSES } from "@/types/subscription";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? "subscriptions";

    if (tab === "settings") {
      const settings = await subscriptionSettingsRepository.getSettings();
      return NextResponse.json({ success: true, data: settings, timestamp }, { status: 200 });
    }

    if (tab === "stats") {
      const stats = await subscriptionRepository.getStats();
      return NextResponse.json({ success: true, data: stats, timestamp }, { status: 200 });
    }

    const statusParam = searchParams.get("status");
    const status = statusParam && SUBSCRIPTION_STATUSES.includes(statusParam as typeof SUBSCRIPTION_STATUSES[number])
      ? (statusParam as typeof SUBSCRIPTION_STATUSES[number])
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      subscriptionRepository.listAll({ status, skip, take: limit }),
      subscriptionRepository.countAll(status),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            nextOrderAt: item.nextOrderAt.toISOString(),
            lastOrderAt: item.lastOrderAt?.toISOString() ?? null,
          })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin subscriptions GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
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
    if (!authResult.success) return authResult.response;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp },
        { status: 400 },
      );
    }

    const settings = await subscriptionSettingsRepository.updateSettings(body as Record<string, unknown>);

    return NextResponse.json({ success: true, data: settings, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin subscriptions PATCH error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update settings." }, timestamp },
      { status: 500 },
    );
  }
}
