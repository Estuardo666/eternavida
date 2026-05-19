import type { ReactNode } from "react";

import { AdminContentShell } from "@/components/layout/admin-content-shell";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { requireClientPageUser } from "@/server/auth/require-client-page-user";

type CuentaLayoutProps = Readonly<{ children: ReactNode }>;

export default async function CuentaLayout({ children }: CuentaLayoutProps) {
  const user = await requireClientPageUser();
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-surface-canvas">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_420px_at_50%_-120px,rgba(183,217,75,0.21),transparent_62%),linear-gradient(180deg,#FAFDF2_0%,#FFFFFF_36%)]" />
      <div className="relative px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <ClientSidebar userEmail={user.email} userName={userName} userImageUrl={user.imageUrl} />
          <main className="min-w-0 flex-1 overflow-x-clip">
            <AdminContentShell>{children}</AdminContentShell>
          </main>
        </div>
      </div>
    </div>
  );
}
