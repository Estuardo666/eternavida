import { HomeContentEditor } from "@/features/admin-content/components/home-content-editor";
import { getHomeContentEditorData } from "@/services/admin-content/get-home-content-editor-data";

export const metadata = {
  title: "Admin Home Content — Eterna Vida",
  description: "Editar contenido persistido y media de la Home pública.",
};

export default async function AdminHomeContentPage() {
  const editorData = await getHomeContentEditorData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border-soft bg-surface-canvas p-6 shadow-xs sm:p-8">
        <div className="space-y-2">
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Contenido público</p>
          <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Home pública</h1>
          <p className="max-w-3xl text-body-md text-text-secondary">
            Gestiona hero, media y bloques editoriales persistidos de la storefront pública desde un panel protegido.
          </p>
        </div>
      </section>

      <HomeContentEditor initialData={editorData} />
    </div>
  );
}