import type { ReactNode } from "react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { CartSidebar } from "@/features/cart/components/cart-sidebar";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen bg-surface-subtle">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-soft/45 via-surface-subtle to-transparent"
      />
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-modal rounded-md bg-surface-canvas px-4 py-2 text-body-sm text-text-primary shadow-sm focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        Saltar al contenido
      </a>

      <div className="relative flex min-h-screen flex-col">
        <PublicHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <PublicFooter />
      </div>

      <CartSidebar />
    </div>
  );
}
