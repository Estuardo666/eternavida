import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ProfileClientForm } from "@/features/client-profile/components/profile-client-form";
import { requireClientPageUser } from "@/server/auth/require-client-page-user";

export default async function CuentaPerfilPage() {
  await requireClientPageUser();

  const user = await currentUser();
  if (!user) redirect("/login?redirectTo=/cuenta/perfil");

  const unsafeMeta = user.unsafeMetadata as Record<string, unknown>;

  return (
    <ProfileClientForm
      initialProfile={{
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        imageUrl: user.imageUrl ?? "",
        ruc: typeof unsafeMeta.ruc === "string" ? unsafeMeta.ruc : "",
      }}
    />
  );
}
