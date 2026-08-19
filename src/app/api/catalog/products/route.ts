import { NextResponse } from "next/server";

import { getPublicProductCatalogData } from "@/services/catalog/get-public-catalog-data";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const data = await getPublicProductCatalogData(params);

  return NextResponse.json({
    items: data.items,
    pagination: data.pagination,
  });
}
