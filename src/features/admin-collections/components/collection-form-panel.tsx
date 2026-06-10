"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

interface ProductOption {
  id: string;
  name: string;
  brand: string;
  slug: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface CollectionData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  excerpt: string | null;
  isActive: boolean;
  sortOrder: number;
  mediaAssetId: string | null;
  products: Array<{ productId: string; product: ProductOption }>;
  categories: Array<{ categoryId: string; category: CategoryOption }>;
}

interface CollectionFormPanelProps {
  mode: "create" | "edit";
  collectionId?: string;
}

export function CollectionFormPanel({ mode, collectionId }: CollectionFormPanelProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/admin/catalog/products?limit=500", { credentials: "include" }),
          fetch("/api/admin/catalog/categories?limit=200", { credentials: "include" }),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setAllProducts(data.data.items.map((p: ProductOption) => ({ id: p.id, name: p.name, brand: p.brand, slug: p.slug })));
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setAllCategories(data.data.items.map((c: CategoryOption) => ({ id: c.id, name: c.name, slug: c.slug })));
        }
      } catch { /* fail silently */ }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (mode === "edit" && collectionId) {
      async function loadCollection() {
        try {
          const res = await fetch(`/api/admin/collections/${collectionId}`, { credentials: "include" });
          if (res.ok) {
            const data: CollectionData = (await res.json()).data;
            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description ?? "");
            setExcerpt(data.excerpt ?? "");
            setIsActive(data.isActive);
            setSortOrder(data.sortOrder);
            setSelectedProductIds(data.products.map((p) => p.productId));
            setSelectedCategoryIds(data.categories.map((c) => c.categoryId));
          }
        } catch { /* fail silently */ }
        finally { setLoading(false); }
      }
      loadCollection();
    }
  }, [mode, collectionId]);

  const generateSlug = useCallback(() => {
    if (name && mode === "create") {
      setSlug(
        name.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [name, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const body = {
        name,
        slug,
        description: description || null,
        excerpt: excerpt || null,
        isActive,
        sortOrder,
        productIds: selectedProductIds,
        categoryIds: selectedCategoryIds,
      };

      const url = mode === "create" ? "/api/admin/collections" : `/api/admin/collections/${collectionId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/collections");
      }
    } catch { /* handle error */ }
    finally { setSaving(false); }
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-body-sm text-text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Catálogo</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">
              {mode === "create" ? "Nueva Colección" : "Editar Colección"}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/collections")}
              className="rounded-full border border-border-soft px-4 py-2 text-body-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name || !slug}
              className="rounded-full bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primaryHover disabled:opacity-50"
            >
              {saving ? "Guardando..." : mode === "create" ? "Crear colección" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className={`${ADMIN_PANEL_SURFACE_CLASS_NAME} space-y-4`}>
          <h2 className="text-body-lg font-semibold text-text-primary">Información</h2>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-text-primary">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={generateSlug}
              required
              className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              placeholder="Ej: Piel Mixta"
            />
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-text-primary">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md font-mono"
              placeholder="miel-pura"
            />
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-text-primary">Extracto</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={300}
              className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              placeholder="Breve descripción para tarjetas"
            />
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-text-primary">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md resize-none"
              placeholder="Descripción completa de la colección"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-body-md font-medium text-text-primary">Activa</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? "bg-brand-primary" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-text-primary">Orden</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className={`${ADMIN_PANEL_SURFACE_CLASS_NAME} space-y-3`}>
            <h2 className="text-body-lg font-semibold text-text-primary">
              Productos ({selectedProductIds.length} seleccionados)
            </h2>
            <div className="max-h-[300px] space-y-1 overflow-y-auto rounded-lg border border-border-soft p-2">
              {allProducts.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-subtle">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="h-4 w-4 rounded border-border-soft"
                  />
                  <span className="text-body-sm text-text-primary">{p.name}</span>
                  <span className="text-body-xs text-text-muted">{p.brand}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={`${ADMIN_PANEL_SURFACE_CLASS_NAME} space-y-3`}>
            <h2 className="text-body-lg font-semibold text-text-primary">
              Categorías ({selectedCategoryIds.length} seleccionadas)
            </h2>
            <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-lg border border-border-soft p-2">
              {allCategories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-subtle">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                    className="h-4 w-4 rounded border-border-soft"
                  />
                  <span className="text-body-sm text-text-primary">{c.name}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
