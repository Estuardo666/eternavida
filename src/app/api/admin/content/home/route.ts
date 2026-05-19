import { NextRequest, NextResponse } from "next/server";

import { adminHomeContentFormSchema } from "@/features/admin-content/schemas/admin-home-content.schema";
import { getHomeContentEditorData } from "@/services/admin-content/get-home-content-editor-data";
import { updateHomeContent } from "@/services/admin-content/update-home-content";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const data = await getHomeContentEditorData();

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin Home content GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load Home content editor data.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON.",
          },
          timestamp,
        },
        { status: 400 },
      );
    }

    const validationResult = adminHomeContentFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
          },
          timestamp,
        },
        { status: 422 },
      );
    }

    await updateHomeContent(validationResult.data);
    const data = await getHomeContentEditorData();

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin Home content PUT error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    const message = error instanceof Error ? error.message : "Failed to update Home content.";
    const status = message.includes("does not exist") ? 422 : 500;
    const code = status === 422 ? "VALIDATION_ERROR" : "INTERNAL_ERROR";

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
        },
        timestamp,
      },
      { status },
    );
  }
}
