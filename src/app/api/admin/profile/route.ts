import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found." }, timestamp }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        imageUrl: user.imageUrl ?? "",
        role: (user.publicMetadata?.role as string) ?? "",
      },
      timestamp,
    });
  } catch (error) {
    console.error("Admin profile GET error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile." }, timestamp }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp }, { status: 401 });
    }

    const body = await request.json() as { firstName?: string; lastName?: string; username?: string };

    const updatePayload: Record<string, string> = {};
    if (typeof body.firstName === "string") updatePayload.firstName = body.firstName.trim();
    if (typeof body.lastName === "string") updatePayload.lastName = body.lastName.trim();
    if (typeof body.username === "string" && body.username.trim()) updatePayload.username = body.username.trim();

    const client = await clerkClient();
    const updated = await client.users.updateUser(userId, updatePayload);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.emailAddresses[0]?.emailAddress ?? "",
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        username: updated.username ?? "",
        imageUrl: updated.imageUrl ?? "",
        role: (updated.publicMetadata?.role as string) ?? "",
      },
      timestamp,
    });
  } catch (error) {
    console.error("Admin profile PATCH error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update profile." }, timestamp }, { status: 500 });
  }
}
