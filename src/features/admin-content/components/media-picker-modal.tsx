"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Image as ImageIcon, Upload, X, Check, Search, Film } from "lucide-react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";
import type { AdminMediaAssetSummary, UploadMediaAssetInput } from "@/types/admin-home-content";

const UPLOAD_STORAGE_PREFIX = "Eterna Vida/Hero";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: AdminMediaAssetSummary) => void;
  onUpload: (file: File, input: UploadMediaAssetInput) => Promise<AdminMediaAssetSummary>;
  mediaAssets: AdminMediaAssetSummary[];
  selectedAssetId?: string | undefined;
  title?: string | undefined;
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

  return `${sanitizedBaseName || "hero-slide"}${extension}`;
}

function buildSuggestedStorageKey(file: File): string {
  return `${UPLOAD_STORAGE_PREFIX}/${sanitizeFileName(file.name)}`;
}

function humanizeFileName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "");
  return nameWithoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferUploadKind(file: File): "image" | "video" | null {
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  const normalizedName = file.name.toLowerCase();
  if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(normalizedName)) return "image";
  if (/\.(mp4|webm|mov|m4v|ogg|ogv)$/.test(normalizedName)) return "video";

  return null;
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
      reject(new Error("No se pudo leer el tama\u00f1o de la imagen."));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onUpload,
  mediaAssets,
  selectedAssetId,
  title = "Seleccionar imagen",
}: MediaPickerModalProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFileInputKey, setUploadFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = mediaAssets.filter((asset) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      asset.storageKey.toLowerCase().includes(query) ||
      asset.altText.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!isOpen) {
      setTab("library");
      setSearchQuery("");
      setUploadFile(null);
      setUploadPreviewUrl(null);
      setUploadAltText("");
      setIsUploading(false);
      setUploadError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);

    setUploadFile(file);
    setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
    setUploadError(null);

    if (file && !uploadAltText.trim()) {
      setUploadAltText(humanizeFileName(file.name));
    }
  }

  async function handleUploadSubmit() {
    if (!uploadFile) {
      setUploadError("Selecciona un archivo.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const kind = inferUploadKind(uploadFile) ?? "image";
      const metadata = kind === "image" ? await readImageMetadata(uploadFile) : null;

      const input: UploadMediaAssetInput = {
        storageKey: buildSuggestedStorageKey(uploadFile),
        kind,
        altText: uploadAltText.trim() || humanizeFileName(uploadFile.name),
        width: metadata?.width ?? null,
        height: metadata?.height ?? null,
        durationSeconds: null,
      };

      const asset = await onUpload(uploadFile, input);
      onSelect(asset);
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Error al subir el archivo.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSelectAsset(asset: AdminMediaAssetSummary) {
    onSelect(asset);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface-canvas shadow-xl"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0.9, 0.24, 1] }}
          >
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <h2 className="text-section-lg text-text-primary">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex border-b border-border-soft px-5">
              <button
                type="button"
                onClick={() => setTab("library")}
                className={cx(
                  "relative px-4 py-3 text-label-md transition-colors",
                  tab === "library"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Biblioteca
                </span>
                {tab === "library" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-primary" />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={cx(
                  "relative px-4 py-3 text-label-md transition-colors",
                  tab === "upload"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Subir nuevo
                </span>
                {tab === "upload" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-primary" />
                ) : null}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "library" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre de archivo..."
                      className="w-full rounded-lg border border-border-default bg-surface-canvas py-2.5 pl-10 pr-3 text-body-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
                    />
                  </div>

                  {filteredAssets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {filteredAssets.map((asset) => {
                        const isSelected = asset.id === selectedAssetId;
                        const isImage = asset.kind === "image";

                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleSelectAsset(asset)}
                            className={cx(
                              "group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-150",
                              isSelected
                                ? "border-brand-primary ring-2 ring-brand-primary/20"
                                : "border-border-soft hover:border-border-strong",
                            )}
                          >
                            {asset.publicUrl ? (
                              isImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={asset.publicUrl}
                                  alt={asset.altText || asset.storageKey}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-surface-subtle">
                                  <Film className="h-8 w-8 text-text-muted" />
                                </div>
                              )
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-surface-subtle">
                                <ImageIcon className="h-8 w-8 text-text-muted" />
                              </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                              <p className="truncate text-[11px] font-medium text-white">
                                {asset.storageKey.split("/").pop()}
                              </p>
                            </div>

                            {isSelected ? (
                              <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : null}

                            <div className="absolute inset-0 bg-brand-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ImageIcon className="mb-3 h-10 w-10 text-text-muted" />
                      <p className="text-body-sm text-text-secondary">
                        {searchQuery
                          ? "No se encontraron archivos con ese nombre."
                          : "No hay archivos multimedia disponibles."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <label className="space-y-2 block">
                    <span className="block text-label-md text-text-primary">Archivo</span>
                    <input
                      ref={fileInputRef}
                      key={uploadFileInputKey}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="w-full rounded-lg border border-border-default bg-surface-canvas px-3 py-2.5 text-body-sm text-text-primary file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1 file:text-label-sm file:text-brand-primary hover:file:bg-brand-primary/20"
                    />
                  </label>

                  {uploadFile ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border-soft bg-surface-subtle p-4 text-body-sm text-text-secondary">
                        <p className="text-text-primary">{uploadFile.name}</p>
                        <p>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <p>{uploadFile.type || "Sin MIME type"}</p>
                      </div>

                      {uploadPreviewUrl ? (
                        <div className="overflow-hidden rounded-xl border border-border-soft">
                          {uploadFile.type.startsWith("video/") ? (
                            <video
                              src={uploadPreviewUrl}
                              className="max-h-48 w-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={uploadPreviewUrl}
                              alt="Preview"
                              className="max-h-48 w-full object-cover"
                            />
                          )}
                        </div>
                      ) : null}

                      <label className="space-y-2 block">
                        <span className="block text-label-md text-text-primary">Alt text</span>
                        <input
                          type="text"
                          value={uploadAltText}
                          onChange={(e) => setUploadAltText(e.target.value)}
                          placeholder="Describe la imagen para accesibilidad"
                          className="w-full rounded-lg border border-border-default bg-surface-canvas px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
                        />
                      </label>
                    </div>
                  ) : null}

                  {uploadError ? (
                    <p className="text-body-sm text-status-error">{uploadError}</p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={!uploadFile || isUploading}
                    className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                  >
                    {isUploading ? "Subiendo..." : "Subir y seleccionar"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-border-soft px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
