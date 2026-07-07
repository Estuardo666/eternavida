import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { getQrGeneratorData } from "@/services/qr-generator/get-qr-generator-data";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const data = await getQrGeneratorData();

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin QR generator GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load QR generator data.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}
