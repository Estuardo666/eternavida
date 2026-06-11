/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, MediaAssetKind } = require("@prisma/client");

const prisma = new PrismaClient();

const heroSeedAssets = [
  {
    storageKey: "Dermatologika/Uploads/qa-20260331132733-banner_hero-1.webp",
    publicUrl:
      "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/Dermatologika/Uploads/qa-20260331132733-banner_hero-1.webp",
    altText: "Primary hero slide for Dermatologika home",
  },
  {
    storageKey: "Dermatologika/Uploads/qa-20260331132733-banner_hero-2.webp",
    publicUrl:
      "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/Dermatologika/Uploads/qa-20260331132733-banner_hero-2.webp",
    altText: "Secondary hero slide for Dermatologika home",
  },
  {
    storageKey: "Dermatologika/Uploads/qa-20260331132733-banner_hero-3.webp",
    publicUrl:
      "https://pub-cc734373dc1544418e5ba00681e8514f.r2.dev/Dermatologika/Uploads/qa-20260331132733-banner_hero-3.webp",
    altText: "Tertiary hero slide for Dermatologika home",
  },
];

const categorySeedData = [
  {
    slug: "cleansers",
    name: "Limpieza clínica",
    description: "Rutinas de limpieza suave para piel sensible, grasa o sensibilizada.",
    href: "#contact-cta",
  },
  {
    slug: "barrier-support",
    name: "Reparación de barrera",
    description: "Fórmulas orientadas a confort, equilibrio y recuperación visible.",
    href: "#contact-cta",
  },
  {
    slug: "daily-protection",
    name: "Protección diaria",
    description: "Protección y mantenimiento diario dentro de una rutina constante.",
    href: "#contact-cta",
  },
  {
    slug: "post-procedure",
    name: "Cuidado post procedimiento",
    description: "Categoría preparada para expandir el storefront por necesidad clínica o contexto de uso.",
    href: "#contact-cta",
  },
];

const productSeedData = [
  {
    slug: "product-clarity",
    name: "Rutina de claridad diaria",
    description: "Selección destacada con prioridad comercial y estructura lista para merchandising real.",
    href: "#contact-cta",
    badge: "Destacado",
    badgeColor: "#B7791F",
    price: 34.9,
    discountPrice: 29.9,
    stock: 5,
    productColor: "#4CAF50",
    preTitle: "Nuevo lanzamiento",
    slogan: "Tu piel merece lo mejor",
    shortDescription: "Rutina de claridad con vitamina C e hialuronico para una piel luminosa.",
    longDescription: "<p>Esta rutina de claridad combina los mejores activos para una piel radiante.</p><ul><li><strong>Vitamina C</strong> - Ilumina y protege</li><li><strong>Acido hialuronico</strong> - Hidratacion profunda</li><li><strong>Niacinamida</strong> - Unifica tono</li></ul>",
  },
  {
    slug: "product-balance",
    name: "Balance hidratante",
    description: "Producto preparado para ficha breve, badge comercial y media administrable.",
    href: "#contact-cta",
    badge: "Más consultado",
    badgeColor: "#2F6FDE",
    price: 26.5,
    discountPrice: 22.5,
    stock: 5,
    productColor: "#2196F3",
  },
  {
    slug: "product-renewal",
    name: "Renovación nocturna",
    description: "Entrada de catálogo pensada para campañas de cuidado nocturno o renovación.",
    href: "#contact-cta",
    badge: null,
    badgeColor: null,
    price: 41.0,
    discountPrice: null,
    stock: 0,
    productColor: "#673AB7",
  },
  {
    slug: "routine-recovery",
    name: "Recuperación y confort",
    description: "Apoyo para continuidad de rutina y recuperación visible.",
    href: "#contact-cta",
    badge: "Rutina guiada",
    badgeColor: "#1F8F6B",
    price: 37.0,
    discountPrice: null,
    stock: 1,
    productColor: "#FF9800",
  },
  {
    slug: "routine-defense",
    name: "Defensa diaria",
    description: "Selección de soporte diario lista para reposición o recomendación recurrente.",
    href: "#contact-cta",
    badge: "Reposición",
    badgeColor: "#8A5CF6",
    price: 31.5,
    discountPrice: null,
    stock: 42,
    productColor: "#E91E63",
  },
  {
    slug: "routine-night",
    name: "Soporte nocturno",
    description: "Producto de continuidad preparado para el segundo shelf editorial.",
    href: "#contact-cta",
    badge: "Noche",
    badgeColor: "#324C7A",
    price: 45.0,
    discountPrice: null,
    stock: 17,
    productColor: "#3F51B5",
  },
];

async function main() {
  await Promise.all(
    [
      { label: "Nuevo", color: "#1F8F6B", sortOrder: 0 },
      { label: "Oferta", color: "#D94F4F", sortOrder: 1 },
      { label: "Destacado", color: "#B7791F", sortOrder: 2 },
    ].map((preset) =>
      prisma.productBadgePreset.upsert({
        where: {
          label: preset.label,
        },
        update: {
          color: preset.color,
          isActive: true,
          sortOrder: preset.sortOrder,
        },
        create: {
          label: preset.label,
          color: preset.color,
          isActive: true,
          sortOrder: preset.sortOrder,
        },
      }),
    ),
  );

  const [heroMedia, heroSecondaryMedia, heroTertiaryMedia] = await Promise.all(
    heroSeedAssets.map((asset) =>
      prisma.mediaAsset.upsert({
        where: {
          storageKey: asset.storageKey,
        },
        update: {
          publicUrl: asset.publicUrl,
          kind: MediaAssetKind.image,
          mimeType: "image/webp",
          altText: asset.altText,
        },
        create: {
          storageKey: asset.storageKey,
          publicUrl: asset.publicUrl,
          kind: MediaAssetKind.image,
          mimeType: "image/webp",
          altText: asset.altText,
        },
      }),
    ),
  );

  const [categories, products] = await Promise.all([
    Promise.all(
      categorySeedData.map((category) =>
        prisma.category.upsert({
          where: {
            slug: category.slug,
          },
          update: {
            name: category.name,
            description: category.description,
            href: category.href,
            isActive: true,
          },
          create: {
            slug: category.slug,
            name: category.name,
            description: category.description,
            href: category.href,
            isActive: true,
          },
        }),
      ),
    ),
    Promise.all(
      productSeedData.map((product) =>
        prisma.product.upsert({
          where: {
            slug: product.slug,
          },
          update: {
            name: product.name,
            description: product.description,
            href: product.href,
            badge: product.badge,
            badgeColor: product.badgeColor,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            productColor: product.productColor ?? null,
            preTitle: product.preTitle ?? null,
            slogan: product.slogan ?? null,
            shortDescription: product.shortDescription ?? "",
            longDescription: product.longDescription ?? "",
            isActive: true,
          },
          create: {
            slug: product.slug,
            name: product.name,
            description: product.description,
            href: product.href,
            badge: product.badge,
            badgeColor: product.badgeColor,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            productColor: product.productColor ?? null,
            preTitle: product.preTitle ?? null,
            slogan: product.slogan ?? null,
            shortDescription: product.shortDescription ?? "",
            longDescription: product.longDescription ?? "",
            isActive: true,
          },
        }),
      ),
    ),
  ]);

  // ── Seed variants, ingredients, benefits for first product ──────────────
  const clarityProduct = products[0];
  if (clarityProduct) {
    // Variants
    await prisma.productVariant.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productVariant.createMany({
      data: [
        { productId: clarityProduct.id, name: "30ml", price: 34.9, discountPrice: 29.9, stock: 5, isActive: true, sortOrder: 0 },
        { productId: clarityProduct.id, name: "60ml", price: 54.9, discountPrice: 44.9, stock: 3, isActive: true, sortOrder: 1 },
        { productId: clarityProduct.id, name: "100ml", price: 79.9, discountPrice: null, stock: 0, isActive: false, sortOrder: 2 },
      ],
    });

    // Ingredients
    await prisma.productIngredient.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productIngredient.createMany({
      data: [
        { productId: clarityProduct.id, name: "Vitamina C", description: "Antioxidante potente que ilumina y protege contra radicales libres.", sortOrder: 0 },
        { productId: clarityProduct.id, name: "Acido hialuronico", description: "Hidratacion profunda que retiene hasta 1000 veces su peso en agua.", sortOrder: 1 },
        { productId: clarityProduct.id, name: "Niacinamida", description: "Minimiza poros y mejora la textura uniforme de la piel.", sortOrder: 2 },
        { productId: clarityProduct.id, name: "Extracto de te verde", description: "Antiinflamatorio natural con propiedades calmantes.", sortOrder: 3 },
      ],
    });

    // Benefits
    await prisma.productBenefit.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productBenefit.createMany({
      data: [
        { productId: clarityProduct.id, text: "Ilumina y unifica el tono de la piel", iconKey: "sparkle", sortOrder: 0 },
        { productId: clarityProduct.id, text: "Hidratacion profunda 24h", iconKey: "droplet", sortOrder: 1 },
        { productId: clarityProduct.id, text: "Proteccion antioxidante contra radicales libres", iconKey: "shield", sortOrder: 2 },
        { productId: clarityProduct.id, text: "Formula dermatologicamente testada", iconKey: "flask", sortOrder: 3 },
        { productId: clarityProduct.id, text: "Ingredientes 100% naturales", iconKey: "leaf", sortOrder: 4 },
        { productId: clarityProduct.id, text: "Resultados visibles en 7 dias", iconKey: "clock", sortOrder: 5 },
      ],
    });
  }

  // ── Seed pickup locations ─────────────────────────────────────────────────
  const pickupLocations = await Promise.all(
    [
      { name: "Sucursal Centro", address: "Av. Principal 123, Centro", directionsUrl: "https://maps.google.com/?q=Av+Principal+123", sortOrder: 0 },
      { name: "Sucursal Norte", address: "Calle Norte 456, Plaza Mayor", directionsUrl: "https://maps.google.com/?q=Calle+Norte+456", sortOrder: 1 },
    ].map((loc) =>
      prisma.pickupLocation.upsert({
        where: { id: "pickup-" + loc.name.toLowerCase().replace(/\s+/g, "-") },
        update: { ...loc },
        create: { id: "pickup-" + loc.name.toLowerCase().replace(/\s+/g, "-"), ...loc },
      }),
    ),
  );

  if (clarityProduct && pickupLocations.length > 0) {
    await prisma.productPickupLocation.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productPickupLocation.createMany({
      data: pickupLocations.map((loc) => ({
        productId: clarityProduct.id,
        pickupLocationId: loc.id,
      })),
    });
  }

  // Usage steps
  if (clarityProduct) {
    await prisma.productUsageStep.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productUsageStep.createMany({
      data: [
        { productId: clarityProduct.id, stepNumber: 1, text: "Limpia tu rostro con un limpiador suave y seca con toques suaves." },
        { productId: clarityProduct.id, stepNumber: 2, text: "Aplica 3-4 gotas del serum sobre el rostro y cuello, distribuyendo de forma uniforme." },
        { productId: clarityProduct.id, stepNumber: 3, text: "Masajea con movimientos circulares ascendentes hasta su completa absorcion." },
        { productId: clarityProduct.id, stepNumber: 4, text: "Usa protector solar SPF 30+ durante el dia para proteger los resultados." },
      ],
    });

    // Trust badges
    await prisma.productTrustBadge.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productTrustBadge.createMany({
      data: [
        { productId: clarityProduct.id, text: "Envio gratis a todo el pais", iconKey: "shield", sortOrder: 0 },
        { productId: clarityProduct.id, text: "Devolucion sin costo en 30 dias", iconKey: "check-circle", sortOrder: 1 },
        { productId: clarityProduct.id, text: "Producto 100% original", iconKey: "award", sortOrder: 2 },
      ],
    });

    // Gallery images (reuse hero media assets)
    await prisma.productGalleryImage.deleteMany({ where: { productId: clarityProduct.id } });
    await prisma.productGalleryImage.createMany({
      data: [
        { productId: clarityProduct.id, mediaAssetId: heroMedia.id, sortOrder: 0 },
        { productId: clarityProduct.id, mediaAssetId: heroSecondaryMedia.id, sortOrder: 1 },
        { productId: clarityProduct.id, mediaAssetId: heroTertiaryMedia.id, sortOrder: 2 },
      ],
    });
  }

  // Add variants to second product too
  const balanceProduct = products[1];
  if (balanceProduct) {
    await prisma.productVariant.deleteMany({ where: { productId: balanceProduct.id } });
    await prisma.productVariant.createMany({
      data: [
        { productId: balanceProduct.id, name: "50ml", price: 26.5, discountPrice: 22.5, stock: 5, isActive: true, sortOrder: 0 },
        { productId: balanceProduct.id, name: "100ml", price: 42.0, discountPrice: null, stock: 8, isActive: true, sortOrder: 1 },
      ],
    });

    await prisma.productBenefit.deleteMany({ where: { productId: balanceProduct.id } });
    await prisma.productBenefit.createMany({
      data: [
        { productId: balanceProduct.id, text: "Hidratacion equilibrada para todo tipo de piel", iconKey: "droplet", sortOrder: 0 },
        { productId: balanceProduct.id, text: "Textura ligera no grasa", iconKey: "feather", sortOrder: 1 },
        { productId: balanceProduct.id, text: "Refrescante y calmante", iconKey: "wind", sortOrder: 2 },
      ],
    });
  }

  const homeContentData = {
    heroEyebrow: "Dermatología curada",
    heroTitle: "Skincare clínico con una experiencia pública preparada para crecer.",
    heroSubtitle:
      "La base pública de Dermatologika ya separa contenido editable, media administrable y presentación reusable para escalar sin rehacer la Home.",
    heroSupportingBadge: "Contenido comercial desacoplado de la UI",
    heroPrimaryCtaText: "Explorar categorías",
    heroPrimaryCtaHref: "#featured-categories",
    heroSecondaryCtaText: "Ver destacados",
    heroSecondaryCtaHref: "#featured-products",
    heroMediaId: heroMedia.id,
    heroSecondaryMediaId: heroSecondaryMedia.id,
    heroTertiaryMediaId: heroTertiaryMedia.id,
    featuredCategoriesEyebrow: "Categorías destacadas",
    featuredCategoriesTitle: "Bloques de catálogo listos para conectarse con backend.",
    featuredCategoriesDescription:
      "Cada categoría ya consume un contrato tipado con nombre, resumen, destino y media administrable desde storage o base de datos.",
    featuredCategoriesItems: categorySeedData.slice(0, 3).map((category) => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      href: category.href,
    })),
    featuredProductsEyebrow: "Selección inicial",
    featuredProductsTitle: "Productos destacados sin acoplar la Home al catálogo final.",
    featuredProductsDescription:
      "La sección queda lista para reemplazar el fallback por productos reales sincronizados desde backend manteniendo el mismo contrato visual.",
    featuredProductsItems: productSeedData.slice(0, 3).map((product) => ({
      id: product.slug,
      name: product.name,
      description: product.description,
      href: product.href,
      ...(product.badge ? { badge: product.badge } : {}),
      ...(product.badgeColor ? { badgeColor: product.badgeColor } : {}),
    })),
    trustHighlightsEyebrow: "Confianza y método",
    trustHighlightsTitle: "Una base pública pensada para claridad médica, orden y evolución.",
    trustHighlightsDescription:
      "La primera versión ya prioriza estructura semántica, escalabilidad visual y separación correcta entre contenido, media y renderizado.",
    trustHighlightsItems: [
      {
        id: "typed-content",
        title: "Contenido tipado",
        description: "Textos comerciales y CTA salen de un contrato central que luego podrá persistirse en base de datos.",
      },
      {
        id: "media-ready",
        title: "Media administrable",
        description: "Los tres slides del hero y otros assets quedan preparados para resolverse desde base de datos y storage sin tocar la UI.",
      },
      {
        id: "server-boundary",
        title: "Lectura server-side",
        description: "La Home obtiene el contenido desde servicios y server modules, no desde hardcode disperso en componentes.",
      },
    ],
    ctaEyebrow: "Siguiente fase",
    ctaTitle: "Listo para conectar categorías, productos y páginas públicas reales.",
    ctaDescription:
      "Esta base ya soporta ampliar About, Contact, banners, media administrable y contenido comercial editable sin rehacer el storefront.",
    ctaPrimaryCtaText: "Preparar siguientes módulos",
    ctaPrimaryCtaHref: "#featured-categories",
    ctaSecondaryCtaText: "Acceso administración",
    ctaSecondaryCtaHref: "/admin/login",
  };

  const homeRecord = await prisma.homePageContent.upsert({
    where: {
      slug: "home",
    },
    update: homeContentData,
    create: {
      slug: "home",
      ...homeContentData,
    },
  });

  await prisma.homeFeaturedCategory.deleteMany({
    where: {
      homePageContentId: homeRecord.id,
    },
  });

  await prisma.homeFeaturedProduct.deleteMany({
    where: {
      homePageContentId: homeRecord.id,
    },
  });

  await prisma.homeFeaturedCategory.createMany({
    data: categories.slice(0, 3).map((category, index) => ({
      homePageContentId: homeRecord.id,
      categoryId: category.id,
      position: index,
    })),
  });

  await prisma.homeFeaturedProduct.createMany({
    data: products.slice(0, 3).map((product, index) => ({
      homePageContentId: homeRecord.id,
      productId: product.id,
      position: index,
    })),
  });

  // ── Shipping methods ────────────────────────────────────────────────────
  const shippingMethodsData = [
    {
      name: "Envío a domicilio",
      type: "standard",
      price: 6.0,
      estimatedDays: "1 a 2 días hábiles",
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "Retiro en Tienda Dermatológika",
      type: "pickup",
      price: 0.0,
      estimatedDays: "Coordinamos por WhatsApp",
      isActive: true,
      sortOrder: 1,
    },
  ];

  for (const sm of shippingMethodsData) {
    await prisma.shippingMethod.upsert({
      where: { type: sm.type },
      update: { name: sm.name, price: sm.price, estimatedDays: sm.estimatedDays, isActive: sm.isActive, sortOrder: sm.sortOrder },
      create: sm,
    });
  }

  // ── Payment methods ─────────────────────────────────────────────────────
  await prisma.paymentMethod.upsert({
    where: { type: "bank_transfer" },
    update: {
      name: "Transferencia bancaria",
      isActive: true,
      sortOrder: 0,
    },
    create: {
      name: "Transferencia bancaria",
      type: "bank_transfer",
      description: "Paga mediante transferencia y enviá tu comprobante por WhatsApp.",
      instructions:
        "Banco: Tu Banco\nCuenta corriente: 0000000000\nBeneficiario: Dermatologika\n\nEnvía tu comprobante de pago por WhatsApp al +593 99 999 9999 junto con tu número de pedido.",
      isActive: true,
      sortOrder: 0,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed public home content", error);
    await prisma.$disconnect();
    process.exit(1);
  });
