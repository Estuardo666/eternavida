"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

import { cx } from "@/lib/utils";
import type { PublicBlogListData, PublicBlogCategorySummary } from "@/types/blog";

interface BlogListViewProps {
  data: PublicBlogListData;
  categorySlug?: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date(value));
}

export function BlogListView({ data, categorySlug }: BlogListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildPageUrl(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/blog${categorySlug ? `/categoria/${categorySlug}` : ""}?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-display-md text-text-primary sm:text-display-lg">
          {categorySlug ? data.categories.find((c) => c.slug === categorySlug)?.name ?? "Blog" : "Blog"}
        </h1>
        <p className="mt-3 text-body-lg text-text-secondary">
          Artículos sobre bienestar natural, recetas y vida consciente.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Posts grid */}
        <div>
          {data.posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-body-lg text-text-secondary">No hay artículos todavía.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {data.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface-canvas transition-all duration-200 hover:border-border-brand hover:shadow-sm"
                >
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-brand-soft/30 to-surface-subtle">
                      <span className="text-display-lg text-brand-primary/20">EV</span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    {post.category && (
                      <span className="mb-2 text-label-xs uppercase tracking-widest text-brand-primary">
                        {post.category.name}
                      </span>
                    )}

                    <h2 className="text-heading-md text-text-primary transition-colors group-hover:text-brand-primary">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-body-sm text-text-secondary">{post.excerpt}</p>
                    )}

                    <div className="mt-auto flex items-center gap-4 pt-4 text-caption text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readingTimeMinutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Paginación del blog">
              <Link
                href={buildPageUrl(data.pagination.page - 1)}
                className={cx(
                  "inline-flex items-center gap-1 rounded-lg border border-border-soft px-4 py-2 text-body-sm text-text-primary transition-colors hover:border-border-brand",
                  !data.pagination.hasPreviousPage && "pointer-events-none opacity-40",
                )}
                aria-disabled={!data.pagination.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>

              <span className="text-body-sm text-text-secondary">
                Página {data.pagination.page} de {data.pagination.totalPages}
              </span>

              <Link
                href={buildPageUrl(data.pagination.page + 1)}
                className={cx(
                  "inline-flex items-center gap-1 rounded-lg border border-border-soft px-4 py-2 text-body-sm text-text-primary transition-colors hover:border-border-brand",
                  !data.pagination.hasNextPage && "pointer-events-none opacity-40",
                )}
                aria-disabled={!data.pagination.hasNextPage}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--public-header-height,108px)+24px)] lg:self-start">
          {/* Categories */}
          {data.categories.length > 0 && (
            <div className="rounded-2xl border border-border-soft bg-surface-canvas p-5">
              <h3 className="mb-3 text-label-sm text-text-primary">Categorías</h3>
              <ul className="space-y-1.5">
                {data.categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog/categoria/${cat.slug}`}
                      className={cx(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-body-sm transition-colors",
                        cat.slug === categorySlug
                          ? "bg-brand-primary/10 text-brand-primary font-medium"
                          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-caption text-text-tertiary">{cat.postCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
