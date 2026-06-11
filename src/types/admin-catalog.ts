import type { AdminMediaAssetSummary } from "@/types/admin-home-content";

export type CatalogListFilter = "all" | "active" | "inactive";
export type CatalogSortDirection = "asc" | "desc";
export type CategoryCatalogSortField = "name" | "slug" | "status" | "href" | "updatedAt";
export type ProductCatalogSortField = "name" | "slug" | "status" | "category" | "href" | "updatedAt";
export type CatalogBulkAction = "activate" | "deactivate" | "delete";
export type AdminProductSyncMode = "mock" | "live";

export interface AdminProductSyncModeOption {
  mode: AdminProductSyncMode;
  label: string;
  available: boolean;
  description: string;
}

export interface AdminProductSyncCapabilities {
  defaultMode: AdminProductSyncMode;
  options: AdminProductSyncModeOption[];
}

export interface AdminProductSyncHistoryItem {
  mode: AdminProductSyncMode;
  sourceSystemId: string;
  syncedAt: string;
  isSimulation: boolean;
  price: number;
  discountPrice: number | null;
  stock: number;
}

export interface AdminCatalogCategoryFilterOption {
  id: string;
  name: string;
}

export interface AdminCategoryFormData {
  slug: string;
  name: string;
  description: string;
  href: string;
  isActive: boolean;
  mediaAssetId: string;
}

export interface AdminProductVariantInput {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  mediaAssetId: string;
}

export interface AdminProductIngredientInput {
  id: string;
  name: string;
  description: string;
  mediaAssetId: string;
  sortOrder: number;
}

export interface AdminProductBenefitInput {
  id: string;
  text: string;
  iconKey: string;
  sortOrder: number;
}

export interface AdminProductGalleryImageInput {
  id: string;
  mediaAssetId: string;
  sortOrder: number;
}

export interface AdminProductUsageStepInput {
  id: string;
  stepNumber: number;
  text: string;
  mediaAssetId: string;
}

export interface AdminProductTrustBadgeInput {
  id: string;
  text: string;
  iconKey: string;
  sortOrder: number;
}

export interface AdminProductFormData {
  slug: string;
  name: string;
  brand: string;
  brandId: string;
  description: string;
  href: string;
  badge: string;
  badgeColor: string;
  price?: number;
  discountPrice?: number | null;
  stock?: number;
  isActive: boolean;
  categoryId: string;
  categoryIds: string[];
  mediaAssetId: string;
  productColor: string;
  nutritionalInfoImageId: string;
  variants: AdminProductVariantInput[];
  ingredients: AdminProductIngredientInput[];
  benefits: AdminProductBenefitInput[];
  preTitle: string;
  shortDescription: string;
  longDescription: string;
  slogan: string;
  galleryImages: AdminProductGalleryImageInput[];
  usageSteps: AdminProductUsageStepInput[];
  trustBadges: AdminProductTrustBadgeInput[];
  pickupLocationIds: string[];
}

export interface AdminProductBadgePresetFormData {
  label: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminBrandFormData {
  name: string;
  mediaAssetId: string;
}

export interface AdminCatalogCategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  isActive: boolean;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCatalogProductVariantItem {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
}

export interface AdminCatalogProductIngredientItem {
  id: string;
  name: string;
  description: string | null;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
  sortOrder: number;
}

export interface AdminCatalogProductBenefitItem {
  id: string;
  text: string;
  iconKey: string;
  sortOrder: number;
}

export interface AdminCatalogProductGalleryImageItem {
  id: string;
  mediaAssetId: string;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
  sortOrder: number;
}

export interface AdminCatalogProductUsageStepItem {
  id: string;
  stepNumber: number;
  text: string;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
}

export interface AdminCatalogProductTrustBadgeItem {
  id: string;
  text: string;
  iconKey: string;
  sortOrder: number;
}

export interface AdminCatalogPickupLocationItem {
  id: string;
  name: string;
  address: string;
  directionsUrl: string | null;
  logoMediaId: string | null;
  logoMediaPublicUrl: string | null;
  logoMediaAltText: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCatalogProductItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandId: string | null;
  description: string;
  href: string;
  badge: string | null;
  badgeColor: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  categoryIds: string[];
  categoryNames: string[];
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
  productColor: string | null;
  nutritionalInfoImageId: string | null;
  nutritionalInfoImagePublicUrl: string | null;
  nutritionalInfoImageAltText: string;
  variants: AdminCatalogProductVariantItem[];
  ingredients: AdminCatalogProductIngredientItem[];
  benefits: AdminCatalogProductBenefitItem[];
  preTitle: string | null;
  shortDescription: string;
  longDescription: string;
  slogan: string | null;
  galleryImages: AdminCatalogProductGalleryImageItem[];
  usageSteps: AdminCatalogProductUsageStepItem[];
  trustBadges: AdminCatalogProductTrustBadgeItem[];
  pickupLocationIds: string[];
  externalId: string | null;
  externalSourceId: string | null;
  lastSyncedAt: string | null;
  syncVersion: number;
  syncHistory: AdminProductSyncHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductBadgePresetItem {
  id: string;
  label: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBrandItem {
  id: string;
  name: string;
  mediaAssetId: string | null;
  mediaAssetPublicUrl: string | null;
  mediaAssetAltText: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCatalogEditorData {
  categories: AdminCatalogCategoryItem[];
  products: AdminCatalogProductItem[];
  brands: AdminBrandItem[];
  mediaAssets: AdminMediaAssetSummary[];
  badgePresets: AdminProductBadgePresetItem[];
  pickupLocations: AdminCatalogPickupLocationItem[];
}

export interface AdminPickupLocationFormData {
  name: string;
  address: string;
  directionsUrl: string;
  logoMediaId: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminCatalogSummary {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export interface AdminCatalogPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminCatalogListFilters {
  query: string;
  status: CatalogListFilter;
  categoryId: string;
}

export interface AdminCatalogSorting<TField extends string = string> {
  sortBy: TField;
  sortDirection: CatalogSortDirection;
}

export interface AdminCategoryLibraryData {
  items: AdminCatalogCategoryItem[];
  summary: AdminCatalogSummary;
  pagination: AdminCatalogPagination;
  filters: AdminCatalogListFilters;
  sorting: AdminCatalogSorting<CategoryCatalogSortField>;
}

export interface AdminProductLibraryData {
  items: AdminCatalogProductItem[];
  summary: AdminCatalogSummary;
  pagination: AdminCatalogPagination;
  filters: AdminCatalogListFilters;
  sorting: AdminCatalogSorting<ProductCatalogSortField>;
  categoryOptions: AdminCatalogCategoryFilterOption[];
}

export interface AdminBrandRouteResponse {
  success: boolean;
  data?: {
    brand: AdminBrandItem;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminPickupLocationRouteResponse {
  success: boolean;
  data?: {
    pickupLocation: AdminCatalogPickupLocationItem;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminCatalogRouteResponse {
  success: boolean;
  data?: AdminCatalogEditorData;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminCategoryRouteResponse {
  success: boolean;
  data?: {
    category: AdminCatalogCategoryItem;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminProductRouteResponse {
  success: boolean;
  data?: {
    product: AdminCatalogProductItem;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminProductBadgePresetRouteResponse {
  success: boolean;
  data?: {
    badgePreset: AdminProductBadgePresetItem;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminDeleteRouteResponse {
  success: boolean;
  data?: {
    deletedId: string;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminCatalogBulkActionInput {
  ids: string[];
  action: CatalogBulkAction;
}

export interface AdminProductSyncRequest {
  mode?: AdminProductSyncMode;
}

export interface AdminProductSyncResult {
  mode: AdminProductSyncMode;
  sourceSystemId: string;
  syncedAt: string;
  isSimulation: boolean;
}

export interface AdminCatalogBulkActionResult {
  action: CatalogBulkAction;
  processedIds: string[];
  processedCount: number;
}

export interface AdminCatalogBulkRouteResponse {
  success: boolean;
  data?: AdminCatalogBulkActionResult;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface AdminProductSyncRouteResponse {
  success: boolean;
  data?: {
    product: AdminCatalogProductItem;
    sync: AdminProductSyncResult;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
