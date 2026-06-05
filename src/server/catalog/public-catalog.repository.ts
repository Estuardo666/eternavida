import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import type { PublicProductCatalogSort } from "@/types/public-catalog";

export const PUBLIC_CATALOG_PAGE_SIZE = 12;

interface PublicProductListQuery {
  query: string;
  categorySlug: string;
  page: number;
  pageSize: number;
  sortBy: PublicProductCatalogSort;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  onSale: boolean;
  brandIds: string[];
}

type PublicProductCountQuery = Omit<PublicProductListQuery, "page" | "pageSize" | "sortBy">;

type PublicProductScopeQuery = Partial<PublicProductCountQuery>;

function buildPublicProductVisibilityFilter(): Prisma.ProductWhereInput {
  return {
    isActive: true,
    OR: [
      {
        categoryAssignments: {
          none: {},
        },
      },
      {
        category: {
          isActive: true,
        },
      },
      {
        categoryAssignments: {
          some: {
            category: {
              isActive: true,
            },
          },
        },
      },
    ],
  };
}

function buildPublicCategoryVisibilityFilter(): Prisma.CategoryWhereInput {
  return {
    isActive: true,
  };
}

function buildPublicProductSearchFilter(query: string): Prisma.ProductWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { badge: { contains: query, mode: "insensitive" } },
      { badgeColor: { contains: query, mode: "insensitive" } },
      {
        category: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      {
        categoryAssignments: {
          some: {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ],
  };
}

function buildPublicProductCategoryFilter(categorySlug: string): Prisma.ProductWhereInput | undefined {
  if (!categorySlug) {
    return undefined;
  }

  return {
    categoryAssignments: {
      some: {
        category: {
          slug: categorySlug,
          isActive: true,
        },
      },
    },
  };
}

function buildPublicProductPriceFilter(
  priceMin: number | null,
  priceMax: number | null,
): Prisma.ProductWhereInput | undefined {
  if (priceMin === null && priceMax === null) return undefined;
  return {
    price: {
      ...(priceMin !== null ? { gte: priceMin } : {}),
      ...(priceMax !== null ? { lte: priceMax } : {}),
    },
  };
}

function buildPublicProductStockFilter(inStock: boolean): Prisma.ProductWhereInput | undefined {
  if (!inStock) return undefined;
  return { stock: { gt: 0 } };
}

function buildPublicProductOnSaleFilter(onSale: boolean): Prisma.ProductWhereInput | undefined {
  if (!onSale) return undefined;
  return { discountPrice: { not: null } };
}

function buildPublicProductBrandFilter(brandIds: string[]): Prisma.ProductWhereInput | undefined {
  if (brandIds.length === 0) return undefined;
  return { brandId: { in: brandIds } };
}

function buildPublicProductWhere(query: PublicProductScopeQuery = {}) {
  return combineWhere(
    buildPublicProductVisibilityFilter(),
    buildPublicProductSearchFilter(query.query ?? ""),
    buildPublicProductCategoryFilter(query.categorySlug ?? ""),
    buildPublicProductPriceFilter(query.priceMin ?? null, query.priceMax ?? null),
    buildPublicProductStockFilter(query.inStock ?? false),
    buildPublicProductOnSaleFilter(query.onSale ?? false),
    buildPublicProductBrandFilter(query.brandIds ?? []),
  ) as Prisma.ProductWhereInput | undefined;
}

function combineWhere(
  ...conditions: Array<Prisma.ProductWhereInput | Prisma.CategoryWhereInput | undefined>
) {
  const activeConditions = conditions.filter(Boolean);
  if (activeConditions.length === 0) {
    return undefined;
  }

  if (activeConditions.length === 1) {
    return activeConditions[0];
  }

  return {
    AND: activeConditions,
  };
}

function buildPublicProductOrderBy(
  sortBy: PublicProductCatalogSort,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sortBy) {
    case "name":      return [{ name: "asc" }, { updatedAt: "desc" }];
    case "name-desc": return [{ name: "desc" }, { updatedAt: "desc" }];
    case "price-asc": return [{ price: "asc" }, { name: "asc" }];
    case "price-desc": return [{ price: "desc" }, { name: "asc" }];
    case "oldest":    return [{ createdAt: "asc" }, { name: "asc" }];
    case "bestseller": return [{ stock: "desc" }, { updatedAt: "desc" }];
    case "highest-discount": return [{ updatedAt: "desc" }, { name: "asc" }];
    case "recent":
    default:
      return [{ updatedAt: "desc" }, { name: "asc" }];
  }
}

function getProductDiscountScore(product: {
  price: Prisma.Decimal | number;
  discountPrice: Prisma.Decimal | number | null;
}) {
  const price = Number(product.price);
  const discountPrice = product.discountPrice === null ? null : Number(product.discountPrice);
  if (!Number.isFinite(price) || price <= 0 || discountPrice === null || !Number.isFinite(discountPrice) || discountPrice >= price) {
    return -1;
  }

  return ((price - discountPrice) / price) * 100;
}

const publicCategoryInclude = {
  mediaAsset: {
    select: {
      id: true,
      kind: true,
      publicUrl: true,
      storageKey: true,
      altText: true,
      mimeType: true,
      posterUrl: true,
      width: true,
      height: true,
      durationSeconds: true,
    },
  },
  _count: {
    select: {
      products: {
        where: {
          isActive: true,
        },
      },
      productAssignments: {
        where: {
          product: {
            isActive: true,
          },
        },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

const publicProductInclude = {
  brandRecord: {
    select: {
      id: true,
    },
  },
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
      href: true,
    },
  },
  categoryAssignments: {
    select: {
      position: true,
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
          href: true,
        },
      },
    },
    orderBy: [{ position: "asc" }, { category: { name: "asc" } }],
  },
  mediaAsset: {
    select: {
      id: true,
      kind: true,
      publicUrl: true,
      storageKey: true,
      altText: true,
      mimeType: true,
      posterUrl: true,
      width: true,
      height: true,
      durationSeconds: true,
    },
  },
} satisfies Prisma.ProductInclude;

export async function listPublicCategoryRecords() {
  return prisma.category.findMany({
    where: buildPublicCategoryVisibilityFilter(),
    include: publicCategoryInclude,
    orderBy: [{ name: "asc" }],
  });
}

export async function listPublicCategoryOptions() {
  return prisma.category.findMany({
    where: buildPublicCategoryVisibilityFilter(),
    select: {
      id: true,
      slug: true,
      name: true,
      href: true,
      _count: {
        select: {
          productAssignments: {
            where: {
              product: {
                isActive: true,
              },
            },
          },
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function findPublicCategoryRecordBySlug(slug: string) {
  return prisma.category.findFirst({
    where: {
      ...buildPublicCategoryVisibilityFilter(),
      slug,
    },
    include: publicCategoryInclude,
  });
}

export async function listPublicProductRecords(query: PublicProductListQuery) {
  const where = buildPublicProductWhere(query);

  const skip = (query.page - 1) * query.pageSize;
  const filteredCountQuery = where ? prisma.product.count({ where }) : prisma.product.count();

  if (query.sortBy === "highest-discount") {
    const [filteredCount, allItems] = await prisma.$transaction([
      filteredCountQuery,
      prisma.product.findMany({
        ...(where ? { where } : {}),
        include: publicProductInclude,
      }),
    ]);

    const items = [...allItems]
      .sort((left, right) => {
        const rightScore = getProductDiscountScore(right);
        const leftScore = getProductDiscountScore(left);
        if (rightScore !== leftScore) {
          return rightScore - leftScore;
        }

        return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
      })
      .slice(skip, skip + query.pageSize);

    return {
      filteredCount,
      items,
    };
  }

  const [filteredCount, items] = await prisma.$transaction([
    filteredCountQuery,
    prisma.product.findMany({
      ...(where ? { where } : {}),
      include: publicProductInclude,
      orderBy: buildPublicProductOrderBy(query.sortBy),
      skip,
      take: query.pageSize,
    }),
  ]);

  return {
    filteredCount,
    items,
  };
}

export async function countPublicProductRecords(query: PublicProductCountQuery) {
  const where = buildPublicProductWhere(query);

  return where ? prisma.product.count({ where }) : prisma.product.count();
}

export async function searchPublicProductRecordsByName(query: string) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      AND: [
        buildPublicProductVisibilityFilter(),
        {
          name: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      discountPrice: true,
      mediaAsset: {
        select: {
          publicUrl: true,
        },
      },
    },
    orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
    take: 10,
  });
}

export async function searchPublicCategoryRecordsByName(query: string) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  return prisma.category.findMany({
    where: {
      AND: [
        buildPublicCategoryVisibilityFilter(),
        {
          name: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
    take: 6,
  });
}

export async function searchPublicBrandRecordsByName(query: string) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  return prisma.brand.findMany({
    where: {
      AND: [
        {
          products: {
            some: buildPublicProductVisibilityFilter(),
          },
        },
        {
          name: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      mediaAsset: {
        select: {
          publicUrl: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
    take: 6,
  });
}

export async function findPublicProductRecordBySlug(slug: string) {
  return prisma.product.findFirst({
    where: {
      ...buildPublicProductVisibilityFilter(),
      slug,
    },
    include: publicProductInclude,
  });
}

export async function listProductsByBrand(input: {
  productId: string;
  brand: string;
}) {
  return prisma.product.findMany({
    where: {
      ...buildPublicProductVisibilityFilter(),
      id: { not: input.productId },
      brand: input.brand,
    },
    include: publicProductInclude,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: 8,
  });
}

export async function listRelatedPublicProductRecords(input: {
  productId: string;
  categoryIds: string[];
}) {
  if (input.categoryIds.length === 0) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      ...buildPublicProductVisibilityFilter(),
      id: {
        not: input.productId,
      },
      OR: [
        {
          categoryId: {
            in: input.categoryIds,
          },
        },
        {
          categoryAssignments: {
            some: {
              categoryId: {
                in: input.categoryIds,
              },
              category: {
                isActive: true,
              },
            },
          },
        },
      ],
    },
    include: publicProductInclude,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: 4,
  });
}

export async function listPublicBrandOptions(categorySlug?: string) {
  return prisma.brand.findMany({
    where: {
      products: {
        some: {
          isActive: true,
          ...(categorySlug
            ? {
                OR: [
                  {
                    category: {
                      slug: categorySlug,
                      isActive: true,
                    },
                  },
                  {
                    categoryAssignments: {
                      some: {
                        category: {
                          slug: categorySlug,
                          isActive: true,
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      },
    },
    select: {
      id: true,
      name: true,
      mediaAsset: {
        select: {
          publicUrl: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getMaxPublicProductPrice(): Promise<number> {
  const where = buildPublicProductWhere();
  const result = await prisma.product.aggregate({
    ...(where ? { where } : {}),
    _max: { price: true },
  });
  const raw = result._max?.price;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function getMaxPublicProductPriceForScope(query: PublicProductScopeQuery = {}): Promise<number> {
  const where = buildPublicProductWhere(query);
  const result = await prisma.product.aggregate({
    ...(where ? { where } : {}),
    _max: { price: true },
  });
  const raw = result._max?.price;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}