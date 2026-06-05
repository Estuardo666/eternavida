import { NextResponse } from "next/server";

import { slugifyCatalogName } from "@/lib/catalog-slugs";

import {
  searchPublicBrandRecordsByName,
  searchPublicCategoryRecordsByName,
  searchPublicProductRecordsByName,
} from "@/server/catalog/public-catalog.repository";

export const dynamic = "force-dynamic";

const jsonOptions = {
  headers: {
    "Cache-Control": "no-store",
  },
} as const;

function createEmptySearchResponse() {
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

  try {
    const [products, categories, brands] = await Promise.all([
      searchPublicProductRecordsByName(query),
      searchPublicCategoryRecordsByName(query),
      searchPublicBrandRecordsByName(query),
    ]);

    return NextResponse.json(
      {
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
      },
      jsonOptions,
    );
  } catch (error) {
    console.error("[api/search] Failed to resolve live search results", error);

    return NextResponse.json(createEmptySearchResponse(), jsonOptions);
  }
}