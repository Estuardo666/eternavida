import type { MediaAsset } from "@/types/media";

export type PublicProductCatalogSort =
  | "recent"
  | "oldest"
  | "name"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "bestseller"
  | "highest-discount";

export interface PublicCatalogPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PublicCatalogCategoryReference {
  id: string;
  slug: string;
  name: string;
  href: string;
}

export interface PublicCatalogCategorySummary extends PublicCatalogCategoryReference {
  description: string;
  media: MediaAsset | null;
  productCount: number;
}

export interface PublicPromotionPill {
  shortLabel: string;
  badgeParts: string[];
  fullLabel: string;
  tooltip: string;
}

export interface PublicCatalogProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  href: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  badge?: string;
  badgeColor?: string;
  productColor: string | null;
  hasVariants: boolean;
  preTitle: string | null;
  slogan: string | null;
  shortDescription: string;
  activePromotion: PublicPromotionPill | null;
  media: MediaAsset | null;
  category: PublicCatalogCategoryReference | null;
  categories: PublicCatalogCategoryReference[];
}

export interface PublicCatalogCategoryOption {
  id: string;
  slug: string;
  name: string;
  href: string;
  productCount: number;
}

export interface PublicCatalogBrandOption {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface PublicProductCatalogFilters {
  query: string;
  categorySlug: string;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  onSale: boolean;
  brandIds: string[];
}

export interface PublicProductCatalogData {
  items: PublicCatalogProductSummary[];
  filters: PublicProductCatalogFilters;
  sortBy: PublicProductCatalogSort;
  pagination: PublicCatalogPagination;
  categoryOptions: PublicCatalogCategoryOption[];
  brandOptions: PublicCatalogBrandOption[];
  maxPrice: number;
}

export interface PublicCategoryCatalogData {
  items: PublicCatalogCategorySummary[];
}

export interface PublicCategoryDetailData {
  category: PublicCatalogCategorySummary;
  products: PublicCatalogProductSummary[];
  pagination: PublicCatalogPagination;
  filters: PublicProductCatalogFilters;
  sortBy: PublicProductCatalogSort;
  brandOptions: PublicCatalogBrandOption[];
  maxPrice: number;
}

export interface PublicReviewAggregate {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedCount: number;
}

export interface PublicProductVariantSummary {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  stock: number;
}

export interface PublicProductIngredientSummary {
  id: string;
  name: string;
  description: string | null;
  media: MediaAsset | null;
}

export interface PublicProductBenefitSummary {
  id: string;
  text: string;
  iconKey: string;
}

export interface PublicProductGalleryImageSummary {
  id: string;
  media: MediaAsset | null;
}

export interface PublicProductUsageStepSummary {
  id: string;
  stepNumber: number;
  text: string;
  media: MediaAsset | null;
}

export interface PublicProductTrustBadgeSummary {
  id: string;
  text: string;
  iconKey: string;
}

export interface PublicPickupLocationSummary {
  id: string;
  name: string;
  address: string;
  directionsUrl: string | null;
  logoMedia: MediaAsset | null;
}

export interface PublicProductDetailData {
  product: PublicCatalogProductSummary;
  brandProducts: PublicCatalogProductSummary[];
  recommendedProducts: PublicCatalogProductSummary[];
  reviewAggregate: PublicReviewAggregate | null;
  variants: PublicProductVariantSummary[];
  ingredients: PublicProductIngredientSummary[];
  benefits: PublicProductBenefitSummary[];
  nutritionalInfoImage: MediaAsset | null;
  galleryImages: PublicProductGalleryImageSummary[];
  usageSteps: PublicProductUsageStepSummary[];
  trustBadges: PublicProductTrustBadgeSummary[];
  pickupLocations: PublicPickupLocationSummary[];
}