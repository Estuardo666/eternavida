"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { PublicProductCard } from "@/features/catalog/components/public-product-card";
import type { MediaAsset } from "@/types/media";

interface WishlistProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  href: string;
  mediaAssetId: string | null;
  isActive: boolean;
  mediaAsset: {
    publicUrl: string | null;
    altText: string | null;
  } | null;
}

interface WishlistItemData {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}

function toMediaAsset(product: WishlistProduct): MediaAsset | null {
  if (!product.mediaAsset?.publicUrl || !product.mediaAssetId) return null;
  return {
    id: product.mediaAssetId,
    kind: "image",
    url: product.mediaAsset.publicUrl,
    storageKey: null,
    altText: product.mediaAsset.altText || product.name,
  };
}

export function WishlistView() {
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.data.items);
        }
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      }
    } catch {
      // fail silently
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-body-sm text-text-muted">Cargando favoritos...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-section-lg text-text-primary">Mis Favoritos</h1>
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-border-soft bg-white p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-text-muted" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="space-y-1">
            <h2 className="text-body-lg font-semibold text-text-primary">No tienes favoritos</h2>
            <p className="text-body-sm text-text-secondary">
              Explora nuestros productos y guarda los que más te gusten.
            </p>
          </div>
          <Link
            href="/productos"
            className="rounded-full bg-brand-primary px-5 py-2.5 text-body-md font-medium text-white transition hover:bg-brand-primaryHover"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-section-lg text-text-primary">Mis Favoritos</h1>
        <span className="text-body-sm text-text-secondary">
          {items.length} producto{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const product = item.product;

          return (
            <div key={item.id} className="relative">
              <PublicProductCard
                product={{
                  id: product.id,
                  name: product.name,
                  brand: product.brand,
                  href: product.href,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  stock: product.stock,
                  media: toMediaAsset(product),
                  category: null,
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(item.productId)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-white/90 text-text-muted transition hover:bg-red-50 hover:text-red-500"
                aria-label="Quitar de favoritos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
