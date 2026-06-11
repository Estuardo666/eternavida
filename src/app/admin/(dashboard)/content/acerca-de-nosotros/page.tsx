import { AboutContentEditor } from "@/features/admin-content/components/about-content-editor";
import { getAboutContentEditorData } from "@/services/admin-content/get-about-content-editor-data";

export const metadata = {
  title: "Admin Acerca de Nosotros — Eterna Vida",
  description: "Editar contenido persistido de la página Acerca de Nosotros.",
};

export default async function AdminAboutContentPage() {
  const editorData = await getAboutContentEditorData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border-soft bg-surface-canvas p-6 shadow-xs sm:p-8">
        <div className="space-y-2">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Contenido público</p>
          <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Acerca de Nosotros</h1>
          <p className="max-w-3xl text-body-md text-text-secondary">
            Gestiona hero, historia, misión, visión, diferenciadores, producción, impacto y CTA de la página pública desde un panel protegido.
          </p>
        </div>
      </section>

      <AboutContentEditor initialData={editorData} />
    </div>
  );
}
