import "server-only";

import { fallbackHomePageContent } from "@/server/content/home-page-content.fallback";
import { readStoredHomePageContent } from "@/server/content/home-page-content.source";
import type { FeaturedCategoryContent, HomePageContentResult } from "@/types/content";
import type { MediaAsset } from "@/types/media";

const CATEGORY_IMAGE_FILES = [
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

function hashCategoryId(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function resolveSemanticCategoryImageFile(categoryId: string, categoryName: string): string | null {
  const searchable = normalizeCategoryText(`${categoryId} ${categoryName}`);

  if (searchable.includes("limpieza")) {
    return "limpieza clinica.jpg";
  }

  if (searchable.includes("acne") || searchable.includes("grasa")) {
    return "acne y piel grasa.jpg";
  }

  if (
    searchable.includes("proteccion") ||
    searchable.includes("solar") ||
    searchable.includes("bloqueador")
  ) {
    return "cat bloqueadores solares.jpg";
  }

  if (searchable.includes("contorno") || searchable.includes("ojos") || searchable.includes("ojo")) {
    return "contorno de ojos.webp";
  }

  if (searchable.includes("maquillaje")) {
    return "maquillaje dermo.webp";
  }

  if (searchable.includes("hombre") || searchable.includes("men")) {
    return "cathombre.jpg";
  }

  if (
    searchable.includes("post") ||
    searchable.includes("procedimiento") ||
    searchable.includes("barrera") ||
    searchable.includes("reparacion")
  ) {
    return "cat4.jpg";
  }

  return null;
}

function buildCategoryImageAsset(categoryId: string, categoryName: string): MediaAsset {
  const semanticFileName = resolveSemanticCategoryImageFile(categoryId, categoryName);
  const fallbackFileName =
    CATEGORY_IMAGE_FILES[hashCategoryId(categoryId) % CATEGORY_IMAGE_FILES.length] ?? "cat1.webp";
  const fileName = semanticFileName ?? fallbackFileName;

  return {
    id: `hardcoded-category-media-${categoryId}`,
    kind: "image",
    url: `/categorias/${encodeURIComponent(fileName)}`,
    storageKey: `public/categorias/${fileName}`,
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
