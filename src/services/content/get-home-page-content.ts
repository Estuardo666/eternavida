import "server-only";

import { fallbackHomePageContent } from "@/server/content/home-page-content.fallback";
import { readStoredHomePageContent } from "@/server/content/home-page-content.source";
import type { FeaturedCategoryContent, HomePageContentResult } from "@/types/content";
import type { MediaAsset } from "@/types/media";

const CATEGORY_IMAGE_FILES = [
  "1107.jpg",
  "138219.jpg",
  "147186.jpg",
  "181090.jpg",
  "2247.jpg",
  "23273.jpg",
  "364942.jpg",
  "48159.jpg",
  "484899.jpg",
  "87122.jpg",
] as const;

function hashCategoryId(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function buildCategoryImageAsset(categoryId: string, categoryName: string): MediaAsset {
  const fileName =
    CATEGORY_IMAGE_FILES[hashCategoryId(categoryId) % CATEGORY_IMAGE_FILES.length] ?? CATEGORY_IMAGE_FILES[0];

  return {
    id: `hardcoded-category-media-${categoryId}`,
    kind: "image",
    url: `/media/new dev media/${encodeURIComponent(fileName)}`,
    storageKey: `public/media/new dev media/${fileName}`,
    altText: categoryName,
    mimeType: null,
    posterUrl: null,
    width: null,
    height: null,
    durationSeconds: null,
  };
}

function withHardcodedCategoryMedia(items: FeaturedCategoryContent[]): FeaturedCategoryContent[] {
  return items.map((item) => {
    if (item.media?.url) {
      return item;
    }

    return {
      ...item,
      media: buildCategoryImageAsset(item.id, item.name),
    };
  });
}

export async function getHomePageContent(): Promise<HomePageContentResult> {
  const storedContent = await readStoredHomePageContent();

  if (storedContent) {
    const base = fallbackHomePageContent;

    const merged: typeof storedContent = {
      ...base,
      hero: storedContent.hero,
      featuredCampaign: {
        ...base.featuredCampaign,
        media: storedContent.featuredCampaign.media ?? base.featuredCampaign.media,
      },
      featuredProducts: {
        ...base.featuredProducts,
        items: storedContent.featuredProducts.items,
      },
      routinePromo: {
        ...base.routinePromo,
        media: storedContent.routinePromo.media ?? base.routinePromo.media,
      },
      featuredCategories: {
        ...base.featuredCategories,
        items: withHardcodedCategoryMedia(storedContent.featuredCategories.items),
      },
      routineProducts: {
        ...base.routineProducts,
        items: storedContent.routineProducts.items,
      },
      editorial: {
        ...base.editorial,
        media: storedContent.editorial.media ?? base.editorial.media,
        items: storedContent.editorial.items,
      },
      trustHighlights: {
        ...base.trustHighlights,
        items: storedContent.trustHighlights.items,
      },
      cta: {
        ...base.cta,
        primaryCta: {
          ...base.cta.primaryCta,
          href: storedContent.cta.primaryCta.href,
        },
        ...(storedContent.cta.secondaryCta ?? base.cta.secondaryCta
          ? { secondaryCta: storedContent.cta.secondaryCta ?? base.cta.secondaryCta }
          : {}),
      },
    };

    if (merged.featuredProducts.items.length < 10) {
      const existingIds = new Set(merged.featuredProducts.items.map((p) => p.id));
      const needed = 10 - merged.featuredProducts.items.length;
      const extras = fallbackHomePageContent.featuredProducts.items
        .filter((p) => !existingIds.has(p.id))
        .slice(0, needed);
      merged.featuredProducts.items = [...merged.featuredProducts.items, ...extras];
    }

    return {
      content: merged,
      source: "database",
    };
  }

  return {
    content: {
      ...fallbackHomePageContent,
      featuredCategories: {
        ...fallbackHomePageContent.featuredCategories,
        items: withHardcodedCategoryMedia(fallbackHomePageContent.featuredCategories.items),
      },
    },
    source: "fallback",
  };
}
