import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { sendTestEmail } from "@/services/email/send-test-email";
import { z } from "zod";

const testEmailSchema = z.object({
  to: z.email(),
  templateKey: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  try {
    const body = await request.json();
    const { to, templateKey } = testEmailSchema.parse(body);

    const result = await sendTestEmail(to, templateKey);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Email inválido", details: err.issues },
        { status: 400 },
      );
    }
    console.error("[email-test]", err);
    return NextResponse.json({ success: false, error: "Error al enviar" }, { status: 500 });
  }
}
