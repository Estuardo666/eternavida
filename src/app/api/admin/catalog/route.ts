import { NextRequest, NextResponse } from "next/server";

import { getCatalogAdminData } from "@/services/admin-catalog/get-catalog-admin-data";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const data = await getCatalogAdminData();

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin catalog GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load catalog admin data.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}
