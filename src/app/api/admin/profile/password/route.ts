import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp }, { status: 401 });
    }

    const body = await request.json() as { newPassword?: string; confirmPassword?: string };

    if (!body.newPassword || body.newPassword.length < 8) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "La nueva contraseña debe tener al menos 8 caracteres." }, timestamp }, { status: 422 });
    }

    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Las contraseñas no coinciden." }, timestamp }, { status: 422 });
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, { password: body.newPassword });

    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error("Admin profile password POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update password." }, timestamp }, { status: 500 });
  }
}
