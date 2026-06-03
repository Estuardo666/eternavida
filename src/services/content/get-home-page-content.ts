import "server-only";

import { fallbackHomePageContent } from "@/server/content/home-page-content.fallback";
import { readStoredHomePageContent } from "@/server/content/home-page-content.source";
import type { FeaturedCategoryContent, HomePageContentResult } from "@/types/content";
import type { MediaAsset } from "@/types/media";

const CATEGORY_IMAGE_FILES = [
  "1118203697w2.jpg",
  "695e827d401048-56953560.webp",
  "Amaela-cuidado-facial-con-productos-dermatologicos-1-scaled-e1775929344399.webp",
  "BLOG_AQUILEA_UNAS_PELO_PIEL.height-310.jpg",
  "Como-elegir-productos-dermatologicos-segun-tu-tipo-de-piel.jpg",
  "DSC0527-scaled.jpg",
  "FACH13203-FOTO1.jpg",
  "FACH13203-FOTO2.jpg",
  "Manchas.jpg",
  "Productos_dermatologicos_para_el_acne.webp",
  "acne y piel grasa.jpg",
  "azelacruglo.webp",
  "cat 7.webp",
  "cat 8.jpg",
  "cat bloqueadores solares.jpg",
  "cat1.webp",
  "cat2.webp",
  "cat3.webp",
  "cat4.jpg",
  "cathombre.jpg",
  "contorno de ojos.webp",
  "elenederm-banner-principal-expertos-dermocosmetica-avanzada.webp",
  "limpieza clinica.jpg",
  "maquillaje dermo.webp",
  "parafarmacia-dermocosmetica.webp",
  "productos-dermatologicos-scaled.jpg",
  "productos_dermatologicos_para_la_piel.webp",
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
