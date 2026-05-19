"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import { MediaPickerModal } from "@/components/media/media-picker-modal";
import { cx } from "@/lib/utils";
import { buildCatalogMediaStorageKey, slugifyCatalogName } from "@/lib/catalog-slugs";
import { createBrandClient, deleteBrandClient, updateBrandClient } from "@/services/admin-catalog/client";
import { uploadMediaAsset } from "@/services/admin-content/client";
import type { AdminBrandFormData, AdminBrandItem, AdminCatalogEditorData } from "@/types/admin-catalog";
import type { AdminMediaAssetSummary } from "@/types/admin-home-content";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface BrandAdminFormProps {
  initialData: AdminCatalogEditorData;
  mode: "create" | "edit";
  brand?: AdminBrandItem | null;
}

function buildBrandForm(brand?: AdminBrandItem | null): AdminBrandFormData {
  if (!brand) {
    return {
      name: "",
      mediaAssetId: "",
    };
  }

  return {
    name: brand.name,
    mediaAssetId: brand.mediaAssetId ?? "",
  };
}

function mapMediaAssetSummaryToMediaAsset(
  mediaAsset: AdminCatalogEditorData["mediaAssets"][number] | null,
): MediaAsset | null {
  if (!mediaAsset) {
    return null;
  }

  return {
    id: mediaAsset.id,
    kind: mediaAsset.kind,
    url: mediaAsset.publicUrl,
    storageKey: mediaAsset.storageKey,
    altText: mediaAsset.altText,
    mimeType: mediaAsset.mimeType,
    posterUrl: mediaAsset.posterUrl,
    width: mediaAsset.width ?? null,
    height: mediaAsset.height ?? null,
    durationSeconds: mediaAsset.durationSeconds ?? null,
  };
}

function mapBrandItemToMediaAsset(brand: AdminBrandItem | null): MediaAsset | null {
  if (!brand?.mediaAssetId || !brand.mediaAssetPublicUrl) {
    return null;
  }

  return {
    id: brand.mediaAssetId,
    kind: "image",
    url: brand.mediaAssetPublicUrl,
    storageKey: null,
    altText: brand.mediaAssetAltText,
    mimeType: null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function buildLocalPreviewAsset(input: {
  file: File | null;
  previewUrl: string | null;
  name: string;
}): MediaAsset | null {
  if (!input.file || !input.previewUrl) {
    return null;
  }

  return {
    id: "local-brand-preview",
    kind: "image",
    url: input.previewUrl,
    storageKey: null,
    altText: input.name.trim() || input.file.name,
    mimeType: input.file.type || null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BrandAdminForm({ initialData, mode, brand }: BrandAdminFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminBrandFormData>(() => buildBrandForm(brand));
  const [persistedBrand, setPersistedBrand] = useState<AdminBrandItem | null>(brand ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(buildBrandForm(brand)));
  const [savedAt, setSavedAt] = useState<string | null>(brand?.updatedAt ?? null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const selectedMedia = initialData.mediaAssets.find((asset) => asset.id === formData.mediaAssetId) ?? null;
  const previewAsset =
    buildLocalPreviewAsset({ file: imageFile, previewUrl: imagePreviewUrl, name: formData.name }) ??
    mapMediaAssetSummaryToMediaAsset(selectedMedia) ??
    mapBrandItemToMediaAsset(persistedBrand);
  const isDirty = savedSnapshot !== JSON.stringify(formData) || Boolean(imageFile);
  const saveStatusLabel =
    submissionState === "saving"
      ? "Guardando cambios..."
      : submissionState === "error"
        ? "Error al guardar"
        : isDirty
          ? "Cambios sin guardar"
          : savedAt
            ? `Guardado ${formatDate(savedAt).toLowerCase()}`
            : mode === "create"
              ? "Lista para crear"
              : "Sin cambios pendientes";
  const saveStatusTone =
    submissionState === "saving"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : submissionState === "error"
        ? "border-status-error/30 bg-status-error/10 text-status-error"
        : isDirty
          ? "border-[#f2b27f] bg-[#fff4e8] text-[#b45309]"
          : "border-emerald-200 bg-emerald-50 text-emerald-800";

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function markAsDirty() {
    setSubmissionState((current) => (current === "saving" ? current : "idle"));
  }

  function resetPendingImageSelection() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(null);
    setImagePreviewUrl(null);
    setFileInputKey((current) => current + 1);
  }

  function updateField<Key extends keyof AdminBrandFormData>(key: Key, value: AdminBrandFormData[Key]) {
    markAsDirty();
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function clearImageSelection(removePersistedAsset = false) {
    markAsDirty();
    resetPendingImageSelection();

    if (removePersistedAsset) {
      updateField("mediaAssetId", "");
    }
  }

  function handlePickerSelect(asset: AdminMediaAssetSummary) {
    markAsDirty();
    resetPendingImageSelection();
    updateField("mediaAssetId", asset.id);
    setMediaPickerOpen(false);
  }

  function handleImageChange(file: File | null) {
    markAsDirty();
    resetPendingImageSelection();

    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setErrorMessage(null);
  }

  async function uploadBrandImage(file: File, name: string) {
    const slug = slugifyCatalogName(name);
    if (!slug) {
      throw new Error("El nombre es obligatorio para generar la ruta de la imagen.");
    }

    const mediaAsset = await uploadMediaAsset(file, {
      storageKey: buildCatalogMediaStorageKey("brands", slug, file.name),
      kind: "image",
      altText: name.trim(),
    });

    return mediaAsset.id;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("saving");
    setErrorMessage(null);

    try {
      const payload: AdminBrandFormData = {
        ...formData,
        mediaAssetId: formData.mediaAssetId,
      };

      if (imageFile) {
        payload.mediaAssetId = await uploadBrandImage(imageFile, formData.name);
      }

      if (mode === "edit" && brand) {
        const updated = await updateBrandClient(brand.id, payload);
        const nextFormData = buildBrandForm(updated);
        setFormData(nextFormData);
        setPersistedBrand(updated);
        setSavedSnapshot(JSON.stringify(nextFormData));
        setSavedAt(updated.updatedAt);
        resetPendingImageSelection();
        setSubmissionState("success");
        router.refresh();
        return;
      }

      const created = await createBrandClient(payload);
      router.push(`/admin/catalog/brands/${created.id}`);
      router.refresh();
    } catch (error) {
      setSubmissionState("error");
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la marca.");
    }
  }

  async function handleDelete() {
    if (!brand) {
      return;
    }

    if (!window.confirm("Se eliminara la marca seleccionada. Esta accion no se puede deshacer.")) {
      return;
    }

    setSubmissionState("saving");
    setErrorMessage(null);

    try {
      await deleteBrandClient(brand.id);
      router.push("/admin/catalog/brands");
      router.refresh();
    } catch (error) {
      setSubmissionState("error");
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la marca.");
    }
  }

  return (
    <div className="space-y-6">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <AdminBreadcrumbs
              items={[
                { label: "Admin", href: "/admin/leads" },
                { label: "Catalogo", href: "/admin/catalog/products" },
                { label: "Marcas", href: "/admin/catalog/brands" },
                { label: mode === "create" ? "Nueva" : formData.name || "Editar" },
              ]}
            />
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catalogo</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">{mode === "create" ? "Nueva marca" : "Editar marca"}</h1>
          </div>

          <div className="w-full max-w-[420px] space-y-2 lg:w-auto lg:min-w-[340px] lg:max-w-none">
            <div className={cx("inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-center text-label-sm", saveStatusTone)}>
              <span>{saveStatusLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/catalog/brands" className="inline-flex min-h-10 items-center justify-center rounded-pill border border-border-default bg-surface-canvas px-4 py-2 text-center text-label-sm text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-strong hover:bg-surface-soft active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
                Volver al listado
              </Link>
              <Link href="/admin/catalog/brands/new" className="inline-flex min-h-10 items-center justify-center rounded-pill bg-brand-primary px-4 py-2 text-center text-label-sm text-text-inverse shadow-sm transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:bg-emerald-600 active:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas">
                Nueva marca
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
          <form id="brand-form" onSubmit={handleSubmit} className="space-y-6">
            <label className="space-y-2 block">
              <span className="block text-label-md text-text-primary">Nombre</span>
              <input value={formData.name} onChange={(event) => updateField("name", event.target.value)} className={ADMIN_COMPACT_PROMINENT_FIELD_CLASS_NAME} placeholder="ISDIN" />
            </label>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
              <div className={`space-y-3 ${ADMIN_INSET_CARD_CLASS_NAME}`}>
                <div className="space-y-2">
                  <span className="block text-label-md text-text-primary">Imagen de marca</span>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="mr-2 h-4 w-4" aria-hidden="true">
                      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    {formData.mediaAssetId ? "Cambiar imagen" : "Elegir imagen"}
                  </button>
                </div>

                <p className="text-body-sm text-text-secondary">
                  {imageFile ? `Pendiente de subida: ${imageFile.name}` : selectedMedia ? selectedMedia.storageKey.split("/").pop() : "Sin imagen seleccionada"}
                </p>

                {(imageFile || formData.mediaAssetId) ? (
                  <button type="button" onClick={() => clearImageSelection(true)} className="rounded-xl border border-border-default bg-surface-canvas px-4 py-2 text-label-md text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-strong hover:bg-surface-soft active:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle">
                    Quitar imagen
                  </button>
                ) : null}

                <MediaPickerModal
                  open={mediaPickerOpen}
                  onClose={() => setMediaPickerOpen(false)}
                  onSelect={handlePickerSelect}
                  uploadStorageKeyPrefix="Media/Brands"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-label-md text-text-primary">Previsualizacion</span>
                <MediaAssetFrame asset={previewAsset} label="Previsualizacion de imagen de marca" minHeightClassName="min-h-[240px]" />
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <h2 className="text-section-lg text-text-primary">Estado de la ficha</h2>
            
            <div className="mt-5 space-y-2 text-body-sm leading-relaxed">
              <div className="flex items-start justify-between gap-3">
                <span className="text-text-secondary whitespace-nowrap">Guardado</span>
                <span className="text-label-md font-medium text-text-primary text-right leading-snug">{saveStatusLabel}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-text-secondary whitespace-nowrap">Modo</span>
                <span className="text-label-md font-medium text-text-primary text-right">{mode === "create" ? "Creación" : "Edición"}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-text-secondary whitespace-nowrap">Nombre</span>
                <span className="text-label-md font-medium text-text-primary text-right break-words leading-snug">{formData.name || "—"}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-text-secondary whitespace-nowrap">Productos</span>
                <span className="text-label-md font-medium text-text-primary">{brand?.productCount ?? 0}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border-soft pt-5">
              {errorMessage ? <p className="mb-2 text-body-sm text-status-error">{errorMessage}</p> : null}
              <button type="submit" form="brand-form" disabled={submissionState === "saving"} className={`w-full ${ADMIN_BUTTON_PRIMARY_CLASS_NAME}`}>
                {submissionState === "saving" ? "Guardando..." : mode === "edit" ? "Actualizar marca" : "Crear marca"}
              </button>

              <Link href="/admin/catalog/brands" className={`w-full ${ADMIN_BUTTON_SECONDARY_CLASS_NAME}`}>
                Cancelar
              </Link>

              {mode === "edit" && brand ? (
                <button type="button" onClick={handleDelete} className={`w-full ${ADMIN_BUTTON_DANGER_CLASS_NAME}`}>
                  Eliminar marca
                </button>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
