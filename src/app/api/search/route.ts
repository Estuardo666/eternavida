import { NextResponse } from "next/server";

import {
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
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json(createEmptySearchResponse(), jsonOptions);
  }

  try {
    const [products, categories] = await Promise.all([
      searchPublicProductRecordsByName(query),
      searchPublicCategoryRecordsByName(query),
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
          href: `/categorias/${category.slug}`,
        })),
      },
      jsonOptions,
    );
  } catch (error) {
    console.error("[api/search] Failed to resolve live search results", error);

    return NextResponse.json(createEmptySearchResponse(), jsonOptions);
  }
}