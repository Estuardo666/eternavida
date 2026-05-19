import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { AuthenticatedUser } from "@/types/auth";

export async function requireAdminPageUser(): Promise<AuthenticatedUser> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirectTo=/admin/leads");
  }

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  return { email, role: role as "admin" | "staff" };
}
