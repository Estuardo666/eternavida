import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type ClientPageUser = {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
};

export async function requireClientPageUser(): Promise<ClientPageUser> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirectTo=/cuenta/perfil");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/login?redirectTo=/cuenta/perfil");
  }

  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}
