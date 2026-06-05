import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";

import { AdminContentShell } from "@/components/layout/admin-content-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";

type AdminDashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const user = await requireAdminPageUser();
  const clerkUser = await currentUser();
  const userImageUrl = clerkUser?.imageUrl ?? "";

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-0 lg:flex-row lg:items-start">
        <AdminSidebar userEmail={user.email} userRole={user.role} userImageUrl={userImageUrl} />
        <main className="min-w-0 flex-1 overflow-x-clip px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
          <AdminContentShell>{children}</AdminContentShell>
        </main>
      </div>
    </div>
  );
}
