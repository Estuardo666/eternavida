"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";
import type { MediaFolderTree } from "@/types/media-library";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: "image" | "video";
  altText: string;
  mimeType: string | null;
  folderId: string | null;
  createdAt: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json.data as T;
}

async function fetchFolders(): Promise<MediaFolderTree[]> {
  const data = await apiFetch<{ folders: MediaFolderTree[] }>("/api/admin/media-library/folders");
  return data.folders;
}

async function fetchAssets(folderId: string | null | "all"): Promise<MediaAsset[]> {
  const param =
    folderId === "all" ? "all" : folderId === null ? "uncategorized" : folderId;
  const data = await apiFetch<{ mediaAssets: MediaAsset[] }>(
    `/api/admin/media-assets?folderId=${param}`,
  );
  return data.mediaAssets;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function FolderIcon({ open, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      {open ? (
        <path
          d="M2 9.5C2 8.4 2.9 7.5 4 7.5H9.5L11.5 5.5H20C21.1 5.5 22 6.4 22 7.5V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V9.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            d="M2 8C2 6.9 2.9 6 4 6H9.5L11.5 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </>
      )}
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

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 9.5L22 6V18L16 14.5V9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 6V4H16V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 6L6 20H18L19 6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 20H8L18 10L14 6L4 16V20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 6L18 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Folder Tree Node ─────────────────────────────────────────────────────────

function FolderNode({
  folder,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  depth,
}: {
  folder: MediaFolderTree;
  selectedId: string | null | "all";
  onSelect: (id: string | null) => void;
  onRename: (folder: MediaFolderTree) => void;
  onDelete: (folder: MediaFolderTree) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedId === folder.id;
  const hasChildren = folder.children.length > 0;

  return (
    <li>
      <div
        className={cx(
          "group flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-colors duration-150",
          isSelected
            ? "bg-surface-brandTint text-text-brand"
            : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((v) => !v)}
          className={cx("shrink-0", hasChildren ? "cursor-pointer" : "cursor-default opacity-0")}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={expanded ? "Colapsar" : "Expandir"}
        >
          <svg
            viewBox="0 0 16 16"
            className={cx("h-3 w-3 transition-transform duration-150", expanded ? "rotate-90" : "")}
            fill="none"
          >
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-label-sm"
        >
          <FolderIcon open={isSelected || expanded} className="h-4 w-4 shrink-0" />
          <span className="truncate">{folder.name}</span>
          <span className="ml-auto shrink-0 text-caption text-text-muted">{folder.assetCount}</span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onRename(folder)}
            className="rounded-lg p-1 hover:bg-surface-subtle"
            aria-label="Renombrar carpeta"
          >
            <PencilIcon className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(folder)}
            className="rounded-lg p-1 text-status-error hover:bg-surface-subtle"
            aria-label="Eliminar carpeta"
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <ul>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  selected,
  onToggleSelect,
  onRangeSelect,
  onDelete,
}: {
  asset: MediaAsset;
  selected: boolean;
  onToggleSelect: (id: string, ctrl: boolean) => void;
  onRangeSelect: (id: string) => void;
  onDelete: (asset: MediaAsset) => void;
}) {
  const [imgError, setImgError] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (e.shiftKey) {
      e.preventDefault();
      onRangeSelect(asset.id);
    } else {
      onToggleSelect(asset.id, e.metaKey || e.ctrlKey);
    }
  }

  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-2xl border transition-shadow duration-200",
        selected
          ? "border-[#163c31] shadow-[0_0_0_2px_rgba(22,60,49,0.2)]"
          : "border-[#d7e3d3] hover:shadow-[0_8px_24px_-12px_rgba(28,56,41,0.3)]",
        "bg-surface-subtle",
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleClick}
        className={cx(
          "absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-150",
          selected
            ? "border-[#163c31] bg-[#163c31]"
            : "border-white/80 bg-black/20 opacity-0 group-hover:opacity-100",
        )}
        aria-label={selected ? "Deseleccionar" : "Seleccionar"}
      >
        {selected && (
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="relative aspect-square bg-surface-subtle">
        {asset.kind === "image" && asset.publicUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.publicUrl}
            alt={asset.altText || asset.storageKey}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {asset.kind === "video" ? (
              <VideoIcon className="h-8 w-8 text-text-muted" />
            ) : (
              <ImageIcon className="h-8 w-8 text-text-muted" />
            )}
          </div>
        )}

        <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/30 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onDelete(asset)}
            className="rounded-xl bg-white/90 p-1.5 text-status-error shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            aria-label="Eliminar asset"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="px-2.5 py-2">
        <p className="truncate text-caption text-text-secondary" title={asset.storageKey}>
          {asset.storageKey.split("/").pop()}
        </p>
        <p className="text-caption text-text-muted">{asset.mimeType ?? asset.kind}</p>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function MediaLibraryPanel() {
  const [folders, setFolders] = useState<MediaFolderTree[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null | "all">("all");
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New folder modal
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [savingFolder, setSavingFolder] = useState(false);

  // Rename modal
  const [renamingFolder, setRenamingFolder] = useState<MediaFolderTree | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  // Delete folder confirm
  const [deletingFolder, setDeletingFolder] = useState<MediaFolderTree | null>(null);
  const [deletingFolderInProgress, setDeletingFolderInProgress] = useState(false);

  // Delete asset confirm
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [deletingAssetInProgress, setDeletingAssetInProgress] = useState(false);

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; done: number } | null>(null);

  // Search + columns
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState(4);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const [movingBatch, setMovingBatch] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const lastSelectedIndex = useRef<number>(-1);

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const loadFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const data = await fetchFolders();
      setFolders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando carpetas");
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const loadAssets = useCallback(async () => {
    try {
      setLoadingAssets(true);
      const data = await fetchAssets(selectedFolder);
      setAssets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando assets");
    } finally {
      setLoadingAssets(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setSavingFolder(true);
    try {
      await apiFetch("/api/admin/media-library/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      setNewFolderName("");
      setShowNewFolder(false);
      await loadFolders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creando carpeta");
    } finally {
      setSavingFolder(false);
    }
  };

  // Rename folder
  const handleRename = async () => {
    if (!renamingFolder || !renameValue.trim()) return;
    setSavingRename(true);
    try {
      await apiFetch(`/api/admin/media-library/folders/${renamingFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      setRenamingFolder(null);
      setRenameValue("");
      await loadFolders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error renombrando carpeta");
    } finally {
      setSavingRename(false);
    }
  };

  // Delete folder
  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    setDeletingFolderInProgress(true);
    try {
      await apiFetch(`/api/admin/media-library/folders/${deletingFolder.id}`, { method: "DELETE" });
      setDeletingFolder(null);
      await loadFolders();
      await loadAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando carpeta");
    } finally {
      setDeletingFolderInProgress(false);
    }
  };

  // Delete asset
  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    setDeletingAssetInProgress(true);
    try {
      await apiFetch(`/api/admin/media-assets/${deletingAsset.id}`, { method: "DELETE" });
      setDeletingAsset(null);
      await loadAssets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando archivo");
    } finally {
      setDeletingAssetInProgress(false);
    }
  };

  // Upload files (one or many)
  const uploadSingleFile = async (file: File): Promise<void> => {
    const timestamp = Date.now() + Math.random();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `Media/Library/${Math.floor(timestamp)}-${safeName}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("storageKey", storageKey);
    formData.append("kind", file.type.startsWith("video/") ? "video" : "image");
    formData.append("altText", file.name.replace(/\.[^.]+$/, ""));

    const res = await fetch("/api/admin/media-assets/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json?.error?.message ?? `Error subiendo ${file.name}`);

    if (selectedFolder && selectedFolder !== "all" && selectedFolder !== null) {
      const assetId = (json.data?.mediaAsset?.id ?? json.data?.id) as string | undefined;
      if (assetId) {
        await apiFetch(`/api/admin/media-assets/${assetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: selectedFolder }),
        });
      }
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setUploadProgress({ total: files.length, done: 0 });

    const errors: string[] = [];
    await Promise.all(
      files.map(async (file) => {
        try {
          await uploadSingleFile(file);
        } catch (e) {
          errors.push(e instanceof Error ? e.message : `Error: ${file.name}`);
        } finally {
          setUploadProgress((prev) => prev ? { ...prev, done: prev.done + 1 } : null);
        }
      }),
    );

    await loadAssets();
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (errors.length > 0) setError(errors.join(" · "));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await uploadFiles(files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  // Batch handlers
  const toggleSelect = (id: string, ctrl: boolean) => {
    const idx = filteredAssets.findIndex((a) => a.id === id);
    if (idx !== -1) lastSelectedIndex.current = idx;

    if (ctrl) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        if (prev.size === 1 && prev.has(id)) return new Set();
        return new Set([id]);
      });
    }
  };

  const handleRangeSelect = (id: string) => {
    const toIdx = filteredAssets.findIndex((a) => a.id === id);
    if (toIdx === -1) return;
    const fromIdx = lastSelectedIndex.current >= 0 ? lastSelectedIndex.current : toIdx;
    const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    const rangeIds = filteredAssets.slice(start, end + 1).map((a) => a.id);
    setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
    lastSelectedIndex.current = toIdx;
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    lastSelectedIndex.current = -1;
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeletingBatch(true);
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) =>
        apiFetch(`/api/admin/media-assets/${id}`, { method: "DELETE" }).catch(() => null),
      ),
    );
    setSelectedIds(new Set());
    setDeletingBatch(false);
    await loadAssets();
  };

  const handleBatchMove = async (folderId: string | null) => {
    if (selectedIds.size === 0) return;
    setMovingBatch(true);
    setShowMoveMenu(false);
    const ids = Array.from(selectedIds);
    await Promise.all(
      ids.map((id) =>
        apiFetch(`/api/admin/media-assets/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        }).catch(() => null),
      ),
    );
    setSelectedIds(new Set());
    setMovingBatch(false);
    await loadAssets();
  };

  const filteredAssets = search.trim()
    ? assets.filter((a) => {
        const q = search.trim().toLowerCase();
        return (
          a.storageKey.toLowerCase().includes(q) ||
          (a.altText && a.altText.toLowerCase().includes(q)) ||
          (a.mimeType && a.mimeType.toLowerCase().includes(q))
        );
      })
    : assets;

  const selectAll = () => setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  const allSelected = filteredAssets.length > 0 && filteredAssets.every((a) => selectedIds.has(a.id));

  const selectedFolderLabel =
    selectedFolder === "all"
      ? "Todos los archivos"
      : selectedFolder === null
        ? "Sin carpeta"
        : (function find(nodes: MediaFolderTree[]): string {
            for (const n of nodes) {
              if (n.id === selectedFolder) return n.name;
              const found = find(n.children);
              if (found) return found;
            }
            return "Carpeta";
          })(folders);

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Gestión</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">
              Biblioteca de medios
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
              className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              {uploadProgress
                ? `Subiendo ${uploadProgress.done}/${uploadProgress.total}…`
                : "Subir archivos"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-[#efc4c4] bg-[#fff5f5] px-4 py-3 text-body-sm text-status-error">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-3 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Folder sidebar */}
        <aside className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "lg:w-64 lg:shrink-0 xl:sticky xl:top-6 xl:self-start")}>
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-label-sm font-semibold text-text-primary">Carpetas</h2>
            <button
              type="button"
              onClick={() => setShowNewFolder(true)}
              className="rounded-xl border border-[#cfdbcb] p-1.5 text-text-secondary transition-colors hover:border-border-brand hover:text-text-brand"
              aria-label="Nueva carpeta"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {showNewFolder && (
            <div className={cx(ADMIN_INSET_CARD_CLASS_NAME, "mb-3 space-y-2")}>
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateFolder();
                  if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
                }}
                placeholder="Nombre de carpeta"
                className="w-full rounded-xl border border-[#d0dccb] bg-white px-3 py-1.5 text-body-sm text-text-primary placeholder-text-muted outline-none focus:border-border-brand focus:ring-1 focus:ring-border-brand"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreateFolder()}
                  disabled={savingFolder || !newFolderName.trim()}
                  className={cx(ADMIN_BUTTON_PRIMARY_CLASS_NAME, "flex-1 text-xs")}
                >
                  {savingFolder ? "…" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                  className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1 text-xs")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <nav>
            <ul className="space-y-0.5">
              {/* All files */}
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedFolder("all")}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-label-sm transition-colors duration-150",
                    selectedFolder === "all"
                      ? "bg-surface-brandTint text-text-brand"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <span className="flex-1">Todos los archivos</span>
                </button>
              </li>

              {/* Uncategorized */}
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedFolder(null)}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-label-sm transition-colors duration-150",
                    selectedFolder === null
                      ? "bg-surface-brandTint text-text-brand"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                  )}
                >
                  <FolderIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Sin carpeta</span>
                </button>
              </li>

              {loadingFolders ? (
                <li className="py-3 text-center text-caption text-text-muted">Cargando…</li>
              ) : (
                folders.map((folder) => (
                  <FolderNode
                    key={folder.id}
                    folder={folder}
                    selectedId={selectedFolder}
                    onSelect={setSelectedFolder}
                    onRename={(f) => { setRenamingFolder(f); setRenameValue(f.name); }}
                    onDelete={setDeletingFolder}
                    depth={0}
                  />
                ))
              )}
            </ul>
          </nav>
        </aside>

        {/* Asset grid */}
        <section
          className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "relative min-w-0 flex-1 transition-colors duration-150", isDragging && "border-border-brand bg-surface-brandTint")}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-border-brand bg-surface-brandTint/80 backdrop-blur-sm">
              <UploadIcon className="h-10 w-10 text-text-brand" />
              <p className="text-section-sm font-medium text-text-brand">Suelta para subir</p>
            </div>
          )}
          {uploadProgress !== null && !isDragging && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 rounded-t-[24px] bg-surface-brandTint/95 px-5 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-caption text-text-brand">
                    <span>Subiendo archivos…</span>
                    <span>{uploadProgress.done}/{uploadProgress.total}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#c8dac4]">
                    <div
                      className="h-full rounded-full bg-[#163c31] transition-all duration-300"
                      style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-label-sm font-semibold text-text-primary">{selectedFolderLabel}</h2>
                {!loadingAssets && (
                  <p className="text-caption text-text-muted">
                    {filteredAssets.length}{search.trim() ? ` de ${assets.length}` : ""}{" "}
                    {assets.length === 1 ? "archivo" : "archivos"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Select all toggle */}
                {filteredAssets.length > 0 && (
                  <button
                    type="button"
                    onClick={allSelected ? clearSelection : selectAll}
                    className="text-caption text-text-brand underline"
                  >
                    {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                  </button>
                )}

                {/* Columns slider */}
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true">
                    <rect x="3" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="10" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="17" y="3" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="10" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="17" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={columns}
                    onChange={(e) => setColumns(Number(e.target.value))}
                    className="h-1.5 w-24 cursor-pointer accent-[#163c31]"
                    aria-label="Número de columnas"
                  />
                  <span className="w-4 text-right text-caption text-text-muted">{columns}</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, tipo…"
                className="w-full rounded-xl border border-[#d0dccb] bg-white py-2 pl-9 pr-3 text-body-sm text-text-primary placeholder-text-muted outline-none focus:border-border-brand focus:ring-1 focus:ring-border-brand"
              />
            </div>
          </div>

          {loadingAssets ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-body-sm text-text-muted">Cargando archivos…</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed border-border-soft bg-surface-subtle px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d0dccb] bg-white">
                <ImageIcon className="h-5 w-5 text-text-muted" />
              </div>
              <div className="space-y-1">
                <p className="text-body-sm text-text-secondary">Sin archivos aquí</p>
                <p className="text-caption text-text-muted">
                  Sube un archivo o mueve uno a esta carpeta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                Subir archivo
              </button>
            </div>
          ) : filteredAssets.length === 0 && search.trim() ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
              <p className="text-body-sm text-text-secondary">Sin resultados para &ldquo;{search}&rdquo;</p>
              <button type="button" onClick={() => setSearch("")} className="text-caption text-text-brand underline">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  selected={selectedIds.has(asset.id)}
                  onToggleSelect={toggleSelect}
                  onRangeSelect={handleRangeSelect}
                  onDelete={setDeletingAsset}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Batch action bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-2xl border border-[#d9e5d5] bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(28,56,41,0.4)]">
            <span className="mr-1 text-label-sm text-text-primary">
              {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
            </span>

            {/* Move to folder */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoveMenu((v) => !v)}
                disabled={movingBatch}
                className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              >
                <svg viewBox="0 0 24 24" fill="none" className="mr-2 h-4 w-4" aria-hidden="true">
                  <path d="M2 8C2 6.9 2.9 6 4 6H9.5L11.5 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                {movingBatch ? "Moviendo…" : "Mover a"}
              </button>

              {showMoveMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-52 overflow-hidden rounded-xl border border-[#d9e5d5] bg-white shadow-[0_8px_24px_-8px_rgba(28,56,41,0.3)]">
                  <div className="max-h-56 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => void handleBatchMove(null)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-label-sm text-text-secondary hover:bg-surface-subtle"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <path d="M2 8C2 6.9 2.9 6 4 6H9.5L11.5 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                      Sin carpeta
                    </button>
                    {(function renderFolderOptions(nodes: MediaFolderTree[], depth = 0): React.ReactNode {
                      return nodes.map((f) => (
                        <div key={f.id}>
                          <button
                            type="button"
                            onClick={() => void handleBatchMove(f.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-label-sm text-text-secondary hover:bg-surface-subtle"
                            style={{ paddingLeft: `${12 + depth * 12}px` }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                              <path d="M2 8C2 6.9 2.9 6 4 6H9.5L11.5 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            </svg>
                            {f.name}
                          </button>
                          {f.children.length > 0 && renderFolderOptions(f.children, depth + 1)}
                        </div>
                      ));
                    })(folders)}
                  </div>
                </div>
              )}
            </div>

            {/* Delete batch */}
            <button
              type="button"
              onClick={() => setConfirmBatchDelete(true)}
              disabled={deletingBatch}
              className={ADMIN_BUTTON_DANGER_CLASS_NAME}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {deletingBatch ? "Eliminando…" : "Eliminar"}
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="ml-1 rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              aria-label="Cancelar selección"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Batch delete confirm ── */}
      {confirmBatchDelete && (
        <Modal onClose={() => setConfirmBatchDelete(false)}>
          <h3 className="mb-2 text-section-sm text-text-primary">Eliminar archivos</h3>
          <p className="mb-4 text-body-sm text-text-secondary">
            ¿Eliminar <strong>{selectedIds.size} archivo{selectedIds.size !== 1 ? "s" : ""}</strong>? Se borrarán del almacenamiento permanentemente.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setConfirmBatchDelete(false); void handleBatchDelete(); }}
              disabled={deletingBatch}
              className={cx(ADMIN_BUTTON_DANGER_CLASS_NAME, "flex-1")}
            >
              {deletingBatch ? "Eliminando…" : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmBatchDelete(false)}
              className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1")}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Rename modal ── */}
      {renamingFolder && (
        <Modal onClose={() => { setRenamingFolder(null); setRenameValue(""); }}>
          <h3 className="mb-4 text-section-sm text-text-primary">Renombrar carpeta</h3>
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleRename();
              if (e.key === "Escape") { setRenamingFolder(null); setRenameValue(""); }
            }}
            className="mb-4 w-full rounded-xl border border-[#d0dccb] bg-white px-3 py-2 text-body-sm text-text-primary outline-none focus:border-border-brand focus:ring-1 focus:ring-border-brand"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleRename()}
              disabled={savingRename || !renameValue.trim()}
              className={cx(ADMIN_BUTTON_PRIMARY_CLASS_NAME, "flex-1")}
            >
              {savingRename ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => { setRenamingFolder(null); setRenameValue(""); }}
              className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1")}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete folder confirm ── */}
      {deletingFolder && (
        <Modal onClose={() => setDeletingFolder(null)}>
          <h3 className="mb-2 text-section-sm text-text-primary">Eliminar carpeta</h3>
          <p className="mb-4 text-body-sm text-text-secondary">
            ¿Eliminar <strong>{deletingFolder.name}</strong>? Los archivos dentro quedarán sin carpeta.
            {deletingFolder.childrenCount > 0 && (
              <span className="mt-1 block text-status-error">
                También se eliminarán {deletingFolder.childrenCount} subcarpeta(s).
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleDeleteFolder()}
              disabled={deletingFolderInProgress}
              className={cx(ADMIN_BUTTON_DANGER_CLASS_NAME, "flex-1")}
            >
              {deletingFolderInProgress ? "Eliminando…" : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setDeletingFolder(null)}
              className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1")}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete asset confirm ── */}
      {deletingAsset && (
        <Modal onClose={() => setDeletingAsset(null)}>
          <h3 className="mb-2 text-section-sm text-text-primary">Eliminar archivo</h3>
          <p className="mb-4 text-body-sm text-text-secondary">
            ¿Eliminar <strong>{deletingAsset.storageKey.split("/").pop()}</strong>? Se borrará del almacenamiento permanentemente.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleDeleteAsset()}
              disabled={deletingAssetInProgress}
              className={cx(ADMIN_BUTTON_DANGER_CLASS_NAME, "flex-1")}
            >
              {deletingAssetInProgress ? "Eliminando…" : "Eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setDeletingAsset(null)}
              className={cx(ADMIN_BUTTON_SECONDARY_CLASS_NAME, "flex-1")}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm rounded-[24px] border border-[#d9e5d5] bg-white p-6 shadow-[0_32px_64px_-24px_rgba(28,56,41,0.4)]">
        {children}
      </div>
    </div>
  );
}
