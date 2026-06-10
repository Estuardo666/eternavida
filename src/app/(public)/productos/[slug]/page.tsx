import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProductDetailView } from "@/features/catalog/components/public-product-detail-view";
import { buildProductMetadata } from "@/seo/catalog";
import { getPublicProductDetailData } from "@/services/catalog/get-public-catalog-data";
import type { PublicProductDetailData } from "@/types/public-catalog";

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

function buildProductJsonLd(data: PublicProductDetailData) {
  const { product, reviewAggregate } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    url: `${baseUrl}${product.href}`,
    ...(product.media?.url && { image: product.media.url }),
    ...(product.price > 0 && {
      offers: {
        "@type": "Offer",
        price: product.discountPrice ?? product.price,
        priceCurrency: "MXN",
        availability: product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${baseUrl}${product.href}`,
      },
    }),
  };

  if (reviewAggregate && reviewAggregate.totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewAggregate.averageRating.toString(),
      reviewCount: reviewAggregate.totalReviews.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return jsonLd;
}

export default async function PublicProductDetailPage({ params }: PublicProductDetailPageProps) {
  const { slug } = await params;
  const data = await getPublicProductDetailData(slug);

  if (!data) {
    notFound();
  }

  const jsonLd = buildProductJsonLd(data);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicProductDetailView data={data} />
    </>
  );
}