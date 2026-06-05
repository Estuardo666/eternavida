import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import {
  restockAlertRepository,
  restockAlertSettingsRepository,
} from "@/server/restock-alert/restock-alert.repository";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? "alerts";

    if (tab === "settings") {
      const settings = await restockAlertSettingsRepository.getSettings();
      return NextResponse.json(
        { success: true, data: settings, timestamp },
        { status: 200 },
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      restockAlertRepository.listAll({ skip, take: limit }),
      restockAlertRepository.countAll(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            notifiedAt: item.notifiedAt?.toISOString() ?? null,
          })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restock alerts GET error:", {
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
      emailSubject?: string;
      maxAlertsPerProduct?: number;
      expiresAfterDays?: number;
    };

    const settings = await restockAlertSettingsRepository.updateSettings(data);

    return NextResponse.json(
      { success: true, data: settings, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin restock alerts PATCH error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update settings." }, timestamp },
      { status: 500 },
    );
  }
}
