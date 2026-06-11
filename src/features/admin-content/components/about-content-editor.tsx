"use client";

import { startTransition, useEffect, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import {
  saveAboutContent,
  registerMediaAsset,
  uploadMediaAsset,
} from "@/services/admin-content/client";
import type {
  AdminAboutContentEditorData,
  AdminAboutContentFormData,
  AdminAboutDiffItem,
} from "@/types/admin-about-content";
import type {
  AdminMediaAssetSummary,
  UploadMediaAssetInput,
  UpsertMediaAssetInput,
} from "@/types/admin-home-content";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";

interface AboutContentEditorProps {
  initialData: AdminAboutContentEditorData;
}

const DEFAULT_UPLOAD_STORAGE_PREFIX = "Eterna Vida/Uploads";
const adminFieldClassName = ADMIN_COMPACT_FIELD_CLASS_NAME;

function sortMediaAssets(mediaAssets: AdminMediaAssetSummary[]) {
  return [...mediaAssets].sort((left, right) => right.id.localeCompare(left.id));
}

function buildEmptyMediaInput(): UpsertMediaAssetInput {
  return {
    storageKey: "",
    kind: "image",
    publicUrl: "",
    mimeType: "",
    altText: "",
    posterUrl: "",
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function buildEmptyUploadInput(): UploadMediaAssetInput {
  return {
    storageKey: "",
    kind: "image",
    altText: "",
    posterUrl: "",
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function inferUploadKind(file: File): UploadMediaAssetInput["kind"] | null {
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  const normalizedName = file.name.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(normalizedName)) return "image";
  if (/\.(mp4|webm|mov|m4v|ogg|ogv)$/.test(normalizedName)) return "video";

  return null;
}

function humanizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeFileName(fileName: string): string {
  const extensionMatch = /\.[^.]+$/.exec(fileName);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";
  const rawBaseName = extensionMatch ? fileName.slice(0, -extension.length) : fileName;

  const sanitizedBaseName = rawBaseName
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${sanitizedBaseName || "asset"}${extension}`;
}

function buildSuggestedStorageKey(file: File): string {
  return `${DEFAULT_UPLOAD_STORAGE_PREFIX}/${sanitizeFileName(file.name)}`;
}

function readImageMetadata(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      reject(new Error("No se pudo leer el tamaño de la imagen seleccionada."));
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

function readVideoMetadata(file: File): Promise<{ width: number; height: number; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: Math.round(video.duration),
      });
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      reject(new Error("No se pudo leer el metadata del video seleccionado."));
      URL.revokeObjectURL(objectUrl);
    };

    video.src = objectUrl;
  });
}

async function deriveUploadInputFromFile(
  file: File,
  currentInput: UploadMediaAssetInput,
): Promise<UploadMediaAssetInput> {
  const inferredKind = inferUploadKind(file) ?? currentInput.kind;
  const nextInput: UploadMediaAssetInput = {
    ...currentInput,
    storageKey: currentInput.storageKey.trim() || buildSuggestedStorageKey(file),
    kind: inferredKind,
    altText: currentInput.altText?.trim() || humanizeFileName(file.name),
  };

  if (inferredKind === "image") {
    const metadata = await readImageMetadata(file);
    return { ...nextInput, width: metadata.width, height: metadata.height, durationSeconds: null };
  }

  if (inferredKind === "video") {
    const metadata = await readVideoMetadata(file);
    return { ...nextInput, width: metadata.width, height: metadata.height, durationSeconds: metadata.durationSeconds };
  }

  return nextInput;
}

function MediaSelector({
  label,
  value,
  mediaAssets,
  onChange,
}: {
  label: string;
  value: string;
  mediaAssets: AdminMediaAssetSummary[];
  onChange: (value: string) => void;
}) {
  const selectedAsset = mediaAssets.find((a) => a.id === value);

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
      {selectedAsset?.publicUrl ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-border-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedAsset.publicUrl}
            alt={selectedAsset.altText || selectedAsset.storageKey}
            className="h-auto max-h-40 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
    </label>
  );
}

export function AboutContentEditor({ initialData }: AboutContentEditorProps) {
  const [formData, setFormData] = useState<AdminAboutContentFormData>(initialData.content);
  const [mediaAssets, setMediaAssets] = useState<AdminMediaAssetSummary[]>(
    sortMediaAssets(initialData.mediaAssets),
  );
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mediaInput, setMediaInput] = useState<UpsertMediaAssetInput>(buildEmptyMediaInput());
  const [uploadInput, setUploadInput] = useState<UploadMediaAssetInput>(buildEmptyUploadInput());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadFileInputKey, setUploadFileInputKey] = useState(0);
  const [mediaSubmissionState, setMediaSubmissionState] = useState<SubmissionState>("idle");
  const [uploadSubmissionState, setUploadSubmissionState] = useState<SubmissionState>("idle");
  const [mediaErrorMessage, setMediaErrorMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [mediaSuccessMessage, setMediaSuccessMessage] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const uploadPreviewAsset: MediaAsset | null = uploadFile
    ? {
        id: "local-upload-preview",
        kind: uploadInput.kind,
        url: uploadPreviewUrl,
        storageKey: uploadInput.storageKey || null,
        altText: uploadInput.altText?.trim() || uploadFile.name,
        mimeType: uploadFile.type || null,
        posterUrl: uploadInput.posterUrl ?? null,
        width: uploadInput.width ?? null,
        height: uploadInput.height ?? null,
        durationSeconds: uploadInput.durationSeconds ?? null,
      }
    : null;

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  function updateField<Key extends keyof AdminAboutContentFormData>(key: Key, value: AdminAboutContentFormData[Key]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function updateMediaField<Key extends keyof UpsertMediaAssetInput>(key: Key, value: UpsertMediaAssetInput[Key]) {
    setMediaInput((current) => ({ ...current, [key]: value }));
  }

  function updateUploadField<Key extends keyof UploadMediaAssetInput>(key: Key, value: UploadMediaAssetInput[Key]) {
    setUploadInput((current) => ({ ...current, [key]: value }));
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

  async function handleUploadFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);

    setUploadFile(file);
    setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    if (!file) return;

    try {
      const nextInput = await deriveUploadInputFromFile(file, uploadInput);
      setUploadInput(nextInput);
    } catch (error) {
      setUploadErrorMessage(
        error instanceof Error
          ? `${error.message} Puedes completar los campos manualmente.`
          : "No se pudo leer el metadata local del archivo.",
      );
    }
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
          setMediaAssets(sortMediaAssets(data.mediaAssets));
          setSubmissionState("success");
          setSuccessMessage("Contenido actualizado correctamente.");
        })
        .catch((error) => {
          setSubmissionState("error");
          setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar.");
        });
    });
  }

  async function handleRegisterMediaAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMediaSubmissionState("saving");
    setMediaErrorMessage(null);
    setMediaSuccessMessage(null);

    startTransition(() => {
      void registerMediaAsset(mediaInput)
        .then((asset) => {
          setMediaAssets((current) => sortMediaAssets([asset, ...current.filter((a) => a.id !== asset.id)]));
          setMediaSubmissionState("success");
          setMediaSuccessMessage("Media registrada correctamente desde Cloudflare R2.");
          setMediaInput(buildEmptyMediaInput());
        })
        .catch((error) => {
          setMediaSubmissionState("error");
          setMediaErrorMessage(error instanceof Error ? error.message : "No se pudo registrar la media.");
        });
    });
  }

  async function handleUploadMediaAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadFile) {
      setUploadSubmissionState("error");
      setUploadErrorMessage("Selecciona un archivo antes de subirlo a Cloudflare R2.");
      setUploadSuccessMessage(null);
      return;
    }

    setUploadSubmissionState("saving");
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    startTransition(() => {
      void uploadMediaAsset(uploadFile, uploadInput)
        .then((asset) => {
          setMediaAssets((current) => sortMediaAssets([asset, ...current.filter((a) => a.id !== asset.id)]));
          setUploadSubmissionState("success");
          setUploadSuccessMessage("Archivo subido y media registrada correctamente.");
          setUploadInput(buildEmptyUploadInput());

          if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);

          setUploadFile(null);
          setUploadPreviewUrl(null);
          setUploadFileInputKey((c) => c + 1);
        })
        .catch((error) => {
          setUploadSubmissionState("error");
          setUploadErrorMessage(error instanceof Error ? error.message : "No se pudo subir la media.");
        });
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="space-y-2">
          <h1 className="text-headline-md text-text-primary">Acerca de Nosotros — Editor</h1>
          <p className="max-w-3xl text-body-md text-text-secondary">
            Gestiona el contenido de la página pública &quot;Acerca de Nosotros&quot; y sube imágenes desde Cloudflare R2.
          </p>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)] xl:gap-6">
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

        <aside className="space-y-5 sm:space-y-6">
          {/* Upload to R2 */}
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Subir media a Cloudflare R2</h2>
              <p className="text-body-sm text-text-secondary">
                Sube una imagen o video y regístrala en un solo paso.
              </p>
            </div>

            <form onSubmit={handleUploadMediaAsset} className="mt-6 space-y-4">
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Archivo</span>
                <input
                  key={uploadFileInputKey}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUploadFileChange}
                  className={adminFieldClassName}
                />
              </label>

              {uploadFile ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary break-all">
                    <p className="text-text-primary">{uploadFile.name}</p>
                    <p>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p>{uploadFile.type || "Sin MIME type detectado"}</p>
                    <p>
                      {uploadInput.kind.toUpperCase()} · {uploadInput.width ?? "?"} x {uploadInput.height ?? "?"}
                      {uploadInput.kind === "video" ? ` · ${uploadInput.durationSeconds ?? "?"} s` : ""}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-label-md text-text-primary">Previsualización local</span>
                    <MediaAssetFrame
                      asset={uploadPreviewAsset}
                      label="Previsualización del archivo antes de subirlo"
                      minHeightClassName="min-h-[220px]"
                    />
                  </div>
                </div>
              ) : null}

              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Storage key</span>
                <input
                  value={uploadInput.storageKey}
                  onChange={(event) => updateUploadField("storageKey", event.target.value)}
                  className={adminFieldClassName}
                  placeholder="Eterna Vida/Uploads/about_hero.webp"
                />
              </label>

              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Alt text</span>
                <input
                  value={uploadInput.altText ?? ""}
                  onChange={(event) => updateUploadField("altText", event.target.value)}
                  className={adminFieldClassName}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Width</span>
                  <input type="number" value={uploadInput.width ?? ""} onChange={(event) => updateUploadField("width", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Height</span>
                  <input type="number" value={uploadInput.height ?? ""} onChange={(event) => updateUploadField("height", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Duration seconds</span>
                  <input type="number" value={uploadInput.durationSeconds ?? ""} onChange={(event) => updateUploadField("durationSeconds", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
              </div>

              {uploadErrorMessage ? <p className="text-body-sm text-status-error">{uploadErrorMessage}</p> : null}
              {uploadSuccessMessage ? <p className="text-body-sm text-status-success">{uploadSuccessMessage}</p> : null}

              <button type="submit" disabled={uploadSubmissionState === "saving"} className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
                {uploadSubmissionState === "saving" ? "Subiendo..." : "Subir y registrar media"}
              </button>
            </form>
          </section>

          {/* Register existing R2 asset */}
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Registrar media existente</h2>
              <p className="text-body-sm text-text-secondary">
                Registra una referencia a un archivo que ya existe en tu bucket R2.
              </p>
            </div>

            <form onSubmit={handleRegisterMediaAsset} className="mt-6 space-y-4">
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Storage key</span>
                <input value={mediaInput.storageKey} onChange={(event) => updateMediaField("storageKey", event.target.value)} className={adminFieldClassName} placeholder="Eterna Vida/Banners/about.webp" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Kind</span>
                  <select value={mediaInput.kind} onChange={(event) => updateMediaField("kind", event.target.value as UpsertMediaAssetInput["kind"])} className={adminFieldClassName}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Public URL opcional</span>
                  <input value={mediaInput.publicUrl ?? ""} onChange={(event) => updateMediaField("publicUrl", event.target.value)} className={adminFieldClassName} placeholder="Se deriva desde R2 si lo dejas vacío" />
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Alt text</span>
                <input value={mediaInput.altText ?? ""} onChange={(event) => updateMediaField("altText", event.target.value)} className={adminFieldClassName} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Mime type</span>
                  <input value={mediaInput.mimeType ?? ""} onChange={(event) => updateMediaField("mimeType", event.target.value)} className={adminFieldClassName} placeholder="image/webp" />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Poster URL</span>
                  <input value={mediaInput.posterUrl ?? ""} onChange={(event) => updateMediaField("posterUrl", event.target.value)} className={adminFieldClassName} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Width</span>
                  <input type="number" value={mediaInput.width ?? ""} onChange={(event) => updateMediaField("width", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Height</span>
                  <input type="number" value={mediaInput.height ?? ""} onChange={(event) => updateMediaField("height", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Duration seconds</span>
                  <input type="number" value={mediaInput.durationSeconds ?? ""} onChange={(event) => updateMediaField("durationSeconds", event.target.value ? Number(event.target.value) : null)} className={adminFieldClassName} />
                </label>
              </div>

              {mediaErrorMessage ? <p className="text-body-sm text-status-error">{mediaErrorMessage}</p> : null}
              {mediaSuccessMessage ? <p className="text-body-sm text-status-success">{mediaSuccessMessage}</p> : null}

              <button type="submit" disabled={mediaSubmissionState === "saving"} className={`${ADMIN_BUTTON_SECONDARY_CLASS_NAME} w-full sm:w-auto`}>
                {mediaSubmissionState === "saving" ? "Registrando..." : "Registrar media"}
              </button>
            </form>
          </section>

          {/* Available media assets */}
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Media assets disponibles</h2>
              <p className="text-body-sm text-text-secondary">
                Selecciona imágenes ya registradas para usar en las secciones.
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {mediaAssets.map((asset) => (
                <li key={asset.id} className="rounded-xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary break-all">
                  <p className="text-text-primary">{asset.altText || asset.storageKey}</p>
                  <p className="text-caption">{asset.storageKey}</p>
                  {asset.publicUrl ? (
                    <div className="mt-2 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.publicUrl}
                        alt={asset.altText || asset.storageKey}
                        className="h-auto max-h-32 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
