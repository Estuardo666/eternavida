"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

interface CollectionItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  mediaAsset: { publicUrl: string | null; altText: string | null } | null;
  _count: { products: number; categories: number };
  createdAt: string;
}

export function CollectionAdminPanel() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/collections", { credentials: "include" });
      if (res.ok) setCollections((await res.json()).data.items);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) fetchCollections();
    } catch { /* handle error */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta colección?")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchCollections();
    } catch { /* handle error */ }
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catálogo</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Colecciones</h1>
          </div>
          <Link
            href="/admin/collections/new"
            className="rounded-full bg-[#5bb446] px-4 py-2 text-body-sm font-medium text-white hover:bg-[#499038]"
          >
            + Nueva colección
          </Link>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-body-sm text-text-muted">Cargando...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
            <p className="text-body-md text-text-secondary">No hay colecciones creadas.</p>
            <Link href="/admin/collections/new" className="text-body-sm font-medium text-text-brand hover:underline">
              Crear primera colección
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((col) => (
              <div key={col.id} className="flex items-center gap-4 rounded-xl border border-border-soft bg-white p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {col.mediaAsset?.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={col.mediaAsset.publicUrl} alt={col.mediaAsset.altText ?? col.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-label-lg text-text-muted">
                      {col.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/collections/${col.id}`} className="text-body-md font-medium text-text-primary hover:underline">
                      {col.name}
                    </Link>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${col.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-neutral-200 bg-neutral-50 text-neutral-500"}`}>
                      {col.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="text-body-xs text-text-muted">/{col.slug}</p>
                  {col.description ? (
                    <p className="mt-1 line-clamp-1 text-body-sm text-text-secondary">{col.description}</p>
                  ) : null}
                  <p className="mt-1 text-body-xs text-text-muted">
                    {col._count.products} producto{col._count.products !== 1 ? "s" : ""} — {col._count.categories} categoría{col._count.categories !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(col.id, col.isActive)}
                    className={`rounded-lg border px-2.5 py-1 text-[0.68rem] font-medium transition ${col.isActive ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                  >
                    {col.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <Link
                    href={`/admin/collections/${col.id}`}
                    className="rounded-lg border border-border-soft px-2.5 py-1 text-[0.68rem] font-medium text-text-secondary hover:text-text-primary"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(col.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[0.68rem] font-medium text-red-600 hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
