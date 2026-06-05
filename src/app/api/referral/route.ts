import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateReferralCodeService, getReferralStatsService } from "@/services/referral/referral.service";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      );
    }

    const stats = await getReferralStatsService(userId);

    if (!stats.code) {
      const code = await generateReferralCodeService(userId);
      return NextResponse.json(
        { success: true, data: { ...stats, code }, timestamp },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: true, data: stats, timestamp },
      { status: 200 },
    );
  } catch (error) {
    console.error("Referral GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch referral data." }, timestamp },
      { status: 500 },
    );
  }
}
