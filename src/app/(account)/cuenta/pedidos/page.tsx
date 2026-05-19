"use client";

import { motion } from "framer-motion";

export default function CuentaPedidosPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Mis pedidos</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
        className="rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-8"
      >
        <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
          <ShoppingBagEmptyIcon />
          <div className="space-y-1.5">
            <h2 className="text-section-lg text-text-primary">Aún no tienes pedidos</h2>
            <p className="text-body-sm text-text-secondary">
              Tus pedidos aparecerán aquí una vez que completes tu primera compra.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Explorar productos
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function ShoppingBagEmptyIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="h-20 w-20 text-text-muted opacity-40"
    >
      <rect x="14" y="26" width="52" height="42" rx="6" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M28 26C28 18.268 33.373 12 40 12C46.627 12 52 18.268 52 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M28 38h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
