import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

async function requireClientAuth(): Promise<{ success: true; userId: string } | { success: false; response: NextResponse }> {
  const timestamp = new Date().toISOString();
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." }, timestamp },
        { status: 401 },
      ),
    };
  }
  return { success: true, userId };
}

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireClientAuth();
    if (!authResult.success) return authResult.response;

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found." }, timestamp }, { status: 404 });
    }

    const unsafeMeta = user.unsafeMetadata as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        imageUrl: user.imageUrl ?? "",
        ruc: typeof unsafeMeta.ruc === "string" ? unsafeMeta.ruc : "",
      },
      timestamp,
    });
  } catch (error) {
    console.error("Client profile GET error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile." }, timestamp }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireClientAuth();
    if (!authResult.success) return authResult.response;

    const body = await request.json() as { firstName?: string; lastName?: string; username?: string; ruc?: string };

    const updatePayload: Record<string, string> = {};
    if (typeof body.firstName === "string") updatePayload.firstName = body.firstName.trim();
    if (typeof body.lastName === "string") updatePayload.lastName = body.lastName.trim();
    if (typeof body.username === "string" && body.username.trim()) updatePayload.username = body.username.trim();

    const client = await clerkClient();
    const updated = await client.users.updateUser(authResult.userId, updatePayload);

    // Save RUC to unsafeMetadata if provided
    if (typeof body.ruc === "string") {
      await client.users.updateUser(authResult.userId, {
        unsafeMetadata: { ruc: body.ruc.trim() },
      });
    }

    const unsafeMeta = updated.unsafeMetadata as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.emailAddresses[0]?.emailAddress ?? "",
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        username: updated.username ?? "",
        imageUrl: updated.imageUrl ?? "",
        ruc: typeof unsafeMeta.ruc === "string" ? unsafeMeta.ruc : "",
      },
      timestamp,
    });
  } catch (error) {
    console.error("Client profile PATCH error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update profile." }, timestamp }, { status: 500 });
  }
}
