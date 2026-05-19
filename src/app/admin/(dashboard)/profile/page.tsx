import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ProfileAdminForm } from "@/features/admin-profile/components/profile-admin-form";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";

export default async function AdminProfilePage() {
  await requireAdminPageUser();

  const user = await currentUser();
  if (!user) redirect("/login?redirectTo=/admin/profile");

  return (
    <ProfileAdminForm
      initialProfile={{
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        imageUrl: user.imageUrl ?? "",
        role: (user.publicMetadata?.role as string) ?? "",
      }}
    />
  );
}
