import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import type {
  CatalogListFilter,
  CatalogSortDirection,
  CategoryCatalogSortField,
  ProductCatalogSortField,
} from "@/types/admin-catalog";

interface AdminCatalogListBaseQuery {
  query: string;
  status: CatalogListFilter;
  page: number;
  pageSize: number;
}

interface AdminCategoryListQuery extends AdminCatalogListBaseQuery {
  sortBy: CategoryCatalogSortField;
  sortDirection: CatalogSortDirection;
}

interface AdminProductListQuery extends AdminCatalogListBaseQuery {
  categoryId: string;
  sortBy: ProductCatalogSortField;
  sortDirection: CatalogSortDirection;
}

function buildActiveFilter<T extends Prisma.CategoryWhereInput | Prisma.ProductWhereInput>(
  status: CatalogListFilter,
): T | undefined {
  if (status === "all") {
    return undefined;
  }

  return {
    isActive: status === "active",
  } as T;
}

function buildCategorySearchFilter(query: string): Prisma.CategoryWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { href: { contains: query, mode: "insensitive" } },
    ],
  };
}

function buildProductSearchFilter(query: string): Prisma.ProductWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { href: { contains: query, mode: "insensitive" } },
      { badge: { contains: query, mode: "insensitive" } },
      { badgeColor: { contains: query, mode: "insensitive" } },
      { externalSourceId: { contains: query, mode: "insensitive" } },
      {
        categoryAssignments: {
          some: {
            category: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
      },
    ],
  };
}

function buildProductCategoryFilter(categoryId: string): Prisma.ProductWhereInput | undefined {
  if (!categoryId) {
    return undefined;
  }

  return {
    OR: [
      { categoryId },
      {
        categoryAssignments: {
          some: {
            categoryId,
          },
        },
      },
    ],
  };
}

const adminProductCategorySelect = {
  id: true,
  slug: true,
  name: true,
  href: true,
} satisfies Prisma.CategorySelect;

const adminProductInclude = {
  brandRecord: {
    select: {
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  categoryAssignments: {
    select: {
      position: true,
      category: {
        select: adminProductCategorySelect,
      },
    },
    orderBy: [{ position: "asc" }, { category: { name: "asc" } }],
  },
  mediaAsset: {
    select: {
      publicUrl: true,
      altText: true,
    },
  },
  nutritionalInfoImage: {
    select: {
      publicUrl: true,
      altText: true,
    },
  },
  variants: {
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  ingredients: {
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  benefits: {
    orderBy: { sortOrder: "asc" as const },
  },
  galleryImages: {
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  usageSteps: {
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: { stepNumber: "asc" as const },
  },
  trustBadges: {
    orderBy: { sortOrder: "asc" as const },
  },
  pickupLocations: {
    select: {
      pickupLocationId: true,
    },
  },
} satisfies Prisma.ProductInclude;

function combineWhere<T extends Prisma.CategoryWhereInput | Prisma.ProductWhereInput>(
  ...conditions: Array<T | undefined>
): T | undefined {
  const activeConditions = conditions.filter(Boolean);
  if (activeConditions.length === 0) {
    return undefined;
  }

  if (activeConditions.length === 1) {
    return activeConditions[0] as T;
  }

  return {
    AND: activeConditions,
  } as unknown as T;
}

export async function listAdminCatalogMediaAssetRecords() {
  return prisma.mediaAsset.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listAdminBrandRecords() {
  return prisma.brand.findMany({
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function listAdminProductBadgePresetRecords() {
  return prisma.productBadgePreset.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        label: "asc",
      },
    ],
  });
}

function buildCategoryOrderBy(query: AdminCategoryListQuery): Prisma.CategoryOrderByWithRelationInput[] {
  switch (query.sortBy) {
    case "name":
      return [{ name: query.sortDirection }, { updatedAt: "desc" }];
    case "slug":
      return [{ slug: query.sortDirection }, { updatedAt: "desc" }];
    case "status":
      return [{ isActive: query.sortDirection }, { name: "asc" }];
    case "href":
      return [{ href: query.sortDirection }, { updatedAt: "desc" }];
    case "updatedAt":
    default:
      return [{ updatedAt: query.sortDirection }, { name: "asc" }];
  }
}

function buildProductOrderBy(query: AdminProductListQuery): Prisma.ProductOrderByWithRelationInput[] {
  switch (query.sortBy) {
    case "name":
      return [{ name: query.sortDirection }, { updatedAt: "desc" }];
    case "slug":
      return [{ slug: query.sortDirection }, { updatedAt: "desc" }];
    case "status":
      return [{ isActive: query.sortDirection }, { name: "asc" }];
    case "category":
      return [
        { category: { name: query.sortDirection } },
        { name: "asc" },
      ];
    case "href":
      return [{ href: query.sortDirection }, { updatedAt: "desc" }];
    case "updatedAt":
    default:
      return [{ updatedAt: query.sortDirection }, { name: "asc" }];
  }
}

export async function listAdminCategoryRecords() {
  return prisma.category.findMany({
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: [
      {
        isActive: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function listAdminProductRecords() {
  return prisma.product.findMany({
    include: adminProductInclude,
    orderBy: [
      {
        isActive: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function findAdminCategoryRecord(id: string) {
  return prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
      homeSelections: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });
}

export async function findAdminBrandRecord(id: string) {
  return prisma.brand.findUnique({
    where: {
      id,
    },
    include: {
      mediaAsset: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function findAdminProductRecord(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      ...adminProductInclude,
      homeSelections: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });
}

export async function listAdminCategoryLibraryRecords(query: AdminCategoryListQuery) {
  const where = combineWhere<Prisma.CategoryWhereInput>(
    buildActiveFilter<Prisma.CategoryWhereInput>(query.status),
    buildCategorySearchFilter(query.query),
  );
  const skip = (query.page - 1) * query.pageSize;
  const orderBy = buildCategoryOrderBy(query);
  const filteredCountQuery = where ? prisma.category.count({ where }) : prisma.category.count();

  const [totalCount, activeCount, filteredCount, items] = await prisma.$transaction([
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),
    filteredCountQuery,
    prisma.category.findMany({
      ...(where ? { where } : {}),
      include: {
        mediaAsset: {
          select: {
            publicUrl: true,
            altText: true,
          },
        },
      },
      orderBy,
      skip,
      take: query.pageSize,
    }),
  ]);

  return {
    items,
    totalCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    filteredCount,
  };
}

export async function listAdminProductLibraryRecords(query: AdminProductListQuery) {
  const where = combineWhere<Prisma.ProductWhereInput>(
    buildActiveFilter<Prisma.ProductWhereInput>(query.status),
    buildProductSearchFilter(query.query),
    buildProductCategoryFilter(query.categoryId),
  );
  const skip = (query.page - 1) * query.pageSize;
  const orderBy = buildProductOrderBy(query);
  const filteredCountQuery = where ? prisma.product.count({ where }) : prisma.product.count();

  const [totalCount, activeCount, filteredCount, items] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    filteredCountQuery,
    prisma.product.findMany({
      ...(where ? { where } : {}),
      include: adminProductInclude,
      orderBy,
      skip,
      take: query.pageSize,
    }),
  ]);

  return {
    items,
    totalCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    filteredCount,
  };
}

export async function findConflictingCategoryRecord(input: {
  excludeId?: string;
  name: string;
  slug: string;
  href: string;
}) {
  return prisma.category.findFirst({
    where: {
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      OR: [
        { name: { equals: input.name, mode: "insensitive" } },
        { slug: { equals: input.slug, mode: "insensitive" } },
        { href: { equals: input.href, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      href: true,
    },
  });
}

export async function findConflictingBrandRecord(input: {
  excludeId?: string;
  name: string;
}) {
  return prisma.brand.findFirst({
    where: {
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      name: {
        equals: input.name,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function findAdminProductBadgePresetRecord(id: string) {
  return prisma.productBadgePreset.findUnique({
    where: {
      id,
    },
  });
}

export async function findConflictingProductBadgePresetRecord(input: {
  excludeId?: string;
  label: string;
}) {
  return prisma.productBadgePreset.findFirst({
    where: {
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      label: {
        equals: input.label,
        mode: "insensitive",
      },
    },
  });
}

export async function findConflictingProductRecord(input: {
  excludeId?: string;
  name: string;
  slug: string;
  href: string;
}) {
  return prisma.product.findFirst({
    where: {
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      OR: [
        { name: { equals: input.name, mode: "insensitive" } },
        { slug: { equals: input.slug, mode: "insensitive" } },
        { href: { equals: input.href, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      href: true,
    },
  });
}

export async function listAdminPickupLocationRecords() {
  return prisma.pickupLocation.findMany({
    include: {
      logoMedia: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function findAdminPickupLocationRecord(id: string) {
  return prisma.pickupLocation.findUnique({
    where: { id },
    include: {
      logoMedia: {
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
  });
}
