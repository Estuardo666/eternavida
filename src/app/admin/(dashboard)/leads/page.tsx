import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

export const metadata = {
  title: "Admin Leads — Eterna Vida",
  description: "Gestionar contactos administrativos",
};

export default function AdminLeadsPage() {
  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">CRM</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Leads</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border-brand bg-surface-brandTint px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand">
              Activo
            </span>
            <span className="rounded-full border border-border-soft bg-surface-subtle px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-muted">
              Interno
            </span>
          </div>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-border-soft bg-surface-subtle px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-brand bg-surface-brandTint text-label-lg text-text-brand">
            0
          </div>
          <div className="space-y-1">
            <h2 className="text-section-lg text-text-primary">Sin registros</h2>
            <p className="text-body-sm text-text-secondary">Aun no hay leads cargados.</p>
          </div>
        </div>
      </section>
    </div>
  );
}