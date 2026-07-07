"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Plus, Trash2, Edit2, X } from "lucide-react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { createBlogCategoryClient, updateBlogCategoryClient, deleteBlogCategoryClient } from "@/services/admin-blog/client";
import { cx } from "@/lib/utils";

interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
  _count: { posts: number };
}

interface BlogCategoryManagerProps {
  categories: CategoryRecord[];
}

export function BlogCategoryManager({ categories }: BlogCategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function slugify(text: string): string {
    return text
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function resetForm() {
    setEditingId(null);
    setIsCreating(false);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIsActive(true);
    setError(null);
  }

  function startCreate() {
    resetForm();
    setIsCreating(true);
  }

  function startEdit(cat: CategoryRecord) {
    setEditingId(cat.id);
    setIsCreating(false);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormIsActive(cat.isActive);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);

    try {
      const data = { name: formName, slug: formSlug || slugify(formName), description: formDescription, isActive: formIsActive };

      if (editingId) {
        await updateBlogCategoryClient(editingId, data);
      } else {
        await createBlogCategoryClient(data);
      }

      resetForm();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;

    try {
      await deleteBlogCategoryClient(id);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
    }
  }

  const showForm = isCreating || editingId !== null;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs items={[{ href: "/admin/blog/posts", label: "Blog" }, { label: "Categorías" }]} />

      <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex items-center justify-between")}>
        <div>
          <h1 className="text-section-lg text-text-primary">Categorías de blog</h1>
          <p className="text-body-md text-text-secondary">{categories.length} categorías</p>
        </div>
        <button type="button" onClick={startCreate} className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva categoría
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {showForm && (
        <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-4")}>
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-text-primary">{editingId ? "Editar categoría" : "Nueva categoría"}</p>
            <button type="button" onClick={resetForm} className="text-text-tertiary hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Nombre</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => { setFormName(e.target.value); if (!editingId) setFormSlug(slugify(e.target.value)); }}
                className="rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm text-text-secondary">Slug</span>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 font-mono text-body-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm text-text-secondary">Descripción</span>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="rounded-xl border border-border-soft bg-surface-canvas px-3.5 py-2.5 text-body-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
            />
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="h-4 w-4 rounded accent-brand-primary" />
            <span className="text-body-sm text-text-secondary">Activa</span>
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={handleSubmit} disabled={isPending || !formName.trim()} className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}>
              {editingId ? "Guardar" : "Crear"}
            </button>
            <button type="button" onClick={resetForm} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>Cancelar</button>
          </div>
        </div>
      )}

      <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-2")}>
        {categories.length === 0 ? (
          <p className="py-8 text-center text-body-md text-text-secondary">No hay categorías todavía.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 rounded-lg border border-border-soft bg-surface-canvas p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-text-primary">{cat.name}</p>
                <p className="text-caption text-text-tertiary">
                  /blog/categoria/{cat.slug} · {cat._count.posts} posts
                  {!cat.isActive && " · Inactiva"}
                </p>
              </div>
              <button type="button" onClick={() => startEdit(cat)} className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}>
                <Edit2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => handleDelete(cat.id, cat.name)} className={ADMIN_BUTTON_DANGER_CLASS_NAME}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
