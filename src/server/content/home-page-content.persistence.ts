import "server-only";

import { z } from "zod";

import type {
  FeaturedCategoryContent,
  FeaturedProductContent,
  HomeCategoryGridContent,
  HomeHeroSlide,
  HomeEditorialSectionContent,
  HomeHeroSpotlightCard,
  HomePageContent,
  HomeProductShelfContent,
  HomePromoBannerContent,
  PublicActionLink,
  TrustHighlightContent,
} from "@/types/content";
import { MEDIA_ASSET_KINDS, type MediaAsset } from "@/types/media";

const featuredCategoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
});

const featuredProductItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1).optional(),
  description: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().min(1).optional(),
  badgeColor: z.string().regex(/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
  price: z.coerce.number().nonnegative().nullable().optional(),
  discountPrice: z.coerce.number().nonnegative().nullable().optional(),
  category: z
    .object({
      id: z.string().min(1),
      slug: z.string().min(1),
      name: z.string().min(1),
      href: z.string().min(1),
    })
    .nullable()
    .optional(),
});

const trustHighlightItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const storedMediaAssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(MEDIA_ASSET_KINDS),
  publicUrl: z.string().nullable(),
  storageKey: z.string().min(1),
  altText: z.string().nullable(),
  mimeType: z.string().nullable(),
  posterUrl: z.string().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  durationSeconds: z.number().int().nullable(),
});

const storedCategorySelectionSchema = z.object({
  position: z.number().int(),
  category: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    href: z.string().min(1),
    mediaAsset: storedMediaAssetSchema.nullable().optional(),
  }),
});

const storedProductSelectionSchema = z.object({
  position: z.number().int(),
  product: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    brand: z.string().min(1).optional(),
    description: z.string().min(1),
    href: z.string().min(1),
    badge: z.string().nullable().optional(),
    badgeColor: z.string().nullable().optional(),
    price: z.coerce.number().nonnegative(),
    discountPrice: z.coerce.number().nonnegative().nullable().optional(),
    category: z
      .object({
        id: z.string().min(1),
        slug: z.string().min(1),
        name: z.string().min(1),
        href: z.string().min(1),
      })
      .nullable()
      .optional(),
    mediaAsset: storedMediaAssetSchema.nullable().optional(),
  }),
});

export interface StoredHomePageContentRecord {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSupportingBadge: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string | null;
  heroSecondaryCtaHref: string | null;
  featuredCategoriesEyebrow: string;
  featuredCategoriesTitle: string;
  featuredCategoriesDescription: string;
  featuredCategoriesItems: unknown;
  featuredCategorySelections: unknown;
  featuredProductsEyebrow: string;
  featuredProductsTitle: string;
  featuredProductsDescription: string;
  featuredProductsItems: unknown;
  featuredProductSelections: unknown;
  trustHighlightsEyebrow: string;
  trustHighlightsTitle: string;
  trustHighlightsDescription: string;
  trustHighlightsItems: unknown;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryCtaText: string;
  ctaPrimaryCtaHref: string;
  ctaSecondaryCtaText: string | null;
  ctaSecondaryCtaHref: string | null;
  heroMedia: unknown;
  heroSecondaryMedia: unknown;
  heroTertiaryMedia: unknown;
}

function buildOptionalActionLink(
  label: string | null,
  href: string | null,
): PublicActionLink | undefined {
  if (!label || !href) {
    return undefined;
  }

  return {
    label,
    href,
  };
}

function mapStoredMediaAsset(asset: unknown): MediaAsset | null {
  if (!asset) {
    return null;
  }

  const parsedAsset = storedMediaAssetSchema.parse(asset);

  return {
    id: parsedAsset.id,
    kind: parsedAsset.kind,
    url: parsedAsset.publicUrl,
    storageKey: parsedAsset.storageKey,
    altText: parsedAsset.altText ?? "",
    mimeType: parsedAsset.mimeType,
    posterUrl: parsedAsset.posterUrl,
    width: parsedAsset.width,
    height: parsedAsset.height,
    durationSeconds: parsedAsset.durationSeconds,
  };
}

function parseFeaturedCategoriesItems(value: unknown): FeaturedCategoryContent[] {
  return featuredCategoryItemSchema.array().parse(value).map((item) => ({
    ...item,
    media: null,
  }));
}

function parseFeaturedCategorySelections(value: unknown): FeaturedCategoryContent[] {
  return storedCategorySelectionSchema.array().parse(value).map((selection) => ({
    id: selection.category.slug,
    name: selection.category.name,
    description: selection.category.description,
    href: selection.category.href,
    media: mapStoredMediaAsset(selection.category.mediaAsset ?? null),
  }));
}

function parseFeaturedProductsItems(value: unknown): FeaturedProductContent[] {
  return featuredProductItemSchema.array().parse(value).map((item) => {
    const baseItem = {
      id: item.id,
      name: item.name,
      brand: item.brand ?? "Sin marca",
      description: item.description,
      href: item.href,
      price: item.price ?? null,
      discountPrice: item.discountPrice ?? null,
      category: item.category ?? null,
      media: null,
    };

    return item.badge
      ? {
          ...baseItem,
          badge: item.badge,
          ...(item.badgeColor ? { badgeColor: item.badgeColor } : {}),
        }
      : baseItem;
  });
}

function parseFeaturedProductSelections(value: unknown): FeaturedProductContent[] {
  return storedProductSelectionSchema.array().parse(value).map((selection) => {
    const baseItem = {
      id: selection.product.slug,
      name: selection.product.name,
      brand: selection.product.brand ?? "Sin marca",
      description: selection.product.description,
      href: selection.product.href,
      price: selection.product.price,
      discountPrice: selection.product.discountPrice ?? null,
      category: selection.product.category
        ? {
            id: selection.product.category.id,
            slug: selection.product.category.slug,
            name: selection.product.category.name,
            href: selection.product.category.href,
          }
        : null,
      media: mapStoredMediaAsset(selection.product.mediaAsset ?? null),
    };

    return selection.product.badge
      ? {
          ...baseItem,
          badge: selection.product.badge,
          ...(selection.product.badgeColor ? { badgeColor: selection.product.badgeColor } : {}),
        }
      : baseItem;
  });
}

function resolveFeaturedCategories(record: StoredHomePageContentRecord): FeaturedCategoryContent[] {
  const relationalItems = parseFeaturedCategorySelections(record.featuredCategorySelections);
  return relationalItems.length > 0 ? relationalItems : parseFeaturedCategoriesItems(record.featuredCategoriesItems);
}

function resolveFeaturedProducts(record: StoredHomePageContentRecord): FeaturedProductContent[] {
  const relationalItems = parseFeaturedProductSelections(record.featuredProductSelections);
  const items = relationalItems.length > 0 ? relationalItems : parseFeaturedProductsItems(record.featuredProductsItems);
  return items.slice(0, 10);
}

function parseTrustHighlightsItems(value: unknown): TrustHighlightContent[] {
  return trustHighlightItemSchema.array().parse(value);
}

function buildHeroSlides(
  record: StoredHomePageContentRecord,
  heroSecondaryCta?: PublicActionLink,
): HomeHeroSlide[] {
  const primaryHeroMedia = mapStoredMediaAsset(record.heroMedia);
  const secondaryHeroMedia = mapStoredMediaAsset(record.heroSecondaryMedia) ?? primaryHeroMedia;
  const tertiaryHeroMedia = mapStoredMediaAsset(record.heroTertiaryMedia) ?? secondaryHeroMedia ?? primaryHeroMedia;

  return [
    {
      id: "hero-primary",
      announcement: `Nueva campaña: ${record.heroSupportingBadge}`,
      eyebrow: record.heroEyebrow,
      title: record.heroTitle,
      subtitle: record.heroSubtitle,
      supportingBadge: record.heroSupportingBadge,
      primaryCta: {
        label: record.heroPrimaryCtaText,
        href: record.heroPrimaryCtaHref,
      },
      ...(heroSecondaryCta ? { secondaryCta: heroSecondaryCta } : {}),
      media: primaryHeroMedia,
    },
    {
      id: "hero-featured-products",
      announcement: "Slider storefront listo para campañas y merchandising visual.",
      eyebrow: record.featuredProductsEyebrow,
      title: record.featuredProductsTitle,
      subtitle:
        "La portada puede rotar entre foco comercial, categorías o lanzamientos sin romper la arquitectura de contenido server-side.",
      supportingBadge: "Preparado para banners editables",
      primaryCta: {
        label: "Ver selección protagonista",
        href: "#featured-products",
      },
      secondaryCta: {
        label: "Explorar campaña",
        href: "#featured-campaign",
      },
      media: secondaryHeroMedia,
    },
    {
      id: "hero-trust-highlight",
      announcement: "Contenido experto, beneficios y navegación comercial dentro del mismo hero.",
      eyebrow: record.trustHighlightsEyebrow,
      title: record.trustHighlightsTitle,
      subtitle:
        "La nueva portada ya soporta un patrón slider para combinar banners visuales, mensajes de confianza y accesos a bloques clave.",
      supportingBadge: "Escalable a múltiples imágenes de portada",
      primaryCta: {
        label: "Ver beneficios",
        href: "#trust-highlights",
      },
      secondaryCta: {
        label: "Ir al cierre",
        href: "#contact-cta",
      },
      media: tertiaryHeroMedia,
    },
  ];
}

function buildHeroSpotlightCards(record: StoredHomePageContentRecord): HomeHeroSpotlightCard[] {
  const featuredProducts = resolveFeaturedProducts(record);
  const featuredCategories = resolveFeaturedCategories(record);

  return [
    featuredProducts[0]
      ? {
          id: `hero-${featuredProducts[0].id}`,
          eyebrow: record.featuredProductsEyebrow,
          title: featuredProducts[0].name,
          href: featuredProducts[0].href,
          media: featuredProducts[0].media,
        }
      : null,
    featuredCategories[0]
      ? {
          id: `hero-${featuredCategories[0].id}`,
          eyebrow: record.featuredCategoriesEyebrow,
          title: featuredCategories[0].name,
          href: featuredCategories[0].href,
          media: featuredCategories[0].media,
        }
      : null,
    {
      id: "hero-trust-guidance",
      eyebrow: record.trustHighlightsEyebrow,
      title: record.trustHighlightsTitle,
      href: "#trust-highlights",
      media: null,
    },
  ].filter((item): item is HomeHeroSpotlightCard => Boolean(item));
}

function buildFeaturedCampaignContent(record: StoredHomePageContentRecord): HomePromoBannerContent {
  return {
    sectionId: "featured-campaign",
    eyebrow: "Campana destacada",
    title: "Una franja promocional reusable para lanzamientos, foco estacional o narrativa comercial.",
    description:
      "Este bloque queda listo para destacar una linea, una campaña o una edicion curada sin acoplar la Home al catalogo definitivo.",
    accentText: record.heroSupportingBadge,
    primaryCta: {
      label: record.featuredProductsTitle,
      href: "#featured-products",
    },
    secondaryCta: {
      label: record.featuredCategoriesTitle,
      href: "#featured-categories",
    },
    media: null,
  };
}

function buildFeaturedProductsContent(record: StoredHomePageContentRecord): HomeProductShelfContent {
  return {
    sectionId: "featured-products",
    eyebrow: record.featuredProductsEyebrow,
    title: record.featuredProductsTitle,
    description: record.featuredProductsDescription,
    cta: {
      label: "Explorar esta seleccion",
      href: "#contact-cta",
    },
    items: resolveFeaturedProducts(record),
  };
}

function buildRoutinePromoContent(record: StoredHomePageContentRecord): HomePromoBannerContent {
  return {
    sectionId: "routine-promo",
    eyebrow: "Continuidad de rutina",
    title: "Otro bloque promocional para sostener el ritmo comercial sin saturar el hero.",
    description:
      "La nueva Home admite una segunda insercion para bundles, reposicion o educacion comercial entre estanterias de producto.",
    accentText: record.ctaEyebrow,
    primaryCta: {
      label: "Ver beneficios",
      href: "#trust-highlights",
    },
    secondaryCta: {
      label: "Ir al cierre",
      href: "#contact-cta",
    },
    media: null,
  };
}

function buildFeaturedCategoriesContent(record: StoredHomePageContentRecord): HomeCategoryGridContent {
  return {
    sectionId: "featured-categories",
    eyebrow: record.featuredCategoriesEyebrow,
    title: record.featuredCategoriesTitle,
    description: record.featuredCategoriesDescription,
    cta: {
      label: "Recibir orientacion",
      href: "#contact-cta",
    },
    items: resolveFeaturedCategories(record),
  };
}

function buildRoutineProductsContent(record: StoredHomePageContentRecord): HomeProductShelfContent {
  const items = resolveFeaturedProducts(record);

  return {
    sectionId: "routine-products",
    eyebrow: "Segunda seleccion",
    title: "Una segunda shelf preparada para continuidad, packs o recomendaciones por objetivo.",
    description:
      "El storefront puede repetir modulos de producto con distinto enfoque editorial sin cambiar la arquitectura de contenido.",
    cta: {
      label: "Consultar rutina sugerida",
      href: "#editorial-guidance",
    },
    items: items.map((item, index) => {
      const badge =
        index === 0 ? "Rutina guiada" : index === 1 ? "Reposicion" : item.badge;

      return {
        ...item,
        id: `routine-${item.id}`,
        ...(badge ? { badge } : {}),
      };
    }),
  };
}

function buildEditorialContent(record: StoredHomePageContentRecord): HomeEditorialSectionContent {
  return {
    sectionId: "editorial-guidance",
    eyebrow: "Criterio editorial",
    title: "Un bloque split para educar, ordenar decision y preparar futuras capas de contenido.",
    description:
      "Esta zona introduce confianza, metodo y acompanamiento sin mezclar la logica comercial con el renderizado de la pagina.",
    accentText: record.trustHighlightsEyebrow,
    primaryCta: {
      label: "Conocer el enfoque",
      href: "#trust-highlights",
    },
    secondaryCta: {
      label: "Hablar con el equipo",
      href: "#contact-cta",
    },
    media: null,
    items: parseTrustHighlightsItems(record.trustHighlightsItems),
  };
}

export function mapStoredHomePageContent(
  record: StoredHomePageContentRecord,
): HomePageContent {
  const heroSecondaryCta = buildOptionalActionLink(
    record.heroSecondaryCtaText,
    record.heroSecondaryCtaHref,
  );
  const ctaSecondaryCta = buildOptionalActionLink(
    record.ctaSecondaryCtaText,
    record.ctaSecondaryCtaHref,
  );

  return {
    hero: {
      slides: buildHeroSlides(record, heroSecondaryCta),
      spotlightCards: buildHeroSpotlightCards(record),
    },
    featuredCampaign: buildFeaturedCampaignContent(record),
    featuredProducts: buildFeaturedProductsContent(record),
    routinePromo: buildRoutinePromoContent(record),
    featuredCategories: buildFeaturedCategoriesContent(record),
    routineProducts: buildRoutineProductsContent(record),
    editorial: buildEditorialContent(record),
    trustHighlights: {
      sectionId: "trust-highlights",
      eyebrow: record.trustHighlightsEyebrow,
      title: record.trustHighlightsTitle,
      description: record.trustHighlightsDescription,
      items: parseTrustHighlightsItems(record.trustHighlightsItems),
    },
    cta: {
      sectionId: "contact-cta",
      eyebrow: record.ctaEyebrow,
      title: record.ctaTitle,
      description: record.ctaDescription,
      primaryCta: {
        label: record.ctaPrimaryCtaText,
        href: record.ctaPrimaryCtaHref,
      },
      ...(ctaSecondaryCta ? { secondaryCta: ctaSecondaryCta } : {}),
    },
  };
}

