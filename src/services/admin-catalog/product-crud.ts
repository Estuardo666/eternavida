import "server-only";

import { adminProductFormSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { normalizeBadgeColor } from "@/lib/product-badges";
import { computeDiscountPercent } from "@/lib/product-pricing";
import { resolveProductIdentity } from "@/lib/catalog-slugs";
import {
  findAdminBrandRecord,
  findAdminProductRecord,
  findConflictingProductRecord,
} from "@/server/catalog/admin-catalog.repository";
import { prisma } from "@/server/db/prisma";
import type { AdminCatalogBulkActionResult, AdminProductFormData } from "@/types/admin-catalog";

import { CatalogBulkActionError, CatalogConflictError } from "./admin-catalog.errors";

function normalizeMediaAssetId(mediaAssetId: string): string | null {
  const normalizedValue = mediaAssetId.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeCategoryIds(categoryId: string, categoryIds: string[]): string[] {
  return [...new Set([categoryId, ...categoryIds].map((value) => value.trim()).filter(Boolean))];
}

function normalizeOptionalString(value: string): string | null {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeOptionalBadgeColor(input: { badge: string; badgeColor: string }): string | null {
  if (input.badge.trim().length === 0) {
    return null;
  }

  return normalizeBadgeColor(input.badgeColor);
}

function normalizeProductColor(color: string): string | null {
  const normalizedValue = color.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

async function assertMediaAssetExists(mediaAssetId: string | null): Promise<void> {
  if (!mediaAssetId) {
    return;
  }

  const mediaAsset = await prisma.mediaAsset.findUnique({
    where: {
      id: mediaAssetId,
    },
    select: {
      id: true,
    },
  });

  if (!mediaAsset) {
    throw new Error("The selected product media asset does not exist.");
  }
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new Error("The selected category does not exist.");
  }
}

async function assertCategoriesExist(categoryIds: string[]): Promise<void> {
  const uniqueCategoryIds = [...new Set(categoryIds)];
  const existingCategories = await prisma.category.findMany({
    where: {
      id: {
        in: uniqueCategoryIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingCategories.length !== uniqueCategoryIds.length) {
    throw new Error("One or more selected categories do not exist.");
  }
}

async function assertBrandExists(brandId: string): Promise<{ id: string; name: string }> {
  const brand = await findAdminBrandRecord(brandId);
  if (!brand) {
    throw new Error("The selected brand does not exist.");
  }

  return {
    id: brand.id,
    name: brand.name,
  };
}

function equalsIgnoreCase(left: string, right: string): boolean {
  return left.trim().toLocaleLowerCase("es") === right.trim().toLocaleLowerCase("es");
}

async function assertProductBusinessUniqueness(input: {
  excludeId?: string;
  name: string;
  slug: string;
  href: string;
}) {
  const conflict = await findConflictingProductRecord(input);
  if (!conflict) {
    return;
  }

  if (equalsIgnoreCase(conflict.name, input.name)) {
    throw new CatalogConflictError("Product name already exists.");
  }

  if (equalsIgnoreCase(conflict.slug, input.slug)) {
    throw new CatalogConflictError("Product slug already exists.");
  }

  if (equalsIgnoreCase(conflict.href, input.href)) {
    throw new CatalogConflictError("Product href already exists.");
  }
}

export async function createProduct(input: AdminProductFormData) {
  const parsedInput = adminProductFormSchema.parse(input);
  const identity = resolveProductIdentity(parsedInput);
  const mediaAssetId = normalizeMediaAssetId(parsedInput.mediaAssetId);
  const categoryIds = normalizeCategoryIds(parsedInput.categoryId, parsedInput.categoryIds);
  const primaryCategoryId = categoryIds[0] ?? "";
  const brand = await assertBrandExists(parsedInput.brandId);
  await assertCategoriesExist(categoryIds);
  await assertMediaAssetExists(mediaAssetId);
  await assertMediaAssetExists(normalizeMediaAssetId(parsedInput.nutritionalInfoImageId));
  for (const ing of parsedInput.ingredients) {
    await assertMediaAssetExists(normalizeMediaAssetId(ing.mediaAssetId));
  }
  for (const g of parsedInput.galleryImages) {
    await assertMediaAssetExists(g.mediaAssetId);
  }
  for (const s of parsedInput.usageSteps) {
    await assertMediaAssetExists(normalizeMediaAssetId(s.mediaAssetId));
  }
  await assertProductBusinessUniqueness({
    name: parsedInput.name,
    slug: identity.slug,
    href: identity.href,
  });

  return prisma.product.create({
    data: {
      slug: identity.slug,
      name: parsedInput.name,
      brand: brand.name,
      brandId: brand.id,
      description: parsedInput.description,
      href: identity.href,
      badge: normalizeOptionalString(parsedInput.badge),
      badgeColor: normalizeOptionalBadgeColor(parsedInput),
      price: parsedInput.price,
      discountPrice: parsedInput.discountPrice,
      discountPercent: computeDiscountPercent(parsedInput.price, parsedInput.discountPrice),
      stock: parsedInput.stock,
      isActive: parsedInput.isActive,
      productColor: normalizeProductColor(parsedInput.productColor),
      nutritionalInfoImageId: normalizeMediaAssetId(parsedInput.nutritionalInfoImageId),
      categoryId: primaryCategoryId,
      categoryAssignments: {
        create: categoryIds.map((categoryId, index) => ({
          categoryId,
          position: index,
        })),
      },
      mediaAssetId,
      variants: {
        create: parsedInput.variants.map((v, index) => ({
          name: v.name,
          price: v.price,
          discountPrice: v.discountPrice,
          stock: v.stock,
          isActive: v.isActive,
          sortOrder: v.sortOrder ?? index,
        })),
      },
      ingredients: {
        create: parsedInput.ingredients.map((ing, index) => ({
          name: ing.name,
          description: ing.description || null,
          mediaAssetId: normalizeMediaAssetId(ing.mediaAssetId),
          sortOrder: ing.sortOrder ?? index,
        })),
      },
      benefits: {
        create: parsedInput.benefits.map((b, index) => ({
          text: b.text,
          iconKey: b.iconKey,
          sortOrder: b.sortOrder ?? index,
        })),
      },
      galleryImages: {
        create: parsedInput.galleryImages.map((g, index) => ({
          mediaAssetId: g.mediaAssetId,
          sortOrder: g.sortOrder ?? index,
        })),
      },
      usageSteps: {
        create: parsedInput.usageSteps.map((s) => ({
          stepNumber: s.stepNumber,
          text: s.text,
          mediaAssetId: normalizeMediaAssetId(s.mediaAssetId),
        })),
      },
      trustBadges: {
        create: parsedInput.trustBadges.map((b, index) => ({
          text: b.text,
          iconKey: b.iconKey,
          sortOrder: b.sortOrder ?? index,
        })),
      },
      pickupLocations: {
        create: parsedInput.pickupLocationIds.map((locationId) => ({
          pickupLocationId: locationId,
        })),
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      brandRecord: {
        select: {
          id: true,
          name: true,
        },
      },
      categoryAssignments: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
            },
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
    },
  });
}

export async function updateProduct(id: string, input: AdminProductFormData) {
  const existingProduct = await findAdminProductRecord(id);
  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const parsedInput = adminProductFormSchema.parse(input);
  const identity = resolveProductIdentity(parsedInput);
  const mediaAssetId = normalizeMediaAssetId(parsedInput.mediaAssetId);
  const categoryIds = normalizeCategoryIds(parsedInput.categoryId, parsedInput.categoryIds);
  const primaryCategoryId = categoryIds[0] ?? null;
  const brand = await assertBrandExists(parsedInput.brandId);
  await assertCategoriesExist(categoryIds);
  await assertMediaAssetExists(mediaAssetId);
  await assertMediaAssetExists(normalizeMediaAssetId(parsedInput.nutritionalInfoImageId));
  for (const ing of parsedInput.ingredients) {
    await assertMediaAssetExists(normalizeMediaAssetId(ing.mediaAssetId));
  }
  for (const g of parsedInput.galleryImages) {
    await assertMediaAssetExists(g.mediaAssetId);
  }
  for (const s of parsedInput.usageSteps) {
    await assertMediaAssetExists(normalizeMediaAssetId(s.mediaAssetId));
  }
  await assertProductBusinessUniqueness({
    excludeId: id,
    name: parsedInput.name,
    slug: identity.slug,
    href: identity.href,
  });

  const syncManagedPricingFields = existingProduct.externalSourceId
    ? {
        price: existingProduct.price,
        discountPrice: existingProduct.discountPrice,
        discountPercent: computeDiscountPercent(existingProduct.price, existingProduct.discountPrice),
        stock: existingProduct.stock,
      }
    : {
        price: parsedInput.price,
        discountPrice: parsedInput.discountPrice,
        discountPercent: computeDiscountPercent(parsedInput.price, parsedInput.discountPrice),
        stock: parsedInput.stock,
      };

  return prisma.product.update({
    where: {
      id,
    },
    data: {
      slug: identity.slug,
      name: parsedInput.name,
      brand: brand.name,
      brandId: brand.id,
      description: parsedInput.description,
      href: identity.href,
      badge: normalizeOptionalString(parsedInput.badge),
      badgeColor: normalizeOptionalBadgeColor(parsedInput),
      ...syncManagedPricingFields,
      isActive: parsedInput.isActive,
      productColor: normalizeProductColor(parsedInput.productColor),
      nutritionalInfoImageId: normalizeMediaAssetId(parsedInput.nutritionalInfoImageId),
      categoryId: primaryCategoryId,
      categoryAssignments: {
        deleteMany: {},
        create: categoryIds.map((categoryId, index) => ({
          categoryId,
          position: index,
        })),
      },
      mediaAssetId,
      variants: {
        deleteMany: {},
        create: parsedInput.variants.map((v, index) => ({
          name: v.name,
          price: v.price,
          discountPrice: v.discountPrice,
          stock: v.stock,
          isActive: v.isActive,
          sortOrder: v.sortOrder ?? index,
        })),
      },
      ingredients: {
        deleteMany: {},
        create: parsedInput.ingredients.map((ing, index) => ({
          name: ing.name,
          description: ing.description || null,
          mediaAssetId: normalizeMediaAssetId(ing.mediaAssetId),
          sortOrder: ing.sortOrder ?? index,
        })),
      },
      benefits: {
        deleteMany: {},
        create: parsedInput.benefits.map((b, index) => ({
          text: b.text,
          iconKey: b.iconKey,
          sortOrder: b.sortOrder ?? index,
        })),
      },
      galleryImages: {
        deleteMany: {},
        create: parsedInput.galleryImages.map((g, index) => ({
          mediaAssetId: g.mediaAssetId,
          sortOrder: g.sortOrder ?? index,
        })),
      },
      usageSteps: {
        deleteMany: {},
        create: parsedInput.usageSteps.map((s) => ({
          stepNumber: s.stepNumber,
          text: s.text,
          mediaAssetId: normalizeMediaAssetId(s.mediaAssetId),
        })),
      },
      trustBadges: {
        deleteMany: {},
        create: parsedInput.trustBadges.map((b, index) => ({
          text: b.text,
          iconKey: b.iconKey,
          sortOrder: b.sortOrder ?? index,
        })),
      },
      pickupLocations: {
        deleteMany: {},
        create: parsedInput.pickupLocationIds.map((locationId) => ({
          pickupLocationId: locationId,
        })),
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      brandRecord: {
        select: {
          id: true,
          name: true,
        },
      },
      categoryAssignments: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
            },
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
    },
  });
}

export async function deleteProduct(id: string) {
  const existingProduct = await findAdminProductRecord(id);
  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  if (existingProduct.homeSelections.length > 0) {
    throw new Error("Cannot delete a product that is currently featured on Home.");
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return {
    deletedId: id,
  };
}

async function listExistingProductIds(ids: string[]): Promise<string[]> {
  const records = await prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
    },
  });

  return records.map((record) => record.id);
}

async function assertNoFeaturedProducts(ids: string[]): Promise<void> {
  const blockedRecords = await prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
      homeSelections: {
        some: {},
      },
    },
    select: {
      name: true,
    },
  });

  if (blockedRecords.length === 0) {
    return;
  }

  throw new CatalogBulkActionError(
    `Cannot delete products currently featured on Home: ${blockedRecords.map((record) => record.name).join(", ")}.`,
  );
}

export async function applyProductBulkAction(
  ids: string[],
  action: "activate" | "deactivate" | "delete",
): Promise<AdminCatalogBulkActionResult> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new CatalogBulkActionError("Select at least one product.");
  }

  const existingIds = await listExistingProductIds(uniqueIds);
  if (existingIds.length === 0) {
    throw new CatalogBulkActionError("No matching products were found.");
  }

  if (action === "delete") {
    await assertNoFeaturedProducts(existingIds);
    await prisma.product.deleteMany({
      where: {
        id: {
          in: existingIds,
        },
      },
    });
  } else {
    await prisma.product.updateMany({
      where: {
        id: {
          in: existingIds,
        },
      },
      data: {
        isActive: action === "activate",
      },
    });
  }

  return {
    action,
    processedIds: existingIds,
    processedCount: existingIds.length,
  };
}
