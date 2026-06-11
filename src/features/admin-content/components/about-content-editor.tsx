"use client";

import { startTransition, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { saveAboutContent } from "@/services/admin-content/client";
import type {
  AdminAboutContentEditorData,
  AdminAboutContentFormData,
  AdminAboutDiffItem,
  AdminAboutMediaAssetSummary,
} from "@/types/admin-about-content";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface AboutContentEditorProps {
  initialData: AdminAboutContentEditorData;
}

const adminFieldClassName = ADMIN_COMPACT_FIELD_CLASS_NAME;

function MediaSelector({
  label,
  value,
  mediaAssets,
  onChange,
}: {
  label: string;
  value: string;
  mediaAssets: AdminAboutMediaAssetSummary[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 block">
      <span className="block text-label-md text-text-primary">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={adminFieldClassName}>
        <option value="">Sin imagen</option>
        {mediaAssets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.altText || asset.storageKey}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AboutContentEditor({ initialData }: AboutContentEditorProps) {
  const [formData, setFormData] = useState<AdminAboutContentFormData>(initialData.content);
  const [mediaAssets] = useState<AdminAboutMediaAssetSummary[]>(initialData.mediaAssets);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateField<Key extends keyof AdminAboutContentFormData>(key: Key, value: AdminAboutContentFormData[Key]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function updateDiffItem(index: number, field: keyof AdminAboutDiffItem, value: string) {
    setFormData((current) => {
      const nextItems = [...current.diffItems];
      const currentItem = nextItems[index];
      if (!currentItem) return current;
      nextItems[index] = { ...currentItem, [field]: value };
      return { ...current, diffItems: nextItems };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("saving");
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(() => {
      void saveAboutContent(formData)
        .then((data) => {
          setFormData(data.content);
          setSubmissionState("success");
          setSuccessMessage("Contenido de Acerca de Nosotros actualizado correctamente.");
        })
        .catch((error) => {
          setSubmissionState("error");
          setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el contenido.");
        });
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="space-y-2">
          <h1 className="text-headline-md text-text-primary">Acerca de Nosotros — Editor</h1>
          <p className="max-w-3xl text-body-md text-text-secondary">
            Gestiona el contenido de la página pública &quot;Acerca de Nosotros&quot;.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className={`space-y-8 ${ADMIN_PANEL_SURFACE_CLASS_NAME}`}>
        {/* Section 1 – Hero */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 1 — Hero</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Pre título</span>
              <input value={formData.heroPretitle} onChange={(e) => updateField("heroPretitle", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.heroCtaText} onChange={(e) => updateField("heroCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <textarea value={formData.heroTitle} onChange={(e) => updateField("heroTitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.heroSubtitle} onChange={(e) => updateField("heroSubtitle", e.target.value)} rows={3} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.heroCtaHref} onChange={(e) => updateField("heroCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
            <MediaSelector label="Imagen Hero" value={formData.heroMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("heroMediaId", v)} />
          </div>
        </section>

        {/* Section 2 – Historia */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 2 — Nuestra Historia</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Pre título</span>
              <input value={formData.historyPretitle} onChange={(e) => updateField("historyPretitle", e.target.value)} className={adminFieldClassName} />
            </label>
            <MediaSelector label="Imagen Historia" value={formData.historyMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("historyMediaId", v)} />
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <input value={formData.historyTitle} onChange={(e) => updateField("historyTitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.historySubtitle} onChange={(e) => updateField("historySubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.historyCtaText} onChange={(e) => updateField("historyCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.historyCtaHref} onChange={(e) => updateField("historyCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Texto SEO</span>
            <textarea value={formData.historySeoText} onChange={(e) => updateField("historySeoText", e.target.value)} rows={5} className={adminFieldClassName} />
          </label>
        </section>

        {/* Section 3 – Misión y Visión */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 3 — Misión y Visión</h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-label-lg text-text-primary">Misión</h3>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Pre título</span>
                <input value={formData.missionPretitle} onChange={(e) => updateField("missionPretitle", e.target.value)} className={adminFieldClassName} />
              </label>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Título</span>
                <input value={formData.missionTitle} onChange={(e) => updateField("missionTitle", e.target.value)} className={adminFieldClassName} />
              </label>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Texto SEO</span>
                <textarea value={formData.missionSeoText} onChange={(e) => updateField("missionSeoText", e.target.value)} rows={4} className={adminFieldClassName} />
              </label>
              <MediaSelector label="Imagen Misión" value={formData.missionMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("missionMediaId", v)} />
            </div>

            <div className="space-y-4">
              <h3 className="text-label-lg text-text-primary">Visión</h3>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Pre título</span>
                <input value={formData.visionPretitle} onChange={(e) => updateField("visionPretitle", e.target.value)} className={adminFieldClassName} />
              </label>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Título</span>
                <input value={formData.visionTitle} onChange={(e) => updateField("visionTitle", e.target.value)} className={adminFieldClassName} />
              </label>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Subtítulo</span>
                <textarea value={formData.visionSubtitle} onChange={(e) => updateField("visionSubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
              </label>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Texto SEO</span>
                <textarea value={formData.visionSeoText} onChange={(e) => updateField("visionSeoText", e.target.value)} rows={4} className={adminFieldClassName} />
              </label>
              <MediaSelector label="Imagen Visión" value={formData.visionMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("visionMediaId", v)} />
            </div>
          </div>
        </section>

        {/* Section 4 – Diferenciadores */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 4 — Lo que nos hace diferentes</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Pre título</span>
              <input value={formData.diffPretitle} onChange={(e) => updateField("diffPretitle", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.diffCtaText} onChange={(e) => updateField("diffCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <input value={formData.diffTitle} onChange={(e) => updateField("diffTitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.diffSubtitle} onChange={(e) => updateField("diffSubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.diffCtaHref} onChange={(e) => updateField("diffCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Texto SEO</span>
            <textarea value={formData.diffSeoText} onChange={(e) => updateField("diffSeoText", e.target.value)} rows={4} className={adminFieldClassName} />
          </label>

          <div className="space-y-3">
            <span className="block text-label-md text-text-primary">6 Diferenciadores</span>
            {formData.diffItems.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border-soft bg-surface-canvas p-4 sm:grid-cols-2">
                <label className="space-y-2 block">
                  <span className="block text-body-sm text-text-secondary">Texto {index + 1}</span>
                  <input value={item.text} onChange={(e) => updateDiffItem(index, "text", e.target.value)} className={adminFieldClassName} />
                </label>
                <MediaSelector label={`Imagen ${index + 1}`} value={item.mediaId} mediaAssets={mediaAssets} onChange={(v) => updateDiffItem(index, "mediaId", v)} />
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 – Producción */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 5 — Producción responsable</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Pre título</span>
              <input value={formData.productionPretitle} onChange={(e) => updateField("productionPretitle", e.target.value)} className={adminFieldClassName} />
            </label>
            <MediaSelector label="Imagen Producción" value={formData.productionMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("productionMediaId", v)} />
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <input value={formData.productionTitle} onChange={(e) => updateField("productionTitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.productionSubtitle} onChange={(e) => updateField("productionSubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.productionCtaText} onChange={(e) => updateField("productionCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.productionCtaHref} onChange={(e) => updateField("productionCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Texto SEO</span>
            <textarea value={formData.productionSeoText} onChange={(e) => updateField("productionSeoText", e.target.value)} rows={4} className={adminFieldClassName} />
          </label>
        </section>

        {/* Section 6 – Impacto */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 6 — Impacto social</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Pre título</span>
              <input value={formData.impactPretitle} onChange={(e) => updateField("impactPretitle", e.target.value)} className={adminFieldClassName} />
            </label>
            <MediaSelector label="Imagen Impacto" value={formData.impactMediaId} mediaAssets={mediaAssets} onChange={(v) => updateField("impactMediaId", v)} />
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <input value={formData.impactTitle} onChange={(e) => updateField("impactTitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.impactSubtitle} onChange={(e) => updateField("impactSubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.impactCtaText} onChange={(e) => updateField("impactCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.impactCtaHref} onChange={(e) => updateField("impactCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Texto SEO</span>
            <textarea value={formData.impactSeoText} onChange={(e) => updateField("impactSeoText", e.target.value)} rows={4} className={adminFieldClassName} />
          </label>
        </section>

        {/* Section 7 – CTA */}
        <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
          <h2 className="text-section-lg text-text-primary">Sección 7 — Cierre / CTA</h2>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Pre título</span>
            <input value={formData.ctaPretitle} onChange={(e) => updateField("ctaPretitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Título</span>
            <input value={formData.ctaTitle} onChange={(e) => updateField("ctaTitle", e.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Subtítulo</span>
            <textarea value={formData.ctaSubtitle} onChange={(e) => updateField("ctaSubtitle", e.target.value)} rows={2} className={adminFieldClassName} />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA texto</span>
              <input value={formData.ctaCtaText} onChange={(e) => updateField("ctaCtaText", e.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">CTA href</span>
              <input value={formData.ctaCtaHref} onChange={(e) => updateField("ctaCtaHref", e.target.value)} className={adminFieldClassName} />
            </label>
          </div>
        </section>

        {errorMessage ? <p className="text-body-sm text-status-error">{errorMessage}</p> : null}
        {successMessage ? <p className="text-body-sm text-status-success">{successMessage}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="submit" disabled={submissionState === "saving"} className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
            {submissionState === "saving" ? "Guardando..." : "Guardar Acerca de Nosotros"}
          </button>
        </div>
      </form>
    </div>
  );
}
