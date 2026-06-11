import type { MediaAssetKind } from "@/types/media";

export interface AdminMediaAssetSummary {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: MediaAssetKind;
  altText: string;
  mimeType: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategorySummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  isActive: boolean;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
}

export interface AdminProductSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  badge: string | null;
  badgeColor: string | null;
  isActive: boolean;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
}

export interface AdminHomeContentFormData {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSupportingBadge: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  heroMediaId: string;
  heroMediaAltText: string;
  heroSecondaryMediaId: string;
  heroSecondaryMediaAltText: string;
  heroTertiaryMediaId: string;
  heroTertiaryMediaAltText: string;
  featuredCategoriesEyebrow: string;
  featuredCategoriesTitle: string;
  featuredCategoriesDescription: string;
  featuredCategoryIds: string[];
  featuredProductsEyebrow: string;
  featuredProductsTitle: string;
  featuredProductsDescription: string;
  featuredProductIds: string[];
  trustHighlightsEyebrow: string;
  trustHighlightsTitle: string;
  trustHighlightsDescription: string;
  trustHighlightsItemsJson: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryCtaText: string;
  ctaPrimaryCtaHref: string;
  ctaSecondaryCtaText: string;
  ctaSecondaryCtaHref: string;
}

export interface AdminHomeContentEditorData {
  content: AdminHomeContentFormData;
  mediaAssets: AdminMediaAssetSummary[];
  availableCategories: AdminCategorySummary[];
  availableProducts: AdminProductSummary[];
}

export interface AdminHomeContentRouteResponse {
  success: boolean;
  data?: AdminHomeContentEditorData;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface UpsertMediaAssetInput {
  storageKey: string;
  publicUrl?: string | undefined;
  kind: MediaAssetKind;
  mimeType?: string | undefined;
  altText?: string | undefined;
  posterUrl?: string | undefined;
  width?: number | null | undefined;
  height?: number | null | undefined;
  durationSeconds?: number | null | undefined;
}

export interface UploadMediaAssetInput {
  storageKey: string;
  kind: MediaAssetKind;
  altText?: string | undefined;
  posterUrl?: string | undefined;
  width?: number | null | undefined;
  height?: number | null | undefined;
  durationSeconds?: number | null | undefined;
}

export interface AdminMediaAssetRouteResponse {
  success: boolean;
  data?: {
    mediaAsset: AdminMediaAssetSummary;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
