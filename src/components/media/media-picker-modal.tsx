"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";
import type { AdminMediaAssetSummary } from "@/types/admin-home-content";
import type { MediaFolderTree } from "@/types/media-library";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: AdminMediaAssetSummary) => void;
  /** Storage key prefix used when uploading a new file from within the picker.
   *  Defaults to "Media/Picker". */
  uploadStorageKeyPrefix?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Request failed");
  return json.data as T;
}

async function fetchFolders(): Promise<MediaFolderTree[]> {
  const data = await apiFetch<{ folders: MediaFolderTree[] }>("/api/admin/media-library/folders");
  return data.folders;
}

async function fetchAssets(folderId: string | null | "all"): Promise<AdminMediaAssetSummary[]> {
  const param =
    folderId === "all" ? "all" : folderId === null ? "uncategorized" : folderId;
  const data = await apiFetch<{ mediaAssets: AdminMediaAssetSummary[] }>(
    `/api/admin/media-assets?folderId=${param}`,
  );
  return data.mediaAssets;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 8C2 6.9 2.9 6 4 6H9.5L11.5 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 16L8 11L13 16L17 12L21 16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 15V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Folder tree node ─────────────────────────────────────────────────────────

function FolderNode({
  folder,
  selectedId,
  onSelect,
  depth,
}: {
  folder: MediaFolderTree;
  selectedId: string | null | "all";
  onSelect: (id: string | null) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedId === folder.id;

  return (
    <li>
      <div
        className={cx(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors duration-150",
          isSelected ? "bg-surface-brandTint text-text-brand" : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <button
          type="button"
          onClick={() => folder.children.length > 0 && setExpanded((v) => !v)}
          className={cx("shrink-0", folder.children.length > 0 ? "cursor-pointer" : "cursor-default opacity-0")}
          tabIndex={-1}
        >
          <svg viewBox="0 0 16 16" className={cx("h-2.5 w-2.5 transition-transform", expanded ? "rotate-90" : "")} fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-label-sm"
        >
          <FolderIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{folder.name}</span>
          <span className="ml-auto text-caption text-text-muted">{folder.assetCount}</span>
        </button>
      </div>
      {expanded && folder.children.length > 0 && (
        <ul>
          {folder.children.map((child) => (
            <FolderNode key={child.id} folder={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Asset thumbnail ──────────────────────────────────────────────────────────

function AssetThumb({
  asset,
  selected,
  onClick,
}: {
  asset: AdminMediaAssetSummary;
  selected: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const filename = asset.storageKey.split("/").pop() ?? asset.storageKey;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group relative overflow-hidden rounded-xl border-2 transition-all duration-150",
        selected
          ? "border-[#163c31] shadow-[0_0_0_3px_rgba(22,60,49,0.15)]"
          : "border-transparent hover:border-[#b8d0b4]",
      )}
    >
      <div className="aspect-square bg-surface-subtle">
        {asset.publicUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.publicUrl}
            alt={asset.altText || filename}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-7 w-7 text-text-muted" />
          </div>
        )}
      </div>
      <div className="px-1.5 py-1">
        <p className="truncate text-left text-caption text-text-secondary" title={filename}>{filename}</p>
      </div>
      {selected && (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#163c31]">
          <CheckIcon className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MediaPickerModal({ open, onClose, onSelect, uploadStorageKeyPrefix = "Media/Picker" }: MediaPickerModalProps) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [folders, setFolders] = useState<MediaFolderTree[]>([]);
  const [assets, setAssets] = useState<AdminMediaAssetSummary[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null | "all">("all");
  const [search, setSearch] = useState("");
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [highlighted, setHighlighted] = useState<AdminMediaAssetSummary | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load folders once
  useEffect(() => {
    if (!open) return;
    fetchFolders().then(setFolders).catch(() => {});
  }, [open]);

  // Load assets on folder change
  const loadAssets = useCallback(async () => {
    setLoadingAssets(true);
    try {
      const data = await fetchAssets(selectedFolder);
      setAssets(data);
    } catch {
      // silent
    } finally {
      setLoadingAssets(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (!open) return;
    void loadAssets();
  }, [open, loadAssets]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setHighlighted(null);
      setSearch("");
      setTab("library");
    }
  }, [open]);

  // Cleanup upload preview URL
  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    };
  }, [uploadPreview]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filteredAssets = search.trim()
    ? assets.filter((a) => {
        const q = search.trim().toLowerCase();
        return (
          a.storageKey.toLowerCase().includes(q) ||
          a.altText.toLowerCase().includes(q) ||
          (a.mimeType?.toLowerCase().includes(q) ?? false)
        );
      })
    : assets;

  function handleSelect() {
    if (!highlighted) return;
    onSelect(highlighted);
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadError(null);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const timestamp = Date.now();
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `${uploadStorageKeyPrefix}/${timestamp}-${safeName}`;

      const formData = new FormData();
      formData.set("file", uploadFile);
      formData.set("storageKey", storageKey);
      formData.set("kind", uploadFile.type.startsWith("video/") ? "video" : "image");
      formData.set("altText", uploadFile.name.replace(/\.[^.]+$/, ""));

      const res = await fetch("/api/admin/media-assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Upload failed");

      const uploaded = json.data.mediaAsset as AdminMediaAssetSummary;
      onSelect(uploaded);
      onClose();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[#d9e5d5] bg-white shadow-[0_40px_80px_-24px_rgba(28,56,41,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4ede1] px-6 py-4">
          <div className="flex gap-1 rounded-xl border border-[#d0dccb] p-0.5">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={cx(
                "rounded-lg px-4 py-1.5 text-label-sm transition-colors duration-150",
                tab === "library" ? "bg-[#163c31] text-white shadow-sm" : "text-text-secondary hover:text-text-primary",
              )}
            >
              Biblioteca
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={cx(
                "rounded-lg px-4 py-1.5 text-label-sm transition-colors duration-150",
                tab === "upload" ? "bg-[#163c31] text-white shadow-sm" : "text-text-secondary hover:text-text-primary",
              )}
            >
              Subir nueva
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d0dccb] text-text-muted transition-colors hover:border-border-brand hover:text-text-primary"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {tab === "library" ? (
          <div className="flex min-h-0 flex-1">
            {/* Folder sidebar */}
            <aside className="w-48 shrink-0 overflow-y-auto border-r border-[#e4ede1] px-3 py-3">
              <p className="mb-2 px-2 text-caption uppercase tracking-wider text-text-muted">Carpetas</p>
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedFolder("all")}
                    className={cx(
                      "flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-label-sm transition-colors",
                      selectedFolder === "all" ? "bg-surface-brandTint text-text-brand" : "text-text-secondary hover:bg-surface-subtle",
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <span className="flex-1">Todos</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(null)}
                    className={cx(
                      "flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-label-sm transition-colors",
                      selectedFolder === null ? "bg-surface-brandTint text-text-brand" : "text-text-secondary hover:bg-surface-subtle",
                    )}
                  >
                    <FolderIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">Sin carpeta</span>
                  </button>
                </li>
                {folders.map((folder) => (
                  <FolderNode
                    key={folder.id}
                    folder={folder}
                    selectedId={selectedFolder}
                    onSelect={setSelectedFolder}
                    depth={0}
                  />
                ))}
              </ul>
            </aside>

            {/* Asset grid */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* Search */}
              <div className="border-b border-[#e4ede1] px-4 py-3">
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar…"
                    className="w-full rounded-xl border border-[#d0dccb] bg-white py-2 pl-9 pr-3 text-body-sm text-text-primary placeholder-text-muted outline-none focus:border-border-brand focus:ring-1 focus:ring-border-brand"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingAssets ? (
                  <div className="flex h-full items-center justify-center text-body-sm text-text-muted">Cargando…</div>
                ) : filteredAssets.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <ImageIcon className="h-8 w-8 text-text-muted" />
                    <p className="text-body-sm text-text-secondary">
                      {search.trim() ? `Sin resultados para "${search}"` : "Sin archivos en esta carpeta"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("upload")}
                      className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Subir imagen
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {filteredAssets.map((asset) => (
                      <AssetThumb
                        key={asset.id}
                        asset={asset}
                        selected={highlighted?.id === asset.id}
                        onClick={() => setHighlighted(asset)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Upload tab */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <div
              className={cx(
                ADMIN_INSET_CARD_CLASS_NAME,
                "flex w-full max-w-md cursor-pointer flex-col items-center gap-4 py-10 text-center transition-colors",
                "border-2 border-dashed border-[#c8dac4] hover:border-border-brand",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={uploadPreview} alt="Preview" className="max-h-48 max-w-full rounded-xl object-contain" />
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c8dac4] bg-white">
                    <UploadIcon className="h-6 w-6 text-text-muted" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-body-sm font-medium text-text-primary">Haz clic para seleccionar</p>
                    <p className="text-caption text-text-muted">Imágenes o videos · Máx 25 MB</p>
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadFile && (
              <p className="text-body-sm text-text-secondary">
                Seleccionado: <span className="font-medium text-text-primary">{uploadFile.name}</span>
              </p>
            )}

            {uploadError && (
              <p className="text-body-sm text-status-error">{uploadError}</p>
            )}

            <div className="flex gap-3">
              {uploadFile && (
                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={uploading}
                  className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  {uploading ? "Subiendo…" : "Subir y seleccionar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setTab("library")}
                className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              >
                ← Biblioteca
              </button>
            </div>
          </div>
        )}

        {/* Footer — only in library tab */}
        {tab === "library" && (
          <div className="flex items-center justify-between border-t border-[#e4ede1] px-6 py-4">
            <p className="text-caption text-text-muted">
              {highlighted ? (
                <span className="text-text-secondary">
                  Seleccionado: <strong>{highlighted.storageKey.split("/").pop()}</strong>
                </span>
              ) : (
                "Selecciona una imagen de la biblioteca"
              )}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSelect}
                disabled={!highlighted}
                className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
              >
                Usar imagen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
