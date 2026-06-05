import type { ReactNode } from "react";

import { AdminContentShell } from "@/components/layout/admin-content-shell";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { PublicHeader } from "@/components/layout/public-header";
import { requireClientPageUser } from "@/server/auth/require-client-page-user";

type CuentaLayoutProps = Readonly<{ children: ReactNode }>;

export default async function CuentaLayout({ children }: CuentaLayoutProps) {
  const user = await requireClientPageUser();
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="relative min-h-screen bg-surface-subtle">
      <PublicHeader />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-0 lg:flex-row lg:items-start">
        <ClientSidebar userEmail={user.email} userName={userName} userImageUrl={user.imageUrl} />
        <main className="min-w-0 flex-1 overflow-x-clip px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
          <AdminContentShell>{children}</AdminContentShell>
        </main>
      </div>
    </div>
  );
}
