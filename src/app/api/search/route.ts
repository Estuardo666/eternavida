import { NextResponse } from "next/server";

import { slugifyCatalogName } from "@/lib/catalog-slugs";
import { getCached, setCached } from "@/lib/short-lived-cache";

import {
  searchPublicBrandRecordsByName,
  searchPublicCategoryRecordsByName,
  searchPublicProductRecordsByName,
} from "@/server/catalog/public-catalog.repository";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 10_000;

const jsonOptions = {
  headers: {
    "Cache-Control": "public, max-age=10, s-maxage=10",
  },
} as const;

interface LiveSearchResponse {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    discountPrice: number | null;
    mediaUrl: string | null;
    href: string;
  }>;
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    mediaUrl: string | null;
    mediaAlt: string | null;
    fallbackLetter: string;
    href: string;
  }>;
  brands: Array<{
    id: string;
    name: string;
    mediaUrl: string | null;
    href: string;
  }>;
}

function createEmptySearchResponse(): LiveSearchResponse {
  return {
    products: [],
    categories: [],
    brands: [],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json(createEmptySearchResponse(), jsonOptions);
  }

  const cacheKey = `search:${query}`;
  const cached = getCached<LiveSearchResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, jsonOptions);
  }

  try {
    const [products, categories, brands] = await Promise.all([
      searchPublicProductRecordsByName(query),
      searchPublicCategoryRecordsByName(query),
      searchPublicBrandRecordsByName(query),
    ]);

    const result: LiveSearchResponse = {
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        discountPrice: product.discountPrice === null ? null : Number(product.discountPrice),
        mediaUrl: product.mediaAsset?.publicUrl ?? null,
        href: `/productos/${product.slug}`,
      })),
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        mediaUrl: category.mediaAsset?.publicUrl ?? null,
        mediaAlt: category.mediaAsset?.altText ?? null,
        fallbackLetter: category.name.slice(0, 1).toUpperCase(),
        href: `/categorias/${category.slug}`,
      })),
      brands: brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        mediaUrl: brand.mediaAsset?.publicUrl ?? null,
        href: `/productos?marcas=${encodeURIComponent(slugifyCatalogName(brand.name))}`,
      })),
    };

    setCached(cacheKey, result, CACHE_TTL_MS);

    return NextResponse.json(result, jsonOptions);
  } catch (error) {
    console.error("[api/search] Failed to resolve live search results", error);

    return NextResponse.json(createEmptySearchResponse(), jsonOptions);
  }
}