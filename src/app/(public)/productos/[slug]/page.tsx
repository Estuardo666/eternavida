import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProductDetailView } from "@/features/catalog/components/public-product-detail-view";
import { buildProductMetadata } from "@/seo/catalog";
import { getPublicProductDetailData } from "@/services/catalog/get-public-catalog-data";

export const revalidate = 60;

interface PublicProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PublicProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicProductDetailData(slug);

  if (!data) {
    return {
      title: "Producto no encontrado",
    };
  }

  return buildProductMetadata(data.product);
}

export default async function PublicProductDetailPage({ params }: PublicProductDetailPageProps) {
  const { slug } = await params;
  const data = await getPublicProductDetailData(slug);

  if (!data) {
    notFound();
  }

  return <PublicProductDetailView data={data} />;
}