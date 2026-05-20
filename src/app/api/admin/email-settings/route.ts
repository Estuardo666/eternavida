import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { emailSettingsRepository, emailSettingsSchema } from "@/server/email/email-settings.repository";
import { z } from "zod";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  const settings = await emailSettingsRepository.getSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const validated = emailSettingsSchema.parse(body);
    const settings = await emailSettingsRepository.updateSettings(validated);
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 });
  }
}
