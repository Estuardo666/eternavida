"use client";

import { useState, useEffect, useCallback } from "react";

interface UseWishlistReturn {
  isFavorited: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  isLoading: boolean;
  count: number;
}

export function useWishlist(): UseWishlistReturn {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.success) {
          const ids = new Set<string>(
            data.data.items.map((i: { productId: string }) => i.productId),
          );
          setFavoriteIds(ids);
        }
      } catch {
        // fail silently
      }
    }
    fetchWishlist();
    return () => { cancelled = true; };
  }, []);

  const isFavorited = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const toggle = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (data.data.added) {
              next.add(productId);
            } else {
              next.delete(productId);
            }
            return next;
          });
        }
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isFavorited,
    toggle,
    isLoading,
    count: favoriteIds.size,
  };
}
