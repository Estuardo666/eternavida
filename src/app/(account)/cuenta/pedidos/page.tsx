import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";

export default function CuentaPedidosPage() {
  return (
    <div className="space-y-6">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="space-y-2">
          <AdminBreadcrumbs
            items={[
              { label: "Mi cuenta", href: "/cuenta/perfil" },
              { label: "Mis pedidos" },
            ]}
          />
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
          <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Mis pedidos</h1>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
          <ShoppingBagEmptyIcon />
          <div className="space-y-1.5">
            <h2 className="text-section-lg text-text-primary">Aún no tienes pedidos</h2>
            <p className="text-body-sm text-text-secondary">
              Tus pedidos aparecerán aquí una vez que completes tu primera compra.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-pill bg-brand px-5 py-2.5 text-label-md text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Explorar productos
          </a>
        </div>
      </section>
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
