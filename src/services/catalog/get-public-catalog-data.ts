import "server-only";

import { buildCategoryHref } from "@/lib/catalog-slugs";
import { slugifyCatalogName } from "@/lib/catalog-slugs";
import { resolvePromotionDisplayContent } from "@/lib/promotion-display";
import type { MediaAsset } from "@/types/media";
import type {
  PublicCatalogBrandOption,
  PublicCatalogCategoryReference,
  PublicCatalogCategoryOption,
  PublicCatalogCategorySummary,
  PublicCatalogPagination,
  PublicPromotionPill,
  PublicCatalogProductSummary,
  PublicCategoryDetailData,
  PublicCategoryCatalogData,
  PublicProductCatalogData,
  PublicProductCatalogFilters,
  PublicProductDetailData,
  PublicProductCatalogSort,
} from "@/types/public-catalog";
import {
  findPublicCategoryRecordBySlug,
  findPublicProductRecordBySlug,
  getMaxPublicProductPrice,
  getMaxPublicProductPriceForScope,
  listPublicBrandOptions,
  listPublicCategoryOptions,
  listPublicCategoryRecords,
  listPublicProductRecords,
  listProductsByBrand,
  listRelatedPublicProductRecords,
  PUBLIC_CATALOG_PAGE_SIZE,
} from "@/server/catalog/public-catalog.repository";
import { listActivePromotionRecords } from "@/server/pricing/promotion.repository";
import { parsePromotionConfig } from "@/server/pricing/promotion.schemas";
import type { PromotionRuleType } from "@/types/admin-promotions";

interface PublicCatalogSearchParams {
  query: string;
  categorySlug: string;
  page: number;
  sortBy: PublicProductCatalogSort;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  onSale: boolean;
  brandValues: string[];
}

interface DecimalLike {
  toNumber(): number;
}

const CATEGORY_FALLBACK_IMAGE_FILES = [
  "aceite de coco.jpg",
  "aceite de oregano.jpg",
  "aceite de oregano 2.jpg",
  "aceite de ajonjoli.jpg",
  "aceite de linaza.jpg",
  "manteca de cacao.jpg",
  "imagen.jpg",
  "imagen2.jpg",
  "IMG_9445.jpeg",
  "banner.jpg",
  "banner 2.jpg",
  "banner3.jpg",
] as const;

function normalizeCategoryText(value: string): string {
  return value
    .toLocaleLowerCase("es-EC")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hashValue(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function resolveCategoryFallbackImageFile(slug: string, name: string): string {
  const searchable = normalizeCategoryText(`${slug} ${name}`);

  if (searchable.includes("limpieza")) return "limpieza clinica.jpg";
  if (searchable.includes("acne") || searchable.includes("grasa")) return "acne y piel grasa.jpg";
  if (searchable.includes("proteccion") || searchable.includes("solar") || searchable.includes("bloqueador")) {
    return "cat bloqueadores solares.jpg";
  }
  if (searchable.includes("contorno") || searchable.includes("ojos") || searchable.includes("ojo")) {
    return "contorno de ojos.webp";
  }
  if (searchable.includes("maquillaje")) return "maquillaje dermo.webp";
  if (searchable.includes("hombre") || searchable.includes("men")) return "cathombre.jpg";
  if (
    searchable.includes("post") ||
    searchable.includes("procedimiento") ||
    searchable.includes("barrera") ||
    searchable.includes("reparacion")
  ) {
    return "cat4.jpg";
  }

  return CATEGORY_FALLBACK_IMAGE_FILES[hashValue(slug) % CATEGORY_FALLBACK_IMAGE_FILES.length] ?? "cat1.webp";
}

function buildCategoryFallbackMedia(slug: string, name: string): MediaAsset {
  const fileName = resolveCategoryFallbackImageFile(slug, name);
  return {
    id: `fallback-category-media-${slug}`,
    kind: "image",
    url: `/categorias/${encodeURIComponent(fileName)}`,
    storageKey: `public/categorias/${fileName}`,
    altText: name,
    mimeType: null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function toNumberValue(value: number | DecimalLike): number {
  return typeof value === "number" ? value : value.toNumber();
}

function normalizeStringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function normalizePageParam(value: string | string[] | undefined): number {
  const parsedValue = Number.parseInt(normalizeStringParam(value), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function normalizeSortParam(value: string | string[] | undefined): PublicProductCatalogSort {
  const v = normalizeStringParam(value);
  const valid: PublicProductCatalogSort[] = [
    "recent", "oldest", "name", "name-desc", "price-asc", "price-desc", "bestseller", "highest-discount",
  ];
  return valid.includes(v as PublicProductCatalogSort) ? (v as PublicProductCatalogSort) : "recent";
}

function normalizePriceParam(value: string | string[] | undefined): number | null {
  const str = normalizeStringParam(value);
  if (!str) return null;
  const parsed = Number.parseFloat(str);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeBooleanParam(value: string | string[] | undefined): boolean {
  return normalizeStringParam(value) === "1";
}

function normalizeBrandValuesParam(value: string | string[] | undefined): string[] {
  const str = normalizeStringParam(value);
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function mapMediaAsset(record: {
  id: string;
  kind: "image" | "video";
  publicUrl: string | null;
  storageKey: string;
  altText: string | null;
  mimeType: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
} | null | undefined): MediaAsset | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    kind: record.kind,
    url: record.publicUrl,
    storageKey: record.storageKey,
    altText: record.altText ?? "",
    mimeType: record.mimeType,
    posterUrl: record.posterUrl,
    width: record.width,
    height: record.height,
    durationSeconds: record.durationSeconds,
  };
}

function mapCategorySummary(record: {
  id: string;
  slug: string;
  name: string;
  description: string;
  href?: string;
  mediaAsset?: {
    id: string;
    kind: "image" | "video";
    publicUrl: string | null;
    storageKey: string;
    altText: string | null;
    mimeType: string | null;
    posterUrl: string | null;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
  } | null;
  _count: {
    productAssignments: number;
  };
}): PublicCatalogCategorySummary {
  const resolvedMedia = mapMediaAsset(record.mediaAsset) ?? buildCategoryFallbackMedia(record.slug, record.name);

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    href: buildCategoryHref(record.slug),
    media: resolvedMedia,
    productCount: record._count.productAssignments,
  };
}

function mapCategoryOption(record: {
  id: string;
  slug: string;
  name: string;
  href: string;
  _count: {
    productAssignments: number;
  };
}): PublicCatalogCategoryOption {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    href: buildCategoryHref(record.slug),
    productCount: record._count.productAssignments,
  };
}

function dedupeCategoryReferences(
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    href: string;
  }>,
): PublicCatalogCategoryReference[] {
  const seen = new Set<string>();

  return categories.filter((category) => {
    if (seen.has(category.id)) {
      return false;
    }

    seen.add(category.id);
    return true;
  });
}

interface ProductSummaryRecord {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandRecord?: {
    id: string;
  } | null;
  description: string;
  preTitle?: string | null;
  slogan?: string | null;
  shortDescription?: string;
  href: string;
  price: number | DecimalLike;
  discountPrice: number | DecimalLike | null;
  stock: number;
  badge: string | null;
  badgeColor: string | null;
  productColor?: string | null;
  categoryId: string | null;
  category?: {
    id: string;
    slug: string;
    name: string;
    href: string;
  } | null;
  categoryAssignments?: Array<{
    category: {
      id: string;
      slug: string;
      name: string;
      href: string;
    };
  }>;
  mediaAsset?: {
    id: string;
    kind: "image" | "video";
    publicUrl: string | null;
    storageKey: string;
    altText: string | null;
    mimeType: string | null;
    posterUrl: string | null;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
  } | null;
  variants?: Array<{
    id: string;
  }>;
}

interface ActiveCatalogPromotion {
  id: string;
  shortLabel: string;
  badgeParts: string[];
  fullLabel: string;
  tooltip: string;
  priority: number;
  createdAt: Date;
  productIds: Set<string>;
  categoryIds: Set<string>;
  brandIds: Set<string>;
}

function mapProductSummary(
  record: ProductSummaryRecord,
  promotionByProductId: Map<string, PublicPromotionPill> = new Map(),
): PublicCatalogProductSummary {
  const categories = dedupeCategoryReferences([
    ...(record.category
      ? [
          {
            id: record.category.id,
            slug: record.category.slug,
            name: record.category.name,
            href: buildCategoryHref(record.category.slug),
          },
        ]
      : []),
    ...((record.categoryAssignments ?? []).map((assignment) => ({
      ...assignment.category,
      href: buildCategoryHref(assignment.category.slug),
    }))),
  ]);
  const baseItem = {
    id: record.id,
    slug: record.slug,
    name: record.name,
    brand: record.brand,
    description: record.description,
    preTitle: record.preTitle ?? null,
    slogan: record.slogan ?? null,
    shortDescription: record.shortDescription ?? "",
    href: `/productos/${record.slug}`,
    price: toNumberValue(record.price),
    discountPrice: record.discountPrice === null ? null : toNumberValue(record.discountPrice),
    stock: record.stock,
    productColor: record.productColor ?? null,
    hasVariants: (record.variants ?? []).length > 0,
    activePromotion: promotionByProductId.get(record.id) ?? null,
    media: mapMediaAsset(record.mediaAsset),
    category: categories[0] ?? null,
    categories,
  };

  return record.badge
    ? { ...baseItem, badge: record.badge, ...(record.badgeColor ? { badgeColor: record.badgeColor } : {}) }
    : baseItem;
}

function isPromotionWithinActiveWindow(
  promotion: { startsAt: Date | null; endsAt: Date | null },
  now: Date,
): boolean {
  if (promotion.startsAt && promotion.startsAt > now) {
    return false;
  }

  if (promotion.endsAt && promotion.endsAt < now) {
    return false;
  }

  return true;
}

function collectProductCategoryIds(record: ProductSummaryRecord): string[] {
  const categoryIds = new Set<string>();

  if (record.categoryId) {
    categoryIds.add(record.categoryId);
  }

  for (const assignment of record.categoryAssignments ?? []) {
    categoryIds.add(assignment.category.id);
  }

  return [...categoryIds];
}

function promotionMatchesProduct(record: ProductSummaryRecord, promotion: ActiveCatalogPromotion): boolean {
  const hasScopedEntities = promotion.productIds.size > 0 || promotion.categoryIds.size > 0 || promotion.brandIds.size > 0;
  if (!hasScopedEntities) {
    return true;
  }

  if (promotion.productIds.has(record.id)) {
    return true;
  }

  const brandId = record.brandRecord?.id ?? null;

  if (brandId && promotion.brandIds.has(brandId)) {
    return true;
  }

  const categoryIds = collectProductCategoryIds(record);
  return categoryIds.some((categoryId) => promotion.categoryIds.has(categoryId));
}

async function resolvePromotionByProductId(records: ProductSummaryRecord[]): Promise<Map<string, PublicPromotionPill>> {
  if (records.length === 0) {
    return new Map();
  }

  const now = new Date();
  const activePromotions: ActiveCatalogPromotion[] = (await listActivePromotionRecords())
    .filter((promotion) => promotion.triggerType === "automatic")
    .filter((promotion) => isPromotionWithinActiveWindow(promotion, now))
    .map((promotion) => {
      const config = parsePromotionConfig(promotion.ruleType as PromotionRuleType, promotion.config);
      const displayContent = resolvePromotionDisplayContent(promotion.ruleType as PromotionRuleType, config);
      const promotionDescription = promotion.description?.trim() ?? "";

      return {
        id: promotion.id,
        ...displayContent,
        tooltip: promotionDescription.length > 0 ? promotionDescription : displayContent.tooltip,
        fullLabel: promotion.name,
        priority: promotion.priority,
        createdAt: promotion.createdAt,
        productIds: new Set(promotion.productScopes.map((entry) => entry.productId)),
        categoryIds: new Set(promotion.categoryScopes.map((entry) => entry.categoryId)),
        brandIds: new Set(promotion.brandScopes.map((entry) => entry.brandId)),
      };
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    });

  const promotionByProductId = new Map<string, PublicPromotionPill>();

  for (const record of records) {
    const matchedPromotion = activePromotions.find((promotion) => promotionMatchesProduct(record, promotion));
    if (!matchedPromotion) {
      continue;
    }

    promotionByProductId.set(record.id, {
      shortLabel: matchedPromotion.shortLabel,
      badgeParts: matchedPromotion.badgeParts,
      fullLabel: matchedPromotion.fullLabel,
      tooltip: matchedPromotion.tooltip,
    });
  }

  return promotionByProductId;
}

function buildPagination(totalItems: number, page: number): PublicCatalogPagination {
  const totalPages = Math.max(1, Math.ceil(totalItems / PUBLIC_CATALOG_PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);

  return {
    page: normalizedPage,
    pageSize: PUBLIC_CATALOG_PAGE_SIZE,
    totalItems,
    totalPages,
    hasPreviousPage: normalizedPage > 1,
    hasNextPage: normalizedPage < totalPages,
  };
}

export function parsePublicCatalogSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): PublicCatalogSearchParams {
  return {
    query: normalizeStringParam(searchParams.q),
    categorySlug: normalizeStringParam(searchParams.categoria),
    page: normalizePageParam(searchParams.pagina),
    sortBy: normalizeSortParam(searchParams.orden),
    priceMin: normalizePriceParam(searchParams.precioMin),
    priceMax: normalizePriceParam(searchParams.precioMax),
    inStock: normalizeBooleanParam(searchParams.enStock),
    onSale: normalizeBooleanParam(searchParams.enOferta),
    brandValues: normalizeBrandValuesParam(searchParams.marcas),
  };
}

function buildPublicProductFilters(query: PublicCatalogSearchParams): PublicProductCatalogFilters {
  return {
    query: query.query,
    categorySlug: query.categorySlug,
    priceMin: query.priceMin,
    priceMax: query.priceMax,
    inStock: query.inStock,
    onSale: query.onSale,
    brandIds: [],
  };
}

export async function getPublicCategoryCatalogData(): Promise<PublicCategoryCatalogData> {
  const categories = await listPublicCategoryRecords();

  return {
    items: categories.map(mapCategorySummary),
  };
}

function mapBrandOption(record: { id: string; name: string; mediaAsset?: { publicUrl: string | null } | null }): PublicCatalogBrandOption {
  return {
    id: record.id,
    slug: slugifyCatalogName(record.name),
    name: record.name,
    logoUrl: record.mediaAsset?.publicUrl ?? null,
  };
}

export function resolveBrandIdsFromValues(
  brandValues: string[],
  brandOptions: PublicCatalogBrandOption[],
): string[] {
  if (brandValues.length === 0) {
    return [];
  }

  const normalizedValues = brandValues.map((value) => value.trim().toLowerCase()).filter(Boolean);
  const brandIds = new Set<string>();

  for (const value of normalizedValues) {
    const match = brandOptions.find((brand) => brand.id === value || brand.slug === value);
    if (match) {
      brandIds.add(match.id);
    }
  }

  return [...brandIds];
}

export function mapBrandIdsToSlugs(
  brandIds: string[],
  brandOptions: PublicCatalogBrandOption[],
): string[] {
  return brandIds
    .map((brandId) => brandOptions.find((brand) => brand.id === brandId)?.slug)
    .filter((slug): slug is string => Boolean(slug));
}

export async function getPublicProductCatalogData(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PublicProductCatalogData> {
  const query = parsePublicCatalogSearchParams(searchParams);
  const [categoryOptions, rawBrandOptions, maxPrice] = await Promise.all([
    listPublicCategoryOptions(),
    listPublicBrandOptions(),
    getMaxPublicProductPrice(),
  ]);
  const brandOptions = rawBrandOptions.map(mapBrandOption);
  const resolvedBrandIds = resolveBrandIdsFromValues(query.brandValues, brandOptions);
  const records = await listPublicProductRecords({
    ...query,
    brandIds: resolvedBrandIds,
    pageSize: PUBLIC_CATALOG_PAGE_SIZE,
  });
  const promotionByProductId = await resolvePromotionByProductId(records.items);

  return {
    items: records.items.map((record) => mapProductSummary(record, promotionByProductId)),
    filters: {
      ...buildPublicProductFilters(query),
      brandIds: resolvedBrandIds,
    },
    sortBy: query.sortBy,
    pagination: buildPagination(records.filteredCount, query.page),
    categoryOptions: categoryOptions.map(mapCategoryOption),
    brandOptions,
    maxPrice,
  };
}

export async function getPublicCategoryDetailData(
  slug: string,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<PublicCategoryDetailData | null> {
  const category = await findPublicCategoryRecordBySlug(slug);
  if (!category) {
    return null;
  }

  const query = parsePublicCatalogSearchParams({
    ...searchParams,
    categoria: slug,
  });
  const [rawBrandOptions, maxPrice] = await Promise.all([
    listPublicBrandOptions(slug),
    getMaxPublicProductPriceForScope({ categorySlug: slug }),
  ]);
  const brandOptions = rawBrandOptions.map(mapBrandOption);
  const resolvedBrandIds = resolveBrandIdsFromValues(query.brandValues, brandOptions);
  const records = await listPublicProductRecords({
    ...query,
    categorySlug: slug,
    brandIds: resolvedBrandIds,
    pageSize: PUBLIC_CATALOG_PAGE_SIZE,
  });
  const promotionByProductId = await resolvePromotionByProductId(records.items);

  return {
    category: mapCategorySummary(category),
    products: records.items.map((record) => mapProductSummary(record, promotionByProductId)),
    pagination: buildPagination(records.filteredCount, query.page),
    filters: {
      ...buildPublicProductFilters(query),
      brandIds: resolvedBrandIds,
    },
    sortBy: query.sortBy,
    brandOptions,
    maxPrice,
  };
}

export async function getPublicProductDetailData(
  slug: string,
): Promise<PublicProductDetailData | null> {
  const product = await findPublicProductRecordBySlug(slug);
  if (!product) {
    return null;
  }

  const categoryIds = product.categoryAssignments.map((a) => a.category.id);

  const [brandProductRecords, recommendedProductRecords] = await Promise.all([
    listProductsByBrand({ productId: product.id, brand: product.brand }),
    listRelatedPublicProductRecords({ productId: product.id, categoryIds }),
  ]);

  let reviewAggregate = null;
  try {
    const { reviewRepository } = await import("@/server/reviews/review.repository");
    reviewAggregate = await reviewRepository.getAggregate(product.id);
  } catch {
    // Reviews not critical — fail silently
  }
  const promotionByProductId = await resolvePromotionByProductId([
    product,
    ...brandProductRecords,
    ...recommendedProductRecords,
  ]);

  const brandProductIds = new Set(brandProductRecords.map((p) => p.id));

  const detailProduct = product as typeof product & {
    nutritionalInfoImage?: {
      id: string;
      kind: "image" | "video";
      publicUrl: string | null;
      storageKey: string;
      altText: string | null;
      mimeType: string | null;
      posterUrl: string | null;
      width: number | null;
      height: number | null;
      durationSeconds: number | null;
    } | null;
    variants?: Array<{
      id: string;
      name: string;
      price: number | DecimalLike;
      discountPrice: number | DecimalLike | null;
      stock: number;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
    galleryImages?: Array<{
      id: string;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
    usageSteps?: Array<{
      id: string;
      stepNumber: number;
      text: string;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
    trustBadges?: Array<{
      id: string;
      text: string;
      iconKey: string;
    }>;
    pickupLocations?: Array<{
      pickupLocation: {
        id: string;
        name: string;
        address: string;
        directionsUrl: string | null;
        logoMedia?: {
          id: string;
          kind: "image" | "video";
          publicUrl: string | null;
          storageKey: string;
          altText: string | null;
          mimeType: string | null;
          posterUrl: string | null;
          width: number | null;
          height: number | null;
          durationSeconds: number | null;
        } | null;
      };
    }>;
    ingredients?: Array<{
      id: string;
      name: string;
      description: string | null;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
    benefits?: Array<{
      id: string;
      text: string;
      iconKey: string;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
    certificateBadges?: Array<{
      id: string;
      label: string;
      iconKey: string | null;
      mediaAsset?: {
        id: string;
        kind: "image" | "video";
        publicUrl: string | null;
        storageKey: string;
        altText: string | null;
        mimeType: string | null;
        posterUrl: string | null;
        width: number | null;
        height: number | null;
        durationSeconds: number | null;
      } | null;
    }>;
  };

  return {
    product: mapProductSummary(product, promotionByProductId),
    brandProducts: brandProductRecords.map((record) => mapProductSummary(record, promotionByProductId)),
    recommendedProducts: recommendedProductRecords
      .filter((p) => !brandProductIds.has(p.id))
      .map((record) => mapProductSummary(record, promotionByProductId)),
    reviewAggregate,
    variants: (detailProduct.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      price: toNumberValue(v.price),
      discountPrice: v.discountPrice === null ? null : toNumberValue(v.discountPrice),
      stock: v.stock,
    })),
    ingredients: (detailProduct.ingredients ?? []).map((ing) => ({
      id: ing.id,
      name: ing.name,
      description: ing.description,
      media: mapMediaAsset(ing.mediaAsset),
    })),
    benefits: (detailProduct.benefits ?? []).map((b) => ({
      id: b.id,
      text: b.text,
      iconKey: b.iconKey,
      media: mapMediaAsset(b.mediaAsset),
    })),
    nutritionalInfoImage: mapMediaAsset(detailProduct.nutritionalInfoImage),
    galleryImages: (detailProduct.galleryImages ?? []).map((g) => ({
      id: g.id,
      media: mapMediaAsset(g.mediaAsset),
    })),
    usageSteps: (detailProduct.usageSteps ?? []).map((s) => ({
      id: s.id,
      stepNumber: s.stepNumber,
      text: s.text,
      media: mapMediaAsset(s.mediaAsset),
    })),
    trustBadges: (detailProduct.trustBadges ?? []).map((b) => ({
      id: b.id,
      text: b.text,
      iconKey: b.iconKey,
    })),
    pickupLocations: (detailProduct.pickupLocations ?? []).map((pl) => ({
      id: pl.pickupLocation.id,
      name: pl.pickupLocation.name,
      address: pl.pickupLocation.address,
      directionsUrl: pl.pickupLocation.directionsUrl,
      logoMedia: mapMediaAsset(pl.pickupLocation.logoMedia),
    })),
    certificateBadges: (detailProduct.certificateBadges ?? []).map((cb) => ({
      id: cb.id,
      label: cb.label,
      iconKey: cb.iconKey ?? null,
      media: mapMediaAsset(cb.mediaAsset),
    })),
  };
}