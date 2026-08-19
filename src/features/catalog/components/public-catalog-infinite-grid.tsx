"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PublicCatalogPagination, PublicCatalogProductSummary } from "@/types/public-catalog";

import { PublicProductGrid } from "./public-product-grid";

interface PublicCatalogInfiniteGridProps {
  initialItems: PublicCatalogProductSummary[];
  initialPagination: PublicCatalogPagination;
  searchParams: Record<string, string>;
  id?: string;
}

export function PublicCatalogInfiniteGrid({
  initialItems,
  initialPagination,
  searchParams,
  id,
}: PublicCatalogInfiniteGridProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPagination.page);
  const [hasNextPage, setHasNextPage] = useState(initialPagination.hasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
    setPage(initialPagination.page);
    setHasNextPage(initialPagination.hasNextPage);
  }, [initialItems, initialPagination]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasNextPage) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams(searchParams);
      params.set("pagina", String(page + 1));

      const response = await fetch(`/api/catalog/products?${params.toString()}`);
      if (!response.ok) return;

      const data = (await response.json()) as {
        items: PublicCatalogProductSummary[];
        pagination: PublicCatalogPagination;
      };

      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...data.items.filter((item) => !seen.has(item.id))];
      });
      setPage(data.pagination.page);
      setHasNextPage(data.pagination.hasNextPage);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasNextPage, page, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, loadMore]);

  return (
    <div className="space-y-6">
      <PublicProductGrid items={items} mobileColumns={2} layout="withSidebar" {...(id ? { id } : {})} />

      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <div className="flex min-h-10 items-center justify-center" aria-live="polite">
        {isLoading ? (
          <span className="text-body-sm text-text-secondary">Cargando más productos…</span>
        ) : !hasNextPage && items.length > 0 ? (
          <span className="text-body-sm text-text-muted">Has visto todos los productos.</span>
        ) : null}
      </div>
    </div>
  );
}
