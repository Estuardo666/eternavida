import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { emailLogRepository } from "@/server/email/email-log.repository";
import type { EmailStatus } from "@prisma/client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminAuth();
  if (!authResult.success) return authResult.response;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");
  const status = searchParams.get("status") as EmailStatus | null;
  const templateKey = searchParams.get("templateKey");

  const result = await emailLogRepository.listLogs({
    page,
    pageSize,
    ...(status ? { status } : {}),
    ...(templateKey ? { templateKey } : {}),
  });

  const stats = await emailLogRepository.getStats();

  return NextResponse.json({ success: true, data: { ...result, stats } });
}
