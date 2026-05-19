import type { ReactNode } from "react";

import { AdminContentShell } from "@/components/layout/admin-content-shell";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { requireClientPageUser } from "@/server/auth/require-client-page-user";

type CuentaLayoutProps = Readonly<{ children: ReactNode }>;

export default async function CuentaLayout({ children }: CuentaLayoutProps) {
  const user = await requireClientPageUser();
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="min-h-screen overflow-x-clip bg-surface-subtle px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
        <ClientSidebar userEmail={user.email} userName={userName} userImageUrl={user.imageUrl} />
        <main className="min-w-0 flex-1 overflow-x-clip">
          <AdminContentShell>{children}</AdminContentShell>
        </main>
      </div>
    </div>
  );
}
