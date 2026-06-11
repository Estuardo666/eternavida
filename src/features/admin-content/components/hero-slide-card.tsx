"use client";

import { useState } from "react";

import { Image as ImageIcon, Pencil, Trash2, Upload } from "lucide-react";

import { cx } from "@/lib/utils";
import type { AdminMediaAssetSummary, UploadMediaAssetInput } from "@/types/admin-home-content";

import { MediaPickerModal } from "./media-picker-modal";

interface HeroSlideCardProps {
  slideNumber: number;
  selectedAsset: AdminMediaAssetSummary | null;
  altText: string;
  mediaAssets: AdminMediaAssetSummary[];
  onSelect: (asset: AdminMediaAssetSummary | null) => void;
  onAltTextChange: (altText: string) => void;
  onUpload: (file: File, input: UploadMediaAssetInput) => Promise<AdminMediaAssetSummary>;
}

export function HeroSlideCard({
  slideNumber,
  selectedAsset,
  altText,
  mediaAssets,
  onSelect,
  onAltTextChange,
  onUpload,
}: HeroSlideCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isEditingAlt, setIsEditingAlt] = useState(false);

  return (
    <>
      <div
        className={cx(
          "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
          selectedAsset
            ? "border-border-soft bg-surface-canvas shadow-xs"
            : "border-dashed border-border-default bg-surface-subtle",
        )}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {selectedAsset?.publicUrl ? (
            selectedAsset.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedAsset.publicUrl}
                alt={altText || selectedAsset.storageKey}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={selectedAsset.publicUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted">
              <ImageIcon className="h-10 w-10" />
              <p className="text-body-sm">Sin imagen</p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="absolute inset-x-0 top-3 flex items-center justify-start px-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              Slide {slideNumber}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-label-sm text-text-primary shadow-sm backdrop-blur-sm transition-all hover:bg-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-label-sm text-text-primary shadow-sm backdrop-blur-sm transition-all hover:bg-white"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir
            </button>
            {selectedAsset ? (
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-red-500/90 px-3 text-label-sm text-white shadow-sm backdrop-blur-sm transition-all hover:bg-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 p-3">
          {selectedAsset ? (
            <>
              <p className="truncate text-caption text-text-secondary">
                {selectedAsset.storageKey}
              </p>
              {isEditingAlt ? (
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => onAltTextChange(e.target.value)}
                  onBlur={() => setIsEditingAlt(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingAlt(false);
                  }}
                  autoFocus
                  placeholder="Alt text de la imagen"
                  className="w-full rounded-md border border-border-default bg-surface-canvas px-2 py-1 text-caption text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-brand"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingAlt(true)}
                  className="w-full truncate text-left text-caption text-text-muted transition-colors hover:text-text-secondary"
                  title={altText || "Click para agregar alt text"}
                >
                  {altText || "+ Agregar alt text"}
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full text-center text-body-sm text-text-muted transition-colors hover:text-brand-primary"
            >
              Seleccionar o subir imagen
            </button>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(asset) => {
          onSelect(asset);
          if (!altText.trim() && asset.altText) {
            onAltTextChange(asset.altText);
          }
        }}
        onUpload={onUpload}
        mediaAssets={mediaAssets}
        selectedAssetId={selectedAsset?.id}
        title={`Seleccionar imagen para Slide ${slideNumber}`}
      />
    </>
  );
}
