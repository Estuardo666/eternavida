import "server-only";

import { adminHomeContentFormSchema, parseTrustHighlightsItemsJson } from "@/features/admin-content/schemas/admin-home-content.schema";
import { prisma } from "@/server/db/prisma";
import type { AdminHomeContentFormData } from "@/types/admin-home-content";

export async function updateHomeContent(input: AdminHomeContentFormData) {
  const parsedInput = adminHomeContentFormSchema.parse(input);

  const heroMediaIds = [
    parsedInput.heroMediaId,
    parsedInput.heroSecondaryMediaId,
    parsedInput.heroTertiaryMediaId,
  ].filter((value): value is string => value.length > 0);

  if (heroMediaIds.length > 0) {
    const existingHeroMediaAssets = await prisma.mediaAsset.findMany({
      where: {
        id: {
          in: heroMediaIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingHeroMediaAssets.length !== new Set(heroMediaIds).size) {
      throw new Error("One or more selected hero media assets do not exist.");
    }
  }

  const heroAltTextUpdates = [
    { id: parsedInput.heroMediaId, altText: parsedInput.heroMediaAltText },
    { id: parsedInput.heroSecondaryMediaId, altText: parsedInput.heroSecondaryMediaAltText },
    { id: parsedInput.heroTertiaryMediaId, altText: parsedInput.heroTertiaryMediaAltText },
  ].filter((entry): entry is { id: string; altText: string } => entry.id.length > 0 && entry.altText.length > 0);

  const [existingCategories, existingProducts] = await Promise.all([
    prisma.category.findMany({
      where: {
        id: {
          in: parsedInput.featuredCategoryIds,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        href: true,
      },
    }),
    prisma.product.findMany({
      where: {
        id: {
          in: parsedInput.featuredProductIds,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        href: true,
        badge: true,
        badgeColor: true,
        price: true,
        discountPrice: true,
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            href: true,
          },
        },
      },
    }),
  ]);

  if (existingCategories.length !== new Set(parsedInput.featuredCategoryIds).size) {
    throw new Error("One or more selected featured categories do not exist.");
  }

  if (existingProducts.length !== new Set(parsedInput.featuredProductIds).size) {
    throw new Error("One or more selected featured products do not exist.");
  }

  const featuredCategoriesItems = parsedInput.featuredCategoryIds.map((categoryId) => {
    const category = existingCategories.find((item) => item.id === categoryId);

    if (!category) {
      throw new Error("One or more selected featured categories do not exist.");
    }

    return {
      id: category.slug,
      name: category.name,
      description: category.description,
      href: category.href,
    };
  });

  const featuredProductsItems = parsedInput.featuredProductIds.map((productId) => {
    const product = existingProducts.find((item) => item.id === productId);

    if (!product) {
      throw new Error("One or more selected featured products do not exist.");
    }

    return {
      id: product.slug,
      name: product.name,
      description: product.description,
      href: product.href,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      category: product.category
        ? {
            id: product.category.id,
            slug: product.category.slug,
            name: product.category.name,
            href: product.category.href,
          }
        : null,
      ...(product.badge ? { badge: product.badge } : {}),
      ...(product.badgeColor ? { badgeColor: product.badgeColor } : {}),
    };
  });

  return prisma.$transaction(async (transaction) => {
    const homeRecord = await transaction.homePageContent.upsert({
      where: {
        slug: "home",
      },
      update: {
        heroEyebrow: parsedInput.heroEyebrow,
        heroTitle: parsedInput.heroTitle,
        heroSubtitle: parsedInput.heroSubtitle,
        heroSupportingBadge: parsedInput.heroSupportingBadge,
        heroPrimaryCtaText: parsedInput.heroPrimaryCtaText,
        heroPrimaryCtaHref: parsedInput.heroPrimaryCtaHref,
        heroSecondaryCtaText: parsedInput.heroSecondaryCtaText || null,
        heroSecondaryCtaHref: parsedInput.heroSecondaryCtaHref || null,
        heroMediaId: parsedInput.heroMediaId || null,
        heroSecondaryMediaId: parsedInput.heroSecondaryMediaId || null,
        heroTertiaryMediaId: parsedInput.heroTertiaryMediaId || null,
        featuredCategoriesEyebrow: parsedInput.featuredCategoriesEyebrow,
        featuredCategoriesTitle: parsedInput.featuredCategoriesTitle,
        featuredCategoriesDescription: parsedInput.featuredCategoriesDescription,
        featuredCategoriesItems,
        featuredProductsEyebrow: parsedInput.featuredProductsEyebrow,
        featuredProductsTitle: parsedInput.featuredProductsTitle,
        featuredProductsDescription: parsedInput.featuredProductsDescription,
        featuredProductsItems,
        trustHighlightsEyebrow: parsedInput.trustHighlightsEyebrow,
        trustHighlightsTitle: parsedInput.trustHighlightsTitle,
        trustHighlightsDescription: parsedInput.trustHighlightsDescription,
        trustHighlightsItems: parseTrustHighlightsItemsJson(parsedInput.trustHighlightsItemsJson),
        ctaEyebrow: parsedInput.ctaEyebrow,
        ctaTitle: parsedInput.ctaTitle,
        ctaDescription: parsedInput.ctaDescription,
        ctaPrimaryCtaText: parsedInput.ctaPrimaryCtaText,
        ctaPrimaryCtaHref: parsedInput.ctaPrimaryCtaHref,
        ctaSecondaryCtaText: parsedInput.ctaSecondaryCtaText || null,
        ctaSecondaryCtaHref: parsedInput.ctaSecondaryCtaHref || null,
      },
      create: {
        slug: "home",
        heroEyebrow: parsedInput.heroEyebrow,
        heroTitle: parsedInput.heroTitle,
        heroSubtitle: parsedInput.heroSubtitle,
        heroSupportingBadge: parsedInput.heroSupportingBadge,
        heroPrimaryCtaText: parsedInput.heroPrimaryCtaText,
        heroPrimaryCtaHref: parsedInput.heroPrimaryCtaHref,
        heroSecondaryCtaText: parsedInput.heroSecondaryCtaText || null,
        heroSecondaryCtaHref: parsedInput.heroSecondaryCtaHref || null,
        heroMediaId: parsedInput.heroMediaId || null,
        heroSecondaryMediaId: parsedInput.heroSecondaryMediaId || null,
        heroTertiaryMediaId: parsedInput.heroTertiaryMediaId || null,
        featuredCategoriesEyebrow: parsedInput.featuredCategoriesEyebrow,
        featuredCategoriesTitle: parsedInput.featuredCategoriesTitle,
        featuredCategoriesDescription: parsedInput.featuredCategoriesDescription,
        featuredCategoriesItems,
        featuredProductsEyebrow: parsedInput.featuredProductsEyebrow,
        featuredProductsTitle: parsedInput.featuredProductsTitle,
        featuredProductsDescription: parsedInput.featuredProductsDescription,
        featuredProductsItems,
        trustHighlightsEyebrow: parsedInput.trustHighlightsEyebrow,
        trustHighlightsTitle: parsedInput.trustHighlightsTitle,
        trustHighlightsDescription: parsedInput.trustHighlightsDescription,
        trustHighlightsItems: parseTrustHighlightsItemsJson(parsedInput.trustHighlightsItemsJson),
        ctaEyebrow: parsedInput.ctaEyebrow,
        ctaTitle: parsedInput.ctaTitle,
        ctaDescription: parsedInput.ctaDescription,
        ctaPrimaryCtaText: parsedInput.ctaPrimaryCtaText,
        ctaPrimaryCtaHref: parsedInput.ctaPrimaryCtaHref,
        ctaSecondaryCtaText: parsedInput.ctaSecondaryCtaText || null,
        ctaSecondaryCtaHref: parsedInput.ctaSecondaryCtaHref || null,
      },
      select: {
        id: true,
      },
    });

    await Promise.all([
      transaction.homeFeaturedCategory.deleteMany({
        where: {
          homePageContentId: homeRecord.id,
        },
      }),
      transaction.homeFeaturedProduct.deleteMany({
        where: {
          homePageContentId: homeRecord.id,
        },
      }),
    ]);

    await Promise.all([
      transaction.homeFeaturedCategory.createMany({
        data: parsedInput.featuredCategoryIds.map((categoryId, index) => ({
          homePageContentId: homeRecord.id,
          categoryId,
          position: index,
        })),
      }),
      transaction.homeFeaturedProduct.createMany({
        data: parsedInput.featuredProductIds.map((productId, index) => ({
          homePageContentId: homeRecord.id,
          productId,
          position: index,
        })),
      }),
      ...heroAltTextUpdates.map((entry) =>
        transaction.mediaAsset.update({
          where: { id: entry.id },
          data: { altText: entry.altText },
        }),
      ),
    ]);

    return homeRecord;
  });
}
