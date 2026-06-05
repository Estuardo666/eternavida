"use client";

import Link from "next/link";
import { PublicProductGrid } from "./public-product-grid";

interface CollectionProduct {
  productId: string;
  position: number;
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: unknown;
    discountPrice: unknown | null;
    stock: number;
    href: string;
    mediaAssetId: string | null;
    isActive: boolean;
  };
}

interface CollectionCategory {
  categoryId: string;
  position: number;
  category: {
    id: string;
    slug: string;
    name: string;
    href: string;
  };
}

interface CollectionDetailViewProps {
  collection: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    excerpt: string | null;
    mediaAsset: { publicUrl: string | null; altText: string | null } | null;
    products: CollectionProduct[];
    categories: CollectionCategory[];
  };
}

const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export function CollectionDetailView({ collection }: CollectionDetailViewProps) {
  const activeProducts = collection.products
    .filter((p) => p.product.isActive)
    .map((p) => ({
      id: p.product.id,
      slug: p.product.slug,
      name: p.product.name,
      brand: p.product.brand,
      description: "",
      href: p.product.href,
      price: Number(p.product.price),
      discountPrice: p.product.discountPrice ? Number(p.product.discountPrice) : null,
      stock: p.product.stock,
      badge: undefined,
      badgeColor: undefined,
      activePromotion: null,
      media: null,
      category: null,
      categories: [],
    })) as Array<{
      id: string; slug: string; name: string; brand: string; description: string;
      href: string; price: number; discountPrice: number | null; stock: number;
      activePromotion: null; media: null; category: null; categories: never[];
    }>;

  return (
    <div className="container overflow-x-hidden py-10 sm:py-14">
      <div className="space-y-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border-soft bg-white">
          {collection.mediaAsset?.publicUrl ? (
            <div className="aspect-[21/9] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collection.mediaAsset.publicUrl}
                alt={collection.mediaAsset.altText ?? collection.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="p-6 sm:p-8">
            <nav className="mb-4 text-body-sm text-text-secondary">
              <ol className="flex items-center gap-2">
                <li><Link href="/" className="hover:text-text-primary">Inicio</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/colecciones" className="hover:text-text-primary">Colecciones</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-text-primary">{collection.name}</li>
              </ol>
            </nav>
            <h1 className="text-headline-lg text-text-primary">{collection.name}</h1>
            {collection.description ? (
              <p className="mt-3 max-w-2xl text-body-lg text-text-secondary">{collection.description}</p>
            ) : null}
          </div>
        </section>

        {/* Categories */}
        {collection.categories.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-section-xl text-text-primary">Categorías incluidas</h2>
            <div className="flex flex-wrap gap-3">
              {collection.categories.map((c) => (
                <Link
                  key={c.categoryId}
                  href={c.category.href}
                  className="rounded-full border border-border-soft bg-white px-4 py-2 text-body-sm font-medium text-text-primary transition hover:border-brand-primary hover:bg-surface-brandTint"
                >
                  {c.category.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Products */}
        {activeProducts.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-section-xl text-text-primary">
              Productos ({activeProducts.length})
            </h2>
            <PublicProductGrid items={activeProducts} />
          </section>
        ) : (
          <section className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-border-soft bg-white p-8 text-center">
            <p className="text-body-md text-text-secondary">Esta colección no tiene productos aún.</p>
          </section>
        )}
      </div>
    </div>
  );
}
