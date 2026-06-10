import "server-only";

import type { HomePageContent } from "@/types/content";

export const fallbackHomePageContent: HomePageContent = {
  hero: {
    slides: [
      {
        id: "hero-slide-natural",
        announcement: "Productos naturales y artesanales",
        eyebrow: "Bienestar natural",
        title: "Cultivando bienestar desde la naturaleza",
        subtitle:
          "Descubre productos artesanales elaborados con ingredientes naturales que cuidan de ti, tu familia y el planeta.",
        supportingBadge: "100% natural",
        primaryCta: {
          label: "Comprar ahora",
          href: "#featured-products",
        },
        secondaryCta: {
          label: "Conoce nuestra historia",
          href: "#editorial-guidance",
        },
        media: null,
      },
      {
        id: "hero-slide-honey",
        announcement: "Miel pura directo de la colmena",
        eyebrow: "Productos que nutren",
        title: "La dulzura que sana",
        subtitle:
          "Miel 100% pura proveniente de colmenas manejadas de forma responsable y sostenible. Directamente de la colmena a tu mesa.",
        supportingBadge: "Producción responsable",
        primaryCta: {
          label: "Ver miel de abeja",
          href: "#featured-products",
        },
        secondaryCta: {
          label: "Explorar aceites",
          href: "#featured-categories",
        },
        media: null,
      },
      {
        id: "hero-slide-artisan",
        announcement: "Elaboración artesanal con propósito",
        eyebrow: "Elaboración artesanal",
        title: "Desde la palma a tu mesa",
        subtitle:
          "Cada producto pasa por procesos controlados que priorizan calidad sobre volumen. Pura naturaleza, elaboración con propósito.",
        supportingBadge: "Hecho en Ecuador",
        primaryCta: {
          label: "Descubrir productos",
          href: "#featured-products",
        },
        secondaryCta: {
          label: "Ver impacto social",
          href: "#trust-highlights",
        },
        media: null,
      },
    ],
    spotlightCards: [
      {
        id: "hero-card-honey",
        eyebrow: "Productos apícolas",
        title: "Miel de abeja pura",
        href: "#featured-products",
        media: null,
      },
      {
        id: "hero-card-oils",
        eyebrow: "Aceites naturales",
        title: "Coco virgen y orégano",
        href: "#featured-categories",
        media: null,
      },
      {
        id: "hero-card-story",
        eyebrow: "Nuestra historia",
        title: "Conoce Eterna Vida",
        href: "#editorial-guidance",
        media: null,
      },
    ],
  },
  featuredCampaign: {
    sectionId: "featured-campaign",
    eyebrow: "Productos con propósito",
    title: "Productos naturales que transforman vidas.",
    description:
      "Cada compra genera oportunidades para madres solateras, jóvenes y personas con recursos limitados. Bienestar para ti, impacto para nuestra comunidad.",
    accentText: "Impacto social",
    primaryCta: {
      label: "Ver productos",
      href: "#featured-products",
    },
    secondaryCta: {
      label: "Explorar categorías",
      href: "#featured-categories",
    },
    media: null,
  },
  featuredProducts: {
    sectionId: "featured-products",
    eyebrow: "Nuestros productos estrella",
    title: "Directo de la naturaleza a tu hogar",
    description:
      "Productos artesanales elaborados con ingredientes naturales seleccionados. Calidad, pureza y propósito en cada producto.",
    cta: {
      label: "Ver todos los productos",
      href: "#contact-cta",
    },
    items: [
      {
        id: "product-honey",
        name: "Miel de abeja pura",
        brand: "Eterna Vida",
        description: "Miel 100% pura proveniente de colmenas manejadas de forma responsable y sostenible. Endulzante natural, alternativa al azúcar refinada.",
        href: "#contact-cta",
        badge: "Destacado",
        price: 12,
        discountPrice: null,
        category: {
          id: "productos-apicolas",
          slug: "productos-apicolas",
          name: "Productos apícolas",
          href: "#contact-cta",
        },
        media: null,
      },
      {
        id: "product-coconut-oil",
        name: "Aceite de coco virgen",
        brand: "Eterna Vida",
        description: "Aceite de coco extraído artesanalmente y procesado el mismo día de su elaboración para conservar su pureza y calidad. Uso culinario, hidratación y cuidado capilar.",
        href: "#contact-cta",
        badge: "Más vendido",
        price: 15,
        discountPrice: null,
        category: {
          id: "aceites-naturales",
          slug: "aceites-naturales",
          name: "Aceites naturales",
          href: "#contact-cta",
        },
        media: null,
      },
      {
        id: "product-oregano-oil",
        name: "Aceite de orégano",
        brand: "Eterna Vida",
        description: "Aceite elaborado a partir de orégano cultivado y procesado artesanalmente. Pequeñas gotas, grandes defensas. Bienestar integral y complemento natural.",
        href: "#contact-cta",
        badge: "Natural",
        price: 18,
        discountPrice: null,
        category: {
          id: "aceites-naturales",
          slug: "aceites-naturales",
          name: "Aceites naturales",
          href: "#contact-cta",
        },
        media: null,
      },
    ],
  },
  routinePromo: {
    sectionId: "routine-promo",
    eyebrow: "Bienestar integral",
    title: "Cultiva hábitos saludables",
    description:
      "Descubre cómo nuestros productos naturales pueden ser parte de tu rutina diaria de bienestar. Alimentación consciente, cuidado personal y salud natural.",
    accentText: "Productos multifuncionales",
    primaryCta: {
      label: "Ver productos",
      href: "#featured-products",
    },
    secondaryCta: {
      label: "Conoce nuestra historia",
      href: "#editorial-guidance",
    },
    media: null,
  },
  featuredCategories: {
    sectionId: "featured-categories",
    eyebrow: "Explora por categoría",
    title: "Descubre nuestros productos naturales",
    description:
      "Navega por nuestras categorías de productos artesanales. Desde miel pura hasta aceites naturales, cada producto tiene un propósito.",
    cta: {
      label: "Ver todos los productos",
      href: "#contact-cta",
    },
    items: [
      {
        id: "productos-apicolas",
        name: "Productos apícolas",
        description: "Miel pura de colmenas manejadas de forma responsable y sostenible.",
        href: "#contact-cta",
        media: null,
      },
      {
        id: "aceites-naturales",
        name: "Aceites naturales",
        description: "Aceite de coco virgen y aceite de orégano, elaboración artesanal.",
        href: "#contact-cta",
        media: null,
      },
      {
        id: "bienestar-natural",
        name: "Bienestar natural",
        description: "Próximamente más productos para tu salud y bienestar integral.",
        href: "#contact-cta",
        media: null,
      },
    ],
  },
  routineProducts: {
    sectionId: "routine-products",
    eyebrow: "Complementa tu bienestar",
    title: "Lo esencial para tu hogar",
    description:
      "Productos naturales que no pueden faltar en tu día a día. Desde la cocina hasta el cuidado personal, la naturaleza tiene la respuesta.",
    cta: {
      label: "Ver todos los productos",
      href: "#editorial-guidance",
    },
    items: [
      {
        id: "routine-honey",
        name: "Miel para toda la familia",
        brand: "Eterna Vida",
        description: "Endulzante natural ideal para bebidas, recetas y consumo directo. Alternativa saludable al azúcar refinada.",
        href: "#contact-cta",
        badge: "Familiar",
        price: 12,
        discountPrice: null,
        category: {
          id: "productos-apicolas",
          slug: "productos-apicolas",
          name: "Productos apícolas",
          href: "#contact-cta",
        },
        media: null,
      },
      {
        id: "routine-coconut",
        name: "Aceite de coco multifuncional",
        brand: "Eterna Vida",
        description: "Uso culinario, hidratación de piel y cuidado capilar. Un solo producto, múltiples beneficios.",
        href: "#contact-cta",
        badge: "Multifuncional",
        price: 15,
        discountPrice: null,
        category: {
          id: "aceites-naturales",
          slug: "aceites-naturales",
          name: "Aceites naturales",
          href: "#contact-cta",
        },
        media: null,
      },
      {
        id: "routine-oregano",
        name: "Orégano para tus defensas",
        brand: "Eterna Vida",
        description: "Complemento natural tradicionalmente utilizado para el bienestar integral. Elaboración artesanal.",
        href: "#contact-cta",
        badge: "Bienestar",
        price: 18,
        discountPrice: null,
        category: {
          id: "aceites-naturales",
          slug: "aceites-naturales",
          name: "Aceites naturales",
          href: "#contact-cta",
        },
        media: null,
      },
    ],
  },
  editorial: {
    sectionId: "editorial-guidance",
    eyebrow: "Nuestra esencia",
    title: "Eterna Vida: naturaleza al servicio de tu bienestar",
    description:
      "Nacimos con una misión sencilla: acercar productos naturales y artesanales a las familias ecuatorianas. Desde nuestros primeros litros de miel hasta nuestra línea actual de productos.",
    accentText: "Desde 2019 cultivando bienestar",
    primaryCta: {
      label: "Conoce nuestra historia",
      href: "#trust-highlights",
    },
    secondaryCta: {
      label: "Ver productos",
      href: "#contact-cta",
    },
    media: null,
    items: [
      {
        id: "editorial-1",
        title: "Ingredientes naturales",
        description: "Seleccionamos cuidadosamente cada ingrediente para garantizar pureza y calidad en todos nuestros productos.",
      },
      {
        id: "editorial-2",
        title: "Procesos artesanales",
        description: "Cada producto pasa por procesos controlados que priorizan calidad sobre volumen. Elaboración con propósito.",
      },
      {
        id: "editorial-3",
        title: "Impacto social",
        description: "Las compras ayudan a generar oportunidades para madres solteras, jóvenes y personas con recursos limitados.",
      },
    ],
  },
  trustHighlights: {
    sectionId: "trust-highlights",
    eyebrow: "Por qué elegirnos",
    title: "Bienestar natural, confianza artesanal",
    description:
      "Combinamos la pureza de la naturaleza con procesos artesanales responsables. Cada producto refleja nuestro compromiso con la calidad, la comunidad y el medio ambiente.",
    items: [
      {
        id: "natural",
        title: "100% natural",
        description: "Ingredientes seleccionados y procesos artesanales que garantizan pureza y calidad.",
      },
      {
        id: "local",
        title: "Producción local",
        description: "Hecho en Loja, Ecuador. Apoyamos la economía local y la producción responsable.",
      },
      {
        id: "social",
        title: "Impacto social",
        description: "Cada compra genera oportunidades para madres solteras, jóvenes y personas con recursos limitados.",
      },
      {
        id: "environment",
        title: "Compromiso ambiental",
        description: "Producción responsable, agricultura natural y apicultura sostenible para cuidar el planeta.",
      },
    ],
  },
  cta: {
    sectionId: "contact-cta",
    eyebrow: "Empieza hoy",
    title: "Tu camino hacia el bienestar natural empieza aquí",
    description:
      "Descubre productos artesanales elaborados con ingredientes naturales. Compra ahora y recibe en todo Ecuador y Estados Unidos.",
    primaryCta: {
      label: "Comprar ahora",
      href: "#featured-products",
    },
    secondaryCta: {
      label: "Conoce nuestra historia",
      href: "#editorial-guidance",
    },
  },
};
