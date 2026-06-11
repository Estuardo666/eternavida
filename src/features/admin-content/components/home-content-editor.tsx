"use client";

import { startTransition, useEffect, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { HeroSlideCard } from "@/features/admin-content/components/hero-slide-card";
import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import {
  saveHomeContent,
  registerMediaAsset,
  uploadMediaAsset,
} from "@/services/admin-content/client";
import type {
  AdminCategorySummary,
  AdminHomeContentEditorData,
  AdminHomeContentFormData,
  AdminMediaAssetSummary,
  AdminProductSummary,
  UploadMediaAssetInput,
  UpsertMediaAssetInput,
} from "@/types/admin-home-content";
import type { MediaAsset } from "@/types/media";

type SubmissionState = "idle" | "saving" | "success" | "error";

type MediaSubmissionState = "idle" | "saving" | "success" | "error";

type UploadSubmissionState = "idle" | "saving" | "success" | "error";

interface HomeContentEditorProps {
  initialData: AdminHomeContentEditorData;
}

type OrderedSelectionField = "featuredCategoryIds" | "featuredProductIds";

const DEFAULT_UPLOAD_STORAGE_PREFIX = "Eterna Vida/Uploads";
const adminFieldClassName = ADMIN_COMPACT_FIELD_CLASS_NAME;

function sortMediaAssets(mediaAssets: AdminMediaAssetSummary[]) {
  return [...mediaAssets].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  const normalizedName = file.name.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(normalizedName)) {
    return "image";
  }

  if (/\.(mp4|webm|mov|m4v|ogg|ogv)$/.test(normalizedName)) {
    return "video";
  }

  return null;
}

function humanizeFileName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "");

  return nameWithoutExtension
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
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      reject(new Error("No se pudo leer el tamaño de la imagen seleccionada."));
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

function readVideoMetadata(file: File): Promise<{
  width: number;
  height: number;
  durationSeconds: number;
}> {
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

    return {
      ...nextInput,
      width: metadata.width,
      height: metadata.height,
      durationSeconds: null,
    };
  }

  if (inferredKind === "video") {
    const metadata = await readVideoMetadata(file);

    return {
      ...nextInput,
      width: metadata.width,
      height: metadata.height,
      durationSeconds: metadata.durationSeconds,
    };
  }

  return nextInput;
}

export function HomeContentEditor({ initialData }: HomeContentEditorProps) {
  const [formData, setFormData] = useState<AdminHomeContentFormData>(initialData.content);
  const [mediaAssets, setMediaAssets] = useState<AdminMediaAssetSummary[]>(
    sortMediaAssets(initialData.mediaAssets),
  );
  const [availableCategories, setAvailableCategories] = useState<AdminCategorySummary[]>(
    initialData.availableCategories,
  );
  const [availableProducts, setAvailableProducts] = useState<AdminProductSummary[]>(
    initialData.availableProducts,
  );
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [mediaSubmissionState, setMediaSubmissionState] = useState<MediaSubmissionState>("idle");
  const [uploadSubmissionState, setUploadSubmissionState] = useState<UploadSubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaErrorMessage, setMediaErrorMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mediaSuccessMessage, setMediaSuccessMessage] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [mediaInput, setMediaInput] = useState<UpsertMediaAssetInput>(buildEmptyMediaInput());
  const [uploadInput, setUploadInput] = useState<UploadMediaAssetInput>(buildEmptyUploadInput());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadFileInputKey, setUploadFileInputKey] = useState(0);

  const selectedHeroMedia = mediaAssets.find((asset) => asset.id === formData.heroMediaId) ?? null;
  const selectedFeaturedCategories = formData.featuredCategoryIds
    .map((categoryId) => availableCategories.find((category) => category.id === categoryId) ?? null)
    .filter((category): category is AdminCategorySummary => Boolean(category));
  const selectedFeaturedProducts = formData.featuredProductIds
    .map((productId) => availableProducts.find((product) => product.id === productId) ?? null)
    .filter((product): product is AdminProductSummary => Boolean(product));
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
      if (uploadPreviewUrl) {
        URL.revokeObjectURL(uploadPreviewUrl);
      }
    };
  }, [uploadPreviewUrl]);

  function updateField<Key extends keyof AdminHomeContentFormData>(key: Key, value: AdminHomeContentFormData[Key]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function updateMediaField<Key extends keyof UpsertMediaAssetInput>(key: Key, value: UpsertMediaAssetInput[Key]) {
    setMediaInput((current) => ({ ...current, [key]: value }));
  }

  function updateUploadField<Key extends keyof UploadMediaAssetInput>(key: Key, value: UploadMediaAssetInput[Key]) {
    setUploadInput((current) => ({ ...current, [key]: value }));
  }

  function toggleOrderedSelection(field: OrderedSelectionField, entityId: string) {
    setFormData((current) => {
      const nextValues = current[field].includes(entityId)
        ? current[field].filter((value) => value !== entityId)
        : [...current[field], entityId];

      return {
        ...current,
        [field]: nextValues,
      };
    });
  }

  function moveOrderedSelection(field: OrderedSelectionField, entityId: string, direction: -1 | 1) {
    setFormData((current) => {
      const currentIndex = current[field].indexOf(entityId);
      if (currentIndex === -1) {
        return current;
      }

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= current[field].length) {
        return current;
      }

      const nextValues = [...current[field]];
      const currentValue = nextValues[currentIndex];
      const nextValue = nextValues[nextIndex];

      if (!currentValue || !nextValue) {
        return current;
      }

      nextValues[currentIndex] = nextValue;
      nextValues[nextIndex] = currentValue;

      return {
        ...current,
        [field]: nextValues,
      };
    });
  }

  async function handleUploadFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
    }

    setUploadFile(file);
    setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    if (!file) {
      return;
    }

    try {
      const nextInput = await deriveUploadInputFromFile(file, uploadInput);
      setUploadInput(nextInput);
    } catch (error) {
      setUploadErrorMessage(
        error instanceof Error
          ? `${error.message} Puedes completar los campos manualmente.`
          : "No se pudo leer el metadata local del archivo. Puedes completar los campos manualmente.",
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionState("saving");
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(() => {
      void saveHomeContent(formData)
        .then((data) => {
          setFormData(data.content);
          setMediaAssets(sortMediaAssets(data.mediaAssets));
          setAvailableCategories(data.availableCategories);
          setAvailableProducts(data.availableProducts);
          setSubmissionState("success");
          setSuccessMessage("Home actualizada correctamente.");
        })
        .catch((error) => {
          setSubmissionState("error");
          setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar Home.");
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
        .then((mediaAsset) => {
          setMediaAssets((current) => sortMediaAssets([mediaAsset, ...current.filter((item) => item.id !== mediaAsset.id)]));
          setMediaSubmissionState("success");
          setMediaSuccessMessage("Media registrada correctamente desde Cloudflare R2.");
          setMediaInput(buildEmptyMediaInput());
          setFormData((current) => current.heroMediaId ? current : { ...current, heroMediaId: mediaAsset.id });
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
        .then((mediaAsset) => {
          setMediaAssets((current) =>
            sortMediaAssets([mediaAsset, ...current.filter((item) => item.id !== mediaAsset.id)]),
          );
          setUploadSubmissionState("success");
          setUploadSuccessMessage("Archivo subido y media registrada correctamente en Cloudflare R2.");
          setUploadInput(buildEmptyUploadInput());

          if (uploadPreviewUrl) {
            URL.revokeObjectURL(uploadPreviewUrl);
          }

          setUploadFile(null);
          setUploadPreviewUrl(null);
          setUploadFileInputKey((current) => current + 1);
          setFormData((current) =>
            current.heroMediaId ? current : { ...current, heroMediaId: mediaAsset.id },
          );
        })
        .catch((error) => {
          setUploadSubmissionState("error");
          setUploadErrorMessage(
            error instanceof Error ? error.message : "No se pudo subir la media a Cloudflare R2.",
          );
        });
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        <div className="space-y-2">
          <h1 className="text-headline-md text-text-primary">Home content editor</h1>
          <p className="max-w-3xl text-body-md text-text-secondary">
            Edita el contenido persistido de la Home y asigna slides hero persistidos desde tu bucket de Cloudflare R2 sin tocar la UI pública.
          </p>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)] xl:gap-6">
        <form onSubmit={handleSubmit} className={`space-y-6 sm:space-y-8 ${ADMIN_PANEL_SURFACE_CLASS_NAME}`}>
          <div className="space-y-2">
            <h2 className="text-section-lg text-text-primary">Contenido persistido</h2>
            <p className="text-body-sm text-text-secondary">
              El hero sigue siendo editorial, pero categorías y productos destacados ya se seleccionan desde entidades relacionales del catálogo local.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero eyebrow</span>
              <input value={formData.heroEyebrow} onChange={(event) => updateField("heroEyebrow", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero badge</span>
              <input value={formData.heroSupportingBadge} onChange={(event) => updateField("heroSupportingBadge", event.target.value)} className={adminFieldClassName} />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Hero title</span>
            <textarea value={formData.heroTitle} onChange={(event) => updateField("heroTitle", event.target.value)} rows={3} className={adminFieldClassName} />
          </label>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Hero subtitle</span>
            <textarea value={formData.heroSubtitle} onChange={(event) => updateField("heroSubtitle", event.target.value)} rows={4} className={adminFieldClassName} />
          </label>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero primary CTA text</span>
              <input value={formData.heroPrimaryCtaText} onChange={(event) => updateField("heroPrimaryCtaText", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero primary CTA href</span>
              <input value={formData.heroPrimaryCtaHref} onChange={(event) => updateField("heroPrimaryCtaHref", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero secondary CTA text</span>
              <input value={formData.heroSecondaryCtaText} onChange={(event) => updateField("heroSecondaryCtaText", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Hero secondary CTA href</span>
              <input value={formData.heroSecondaryCtaHref} onChange={(event) => updateField("heroSecondaryCtaHref", event.target.value)} className={adminFieldClassName} />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Slides hero persistidos</span>
            <p className="text-body-sm text-text-secondary mb-3">
              Selecciona o sube imágenes para cada slide del carrusel hero. Puedes cambiar, subir nuevas, o quitar imágenes directamente desde cada tarjeta.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <HeroSlideCard
                slideNumber={1}
                selectedAsset={selectedHeroMedia}
                altText={formData.heroMediaAltText}
                mediaAssets={mediaAssets}
                onSelect={(asset) => {
                  updateField("heroMediaId", asset?.id ?? "");
                  if (asset?.altText) updateField("heroMediaAltText", asset.altText);
                }}
                onAltTextChange={(value) => updateField("heroMediaAltText", value)}
                onUpload={async (file, input) => {
                  const result = await uploadMediaAsset(file, input);
                  return result;
                }}
              />
              <HeroSlideCard
                slideNumber={2}
                selectedAsset={mediaAssets.find((a) => a.id === formData.heroSecondaryMediaId) ?? null}
                altText={formData.heroSecondaryMediaAltText}
                mediaAssets={mediaAssets}
                onSelect={(asset) => {
                  updateField("heroSecondaryMediaId", asset?.id ?? "");
                  if (asset?.altText) updateField("heroSecondaryMediaAltText", asset.altText);
                }}
                onAltTextChange={(value) => updateField("heroSecondaryMediaAltText", value)}
                onUpload={async (file, input) => {
                  const result = await uploadMediaAsset(file, input);
                  return result;
                }}
              />
              <HeroSlideCard
                slideNumber={3}
                selectedAsset={mediaAssets.find((a) => a.id === formData.heroTertiaryMediaId) ?? null}
                altText={formData.heroTertiaryMediaAltText}
                mediaAssets={mediaAssets}
                onSelect={(asset) => {
                  updateField("heroTertiaryMediaId", asset?.id ?? "");
                  if (asset?.altText) updateField("heroTertiaryMediaAltText", asset.altText);
                }}
                onAltTextChange={(value) => updateField("heroTertiaryMediaAltText", value)}
                onUpload={async (file, input) => {
                  const result = await uploadMediaAsset(file, input);
                  return result;
                }}
              />
            </div>
          </label>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Featured categories eyebrow</span>
              <input value={formData.featuredCategoriesEyebrow} onChange={(event) => updateField("featuredCategoriesEyebrow", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">Featured products eyebrow</span>
              <input value={formData.featuredProductsEyebrow} onChange={(event) => updateField("featuredProductsEyebrow", event.target.value)} className={adminFieldClassName} />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Featured categories title</span>
            <input value={formData.featuredCategoriesTitle} onChange={(event) => updateField("featuredCategoriesTitle", event.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Featured categories description</span>
            <textarea value={formData.featuredCategoriesDescription} onChange={(event) => updateField("featuredCategoriesDescription", event.target.value)} rows={3} className={adminFieldClassName} />
          </label>
          <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
            <div className="space-y-2">
              <h3 className="text-label-lg text-text-primary">Featured categories selection</h3>
              <p className="text-body-sm text-text-secondary">
                Marca las categorías que quieres mostrar. El orden seleccionado define la composición de la grid pública.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {availableCategories.map((category) => {
                const isSelected = formData.featuredCategoryIds.includes(category.id);
                const selectedIndex = formData.featuredCategoryIds.indexOf(category.id);

                return (
                  <label key={category.id} className="flex cursor-pointer gap-3 rounded-xl border border-border-soft bg-surface-canvas p-4 text-body-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderedSelection("featuredCategoryIds", category.id)}
                      className="mt-1 h-4 w-4 rounded border-border-default"
                    />
                    <div className="space-y-1">
                      <p className="text-text-primary">{category.name}</p>
                      <p>{category.description}</p>
                      <p>{category.href}</p>
                      <p>
                        {category.isActive ? "Activa" : "Inactiva"}
                        {isSelected ? ` · Posición ${selectedIndex + 1}` : ""}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="space-y-3">
              {selectedFeaturedCategories.length > 0 ? (
                selectedFeaturedCategories.map((category, index) => (
                  <div key={category.id} className="flex flex-col gap-3 rounded-xl border border-border-soft bg-surface-canvas p-4 text-body-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-text-primary">{index + 1}. {category.name}</p>
                      <p>{category.href}</p>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <button type="button" onClick={() => moveOrderedSelection("featuredCategoryIds", category.id, -1)} disabled={index === 0} className="flex-1 rounded-lg border border-border-default px-3 py-2 text-text-primary disabled:opacity-50 sm:flex-none">Subir</button>
                      <button type="button" onClick={() => moveOrderedSelection("featuredCategoryIds", category.id, 1)} disabled={index === selectedFeaturedCategories.length - 1} className="flex-1 rounded-lg border border-border-default px-3 py-2 text-text-primary disabled:opacity-50 sm:flex-none">Bajar</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-body-sm text-status-error">Selecciona al menos una categoría destacada.</p>
              )}
            </div>
          </section>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Featured products title</span>
            <input value={formData.featuredProductsTitle} onChange={(event) => updateField("featuredProductsTitle", event.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Featured products description</span>
            <textarea value={formData.featuredProductsDescription} onChange={(event) => updateField("featuredProductsDescription", event.target.value)} rows={3} className={adminFieldClassName} />
          </label>
          <section className="space-y-4 rounded-2xl border border-border-soft bg-surface-subtle p-5">
            <div className="space-y-2">
              <h3 className="text-label-lg text-text-primary">Featured products selection</h3>
              <p className="text-body-sm text-text-secondary">
                Selecciona productos reales del catálogo local. El orden elegido alimenta la shelf principal de Home.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {availableProducts.map((product) => {
                const isSelected = formData.featuredProductIds.includes(product.id);
                const selectedIndex = formData.featuredProductIds.indexOf(product.id);

                return (
                  <label key={product.id} className="flex cursor-pointer gap-3 rounded-xl border border-border-soft bg-surface-canvas p-4 text-body-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderedSelection("featuredProductIds", product.id)}
                      className="mt-1 h-4 w-4 rounded border-border-default"
                    />
                    <div className="space-y-1">
                      <p className="text-text-primary">{product.name}</p>
                      <p>{product.description}</p>
                      <p>{product.href}</p>
                      <p>
                        {product.isActive ? "Activo" : "Inactivo"}
                        {product.badge ? ` · ${product.badge}` : ""}
                        {isSelected ? ` · Posición ${selectedIndex + 1}` : ""}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="space-y-3">
              {selectedFeaturedProducts.length > 0 ? (
                selectedFeaturedProducts.map((product, index) => (
                  <div key={product.id} className="flex flex-col gap-3 rounded-xl border border-border-soft bg-surface-canvas p-4 text-body-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-text-primary">{index + 1}. {product.name}</p>
                      <p>{product.href}</p>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <button type="button" onClick={() => moveOrderedSelection("featuredProductIds", product.id, -1)} disabled={index === 0} className="flex-1 rounded-lg border border-border-default px-3 py-2 text-text-primary disabled:opacity-50 sm:flex-none">Subir</button>
                      <button type="button" onClick={() => moveOrderedSelection("featuredProductIds", product.id, 1)} disabled={index === selectedFeaturedProducts.length - 1} className="flex-1 rounded-lg border border-border-default px-3 py-2 text-text-primary disabled:opacity-50 sm:flex-none">Bajar</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-body-sm text-status-error">Selecciona al menos un producto destacado.</p>
              )}
            </div>
          </section>

          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Trust highlights eyebrow</span>
            <input value={formData.trustHighlightsEyebrow} onChange={(event) => updateField("trustHighlightsEyebrow", event.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Trust highlights title</span>
            <input value={formData.trustHighlightsTitle} onChange={(event) => updateField("trustHighlightsTitle", event.target.value)} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Trust highlights description</span>
            <textarea value={formData.trustHighlightsDescription} onChange={(event) => updateField("trustHighlightsDescription", event.target.value)} rows={3} className={adminFieldClassName} />
          </label>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">Trust highlights items JSON</span>
            <textarea value={formData.trustHighlightsItemsJson} onChange={(event) => updateField("trustHighlightsItemsJson", event.target.value)} rows={8} className={`${adminFieldClassName} font-mono text-sm`} />
          </label>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA eyebrow</span>
              <input value={formData.ctaEyebrow} onChange={(event) => updateField("ctaEyebrow", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA title</span>
              <input value={formData.ctaTitle} onChange={(event) => updateField("ctaTitle", event.target.value)} className={adminFieldClassName} />
            </label>
          </div>
          <label className="space-y-2 block">
            <span className="block text-label-md text-text-primary">CTA description</span>
            <textarea value={formData.ctaDescription} onChange={(event) => updateField("ctaDescription", event.target.value)} rows={3} className={adminFieldClassName} />
          </label>
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA primary text</span>
              <input value={formData.ctaPrimaryCtaText} onChange={(event) => updateField("ctaPrimaryCtaText", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA primary href</span>
              <input value={formData.ctaPrimaryCtaHref} onChange={(event) => updateField("ctaPrimaryCtaHref", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA secondary text</span>
              <input value={formData.ctaSecondaryCtaText} onChange={(event) => updateField("ctaSecondaryCtaText", event.target.value)} className={adminFieldClassName} />
            </label>
            <label className="space-y-2">
              <span className="block text-label-md text-text-primary">CTA secondary href</span>
              <input value={formData.ctaSecondaryCtaHref} onChange={(event) => updateField("ctaSecondaryCtaHref", event.target.value)} className={adminFieldClassName} />
            </label>
          </div>

          {errorMessage ? <p className="text-body-sm text-status-error">{errorMessage}</p> : null}
          {successMessage ? <p className="text-body-sm text-status-success">{successMessage}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="submit" disabled={submissionState === "saving"} className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}>
              {submissionState === "saving" ? "Guardando..." : "Guardar Home"}
            </button>
          </div>
        </form>

        <aside className="space-y-5 sm:space-y-6">
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Subir media a Cloudflare R2</h2>
              <p className="text-body-sm text-text-secondary">
                Sube una imagen o video desde este panel y registra la media asset en un solo paso. El editor intenta inferir kind, dimensiones y duración desde el archivo local antes de enviarlo.
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
                  placeholder="Eterna Vida/Uploads/banner_hero_4.webp"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Kind</span>
                  <select
                    value={uploadInput.kind}
                    onChange={(event) =>
                      updateUploadField("kind", event.target.value as UploadMediaAssetInput["kind"])
                    }
                    className={adminFieldClassName}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Poster URL opcional</span>
                  <input
                    value={uploadInput.posterUrl ?? ""}
                    onChange={(event) => updateUploadField("posterUrl", event.target.value)}
                    className={adminFieldClassName}
                    placeholder="Solo para video si necesitas poster externo"
                  />
                </label>
              </div>

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
                  <input
                    type="number"
                    value={uploadInput.width ?? ""}
                    onChange={(event) =>
                      updateUploadField("width", event.target.value ? Number(event.target.value) : null)
                    }
                    className={adminFieldClassName}
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Height</span>
                  <input
                    type="number"
                    value={uploadInput.height ?? ""}
                    onChange={(event) =>
                      updateUploadField("height", event.target.value ? Number(event.target.value) : null)
                    }
                    className={adminFieldClassName}
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-label-md text-text-primary">Duration seconds</span>
                  <input
                    type="number"
                    value={uploadInput.durationSeconds ?? ""}
                    onChange={(event) =>
                      updateUploadField(
                        "durationSeconds",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    className={adminFieldClassName}
                  />
                </label>
              </div>

              {uploadErrorMessage ? <p className="text-body-sm text-status-error">{uploadErrorMessage}</p> : null}
              {uploadSuccessMessage ? <p className="text-body-sm text-status-success">{uploadSuccessMessage}</p> : null}

              <button
                type="submit"
                disabled={uploadSubmissionState === "saving"}
                className={`${ADMIN_BUTTON_PRIMARY_CLASS_NAME} w-full sm:w-auto`}
              >
                {uploadSubmissionState === "saving" ? "Subiendo..." : "Subir y registrar media"}
              </button>
            </form>
          </section>

          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Slides hero actuales</h2>
              <p className="text-body-sm text-text-secondary">
                Vista rápida de los assets persistidos para los 3 slides del carrusel hero.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: "Slide 1", asset: selectedHeroMedia },
                { label: "Slide 2", asset: mediaAssets.find((a) => a.id === formData.heroSecondaryMediaId) ?? null },
                { label: "Slide 3", asset: mediaAssets.find((a) => a.id === formData.heroTertiaryMediaId) ?? null },
              ].map(({ label, asset }) => (
                <div key={label} className="rounded-xl border border-border-soft bg-surface-subtle p-3 text-body-sm text-text-secondary">
                  <p className="mb-1 text-label-md text-text-primary">{label}</p>
                  {asset ? (
                    <div className="space-y-1 break-all">
                      <p className="text-caption">{asset.storageKey}</p>
                      {asset.publicUrl ? (
                        <div className="mt-2 overflow-hidden rounded-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.publicUrl}
                            alt={asset.altText || asset.storageKey}
                            className="h-auto w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p>No seleccionado</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Registrar media asset existente</h2>
              <p className="text-body-sm text-text-secondary">
                Registra una referencia canónica a un archivo que ya existe en tu bucket R2. El editor podrá usarla en cualquiera de los slides hero o como referencia futura.
              </p>
            </div>

            <form onSubmit={handleRegisterMediaAsset} className="mt-6 space-y-4">
              <label className="space-y-2 block">
                <span className="block text-label-md text-text-primary">Storage key</span>
                <input value={mediaInput.storageKey} onChange={(event) => updateMediaField("storageKey", event.target.value)} className={adminFieldClassName} placeholder="Eterna Vida/Banners/banner_hero (1).webp" />
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

          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="space-y-2">
              <h2 className="text-section-lg text-text-primary">Media assets disponibles</h2>
              <p className="text-body-sm text-text-secondary">
                Referencias persistidas a archivos del bucket. Úsalas en hero o en futuras ampliaciones editoriales.
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {mediaAssets.map((asset) => (
                <li key={asset.id} className="rounded-xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary break-all">
                  <p className="text-text-primary">{asset.storageKey}</p>
                  <p>{asset.publicUrl ?? "Sin publicUrl"}</p>
                  <p>{asset.kind.toUpperCase()}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}

