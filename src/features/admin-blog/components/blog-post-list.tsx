"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Plus, Search, Trash2, Edit2, PenLine, ExternalLink } from "lucide-react";

import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_BUTTON_DANGER_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { deleteBlogPostClient } from "@/services/admin-blog/client";
import { cx } from "@/lib/utils";
import type { AdminBlogListData, AdminBlogCategoryItem } from "@/types/admin-blog";

interface BlogPostListProps {
  data: AdminBlogListData;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));
}

export function BlogPostList({ data }: BlogPostListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Eliminar la entrada "${title}"?`)) return;

    try {
      await deleteBlogPostClient(id);
      startTransition(() => router.refresh());
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Error al eliminar.");
    }
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { href: "/admin/blog/posts", label: "Blog" },
          { label: "Entradas" },
        ]}
      />

      <section className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
        <div>
          <h1 className="text-section-lg text-text-primary">Entradas de blog</h1>
          <p className="text-body-md text-text-secondary">
            {data.publishedCount} publicadas · {data.draftCount} borradores
          </p>
        </div>
        <Link href="/admin/blog/posts/new" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva entrada
        </Link>
      </section>

      {deleteError && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      <div className={cx(ADMIN_PANEL_SURFACE_CLASS_NAME, "space-y-3")}>
        {data.posts.length === 0 ? (
          <p className="py-8 text-center text-body-md text-text-secondary">No hay entradas de blog todavía.</p>
        ) : (
          data.posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-lg border border-border-soft bg-surface-canvas p-4 transition-colors hover:border-border-brand"
            >
              {post.featuredImageUrl ? (
                <img
                  src={post.featuredImageUrl}
                  alt={post.featuredImageAltText || post.title}
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-tertiary">
                  <PenLine className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-text-primary">{post.title}</p>
                <p className="text-caption text-text-tertiary">
                  {post.categoryName ?? "Sin categoría"} · {post.authorName} · {formatDate(post.publishedAt ?? post.createdAt)}
                  {post.tagNames.length > 0 && ` · ${post.tagNames.join(", ")}`}
                </p>
              </div>

              <span
                className={cx(
                  "inline-flex rounded-full px-2.5 py-0.5 text-label-xs",
                  post.status === "published"
                    ? "bg-status-success/10 text-status-success"
                    : "bg-status-warning/10 text-status-warning",
                )}
              >
                {post.status === "published" ? "Publicado" : "Borrador"}
              </span>

              <div className="flex gap-2">
                {post.status === "published" && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                    title="Ver post"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Link
                  href={`/admin/blog/posts/${post.slug}`}
                  className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={isPending}
                  className={ADMIN_BUTTON_DANGER_CLASS_NAME}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
