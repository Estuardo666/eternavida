import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/types/auth";

type AdminAuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; response: NextResponse };

function createAuthErrorResponse(
  status: 401 | 403 | 500,
  code: "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL_ERROR",
  message: string,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        response: createAuthErrorResponse(401, "UNAUTHORIZED", "Authentication required."),
      };
    }

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;

    if (role !== "admin" && role !== "staff") {
      return {
        success: false,
        response: createAuthErrorResponse(403, "FORBIDDEN", "Admin permission is required."),
      };
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? "";

    return {
      success: true,
      user: { clerkUserId: userId, email, role: role as "admin" | "staff" },
    };
  } catch {
    return {
      success: false,
      response: createAuthErrorResponse(500, "INTERNAL_ERROR", "Failed to verify authentication."),
    };
  }
}
