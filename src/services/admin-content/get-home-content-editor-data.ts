import "server-only";

import type {
  AdminCategorySummary,
  AdminHomeContentEditorData,
  AdminHomeContentFormData,
  AdminMediaAssetSummary,
  AdminProductSummary,
} from "@/types/admin-home-content";
import type { HomePageContent } from "@/types/content";
import { fallbackHomePageContent } from "@/server/content/home-page-content.fallback";
import {
  findHomePageContentRecord,
  listCategoryRecords,
  listMediaAssetRecords,
  listProductRecords,
} from "@/server/content/admin-home-content.repository";

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function mapMediaAssetSummary(record: {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: "image" | "video";
  altText: string | null;
  mimeType: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminMediaAssetSummary {
  return {
    id: record.id,
    storageKey: record.storageKey,
    publicUrl: record.publicUrl,
    kind: record.kind,
    altText: record.altText ?? "",
    mimeType: record.mimeType,
    posterUrl: record.posterUrl,
    width: record.width,
    height: record.height,
    durationSeconds: record.durationSeconds,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapCategorySummary(record: {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  isActive: boolean;
  mediaAssetId: string | null;
  mediaAsset: {
    publicUrl: string | null;
  } | null;
}): AdminCategorySummary {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    href: record.href,
    isActive: record.isActive,
    mediaAssetId: record.mediaAssetId,
    mediaAssetPublicUrl: record.mediaAsset?.publicUrl ?? null,
  };
}

function mapProductSummary(record: {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  badge: string | null;
  badgeColor: string | null;
  isActive: boolean;
  mediaAssetId: string | null;
  mediaAsset: {
    publicUrl: string | null;
  } | null;
}): AdminProductSummary {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    href: record.href,
    badge: record.badge,
    badgeColor: record.badgeColor,
    isActive: record.isActive,
    mediaAssetId: record.mediaAssetId,
    mediaAssetPublicUrl: record.mediaAsset?.publicUrl ?? null,
  };
}

function deriveSelectedEntityIds(
  fallbackIds: string[],
  availableRecords: Array<{ id: string; slug: string }>,
): string[] {
  return fallbackIds
    .map((itemId) =>
      availableRecords.find((record) => record.slug === itemId || record.id === itemId)?.id ?? null,
    )
    .filter((value): value is string => Boolean(value));
}

function mapPublicContentToFormData(
  content: HomePageContent,
  availableCategories: Array<{ id: string; slug: string }>,
  availableProducts: Array<{ id: string; slug: string }>,
): AdminHomeContentFormData {
  const primarySlide = content.hero.slides[0];

  return {
    heroEyebrow: primarySlide?.eyebrow ?? "",
    heroTitle: primarySlide?.title ?? "",
    heroSubtitle: primarySlide?.subtitle ?? "",
    heroSupportingBadge: primarySlide?.supportingBadge ?? "",
    heroPrimaryCtaText: primarySlide?.primaryCta.label ?? "",
    heroPrimaryCtaHref: primarySlide?.primaryCta.href ?? "",
    heroSecondaryCtaText: primarySlide?.secondaryCta?.label ?? "",
    heroSecondaryCtaHref: primarySlide?.secondaryCta?.href ?? "",
    heroMediaId: "",
    heroMediaAltText: "",
    heroSecondaryMediaId: "",
    heroSecondaryMediaAltText: "",
    heroTertiaryMediaId: "",
    heroTertiaryMediaAltText: "",
    featuredCategoriesEyebrow: content.featuredCategories.eyebrow,
    featuredCategoriesTitle: content.featuredCategories.title,
    featuredCategoriesDescription: content.featuredCategories.description,
    featuredCategoryIds: deriveSelectedEntityIds(
      content.featuredCategories.items.map((item) => item.id),
      availableCategories,
    ),
    featuredProductsEyebrow: content.featuredProducts.eyebrow,
    featuredProductsTitle: content.featuredProducts.title,
    featuredProductsDescription: content.featuredProducts.description,
    featuredProductIds: deriveSelectedEntityIds(
      content.featuredProducts.items.map((item) => item.id),
      availableProducts,
    ),
    trustHighlightsEyebrow: content.trustHighlights.eyebrow,
    trustHighlightsTitle: content.trustHighlights.title,
    trustHighlightsDescription: content.trustHighlights.description,
    trustHighlightsItemsJson: toPrettyJson(content.trustHighlights.items),
    ctaEyebrow: content.cta.eyebrow,
    ctaTitle: content.cta.title,
    ctaDescription: content.cta.description,
    ctaPrimaryCtaText: content.cta.primaryCta.label,
    ctaPrimaryCtaHref: content.cta.primaryCta.href,
    ctaSecondaryCtaText: content.cta.secondaryCta?.label ?? "",
    ctaSecondaryCtaHref: content.cta.secondaryCta?.href ?? "",
  };
}

function mapStoredRecordToFormData(
  record: NonNullable<Awaited<ReturnType<typeof findHomePageContentRecord>>>,
): AdminHomeContentFormData {
  return {
    heroEyebrow: record.heroEyebrow,
    heroTitle: record.heroTitle,
    heroSubtitle: record.heroSubtitle,
    heroSupportingBadge: record.heroSupportingBadge,
    heroPrimaryCtaText: record.heroPrimaryCtaText,
    heroPrimaryCtaHref: record.heroPrimaryCtaHref,
    heroSecondaryCtaText: record.heroSecondaryCtaText ?? "",
    heroSecondaryCtaHref: record.heroSecondaryCtaHref ?? "",
    heroMediaId: record.heroMediaId ?? "",
    heroMediaAltText: record.heroMedia?.altText ?? "",
    heroSecondaryMediaId: record.heroSecondaryMediaId ?? "",
    heroSecondaryMediaAltText: record.heroSecondaryMedia?.altText ?? "",
    heroTertiaryMediaId: record.heroTertiaryMediaId ?? "",
    heroTertiaryMediaAltText: record.heroTertiaryMedia?.altText ?? "",
    featuredCategoriesEyebrow: record.featuredCategoriesEyebrow,
    featuredCategoriesTitle: record.featuredCategoriesTitle,
    featuredCategoriesDescription: record.featuredCategoriesDescription,
    featuredCategoryIds: record.featuredCategorySelections.map((selection) => selection.categoryId),
    featuredProductsEyebrow: record.featuredProductsEyebrow,
    featuredProductsTitle: record.featuredProductsTitle,
    featuredProductsDescription: record.featuredProductsDescription,
    featuredProductIds: record.featuredProductSelections.map((selection) => selection.productId),
    trustHighlightsEyebrow: record.trustHighlightsEyebrow,
    trustHighlightsTitle: record.trustHighlightsTitle,
    trustHighlightsDescription: record.trustHighlightsDescription,
    trustHighlightsItemsJson: toPrettyJson(record.trustHighlightsItems),
    ctaEyebrow: record.ctaEyebrow,
    ctaTitle: record.ctaTitle,
    ctaDescription: record.ctaDescription,
    ctaPrimaryCtaText: record.ctaPrimaryCtaText,
    ctaPrimaryCtaHref: record.ctaPrimaryCtaHref,
    ctaSecondaryCtaText: record.ctaSecondaryCtaText ?? "",
    ctaSecondaryCtaHref: record.ctaSecondaryCtaHref ?? "",
  };
}

export async function getHomeContentEditorData(): Promise<AdminHomeContentEditorData> {
  const [homeRecord, mediaAssetRecords, categoryRecords, productRecords] = await Promise.all([
    findHomePageContentRecord(),
    listMediaAssetRecords(),
    listCategoryRecords(),
    listProductRecords(),
  ]);

  return {
    content: homeRecord
      ? mapStoredRecordToFormData(homeRecord)
      : mapPublicContentToFormData(fallbackHomePageContent, categoryRecords, productRecords),
    mediaAssets: mediaAssetRecords.map(mapMediaAssetSummary),
    availableCategories: categoryRecords.map(mapCategorySummary),
    availableProducts: productRecords.map(mapProductSummary),
  };
}
