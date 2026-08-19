/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, MediaAssetKind, ReviewStatus } = require("@prisma/client");
const {
  BRAND,
  categories: categorySeedData,
  products: productSeedData,
  trustBadgesDefault,
  certByCategory,
} = require("./seed-catalog");

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

// Imagen destacada compartida por todos los productos hasta tener fotos por SKU.
const productFeaturedAsset = {
  storageKey: "eternavida/catalogo/productos.png",
  publicUrl: "/media/productos.png",
  altText: "Línea de productos Eternavida",
  mimeType: "image/png",
};

/** Precio de lista = variante más barata. */
const basePrice = (product) =>
  product.variants.reduce((min, variant) => Math.min(min, variant.price), Infinity);

/** Stock del producto = suma del stock de sus variantes. */
const totalStock = (product) =>
  product.variants.reduce((sum, variant) => sum + variant.stock, 0);

async function main() {
  // ── Badge presets ─────────────────────────────────────────────────────────
  await Promise.all(
    [
      { label: "Nuevo", color: "#1F8F6B", sortOrder: 0 },
      { label: "Oferta", color: "#D94F4F", sortOrder: 1 },
      { label: "Destacado", color: "#B7791F", sortOrder: 2 },
      { label: "Origen", color: "#8A5CF6", sortOrder: 3 },
      { label: "Sin gluten", color: "#1F8F6B", sortOrder: 4 },
      { label: "Natural", color: "#2F6FDE", sortOrder: 5 },
      { label: "Edición especial", color: "#8A5CF6", sortOrder: 6 },
    ].map((preset) =>
      prisma.productBadgePreset.upsert({
        where: { label: preset.label },
        update: { color: preset.color, isActive: true, sortOrder: preset.sortOrder },
        create: { label: preset.label, color: preset.color, isActive: true, sortOrder: preset.sortOrder },
      }),
    ),
  );

  // ── Media assets ──────────────────────────────────────────────────────────
  const [heroMedia, heroSecondaryMedia, heroTertiaryMedia] = await Promise.all(
    heroSeedAssets.map((asset) =>
      prisma.mediaAsset.upsert({
        where: { storageKey: asset.storageKey },
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

  const productMedia = await prisma.mediaAsset.upsert({
    where: { storageKey: productFeaturedAsset.storageKey },
    update: {
      publicUrl: productFeaturedAsset.publicUrl,
      kind: MediaAssetKind.image,
      mimeType: productFeaturedAsset.mimeType,
      altText: productFeaturedAsset.altText,
    },
    create: {
      storageKey: productFeaturedAsset.storageKey,
      publicUrl: productFeaturedAsset.publicUrl,
      kind: MediaAssetKind.image,
      mimeType: productFeaturedAsset.mimeType,
      altText: productFeaturedAsset.altText,
    },
  });

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all(
    categorySeedData.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          href: `/categorias/${category.slug}`,
          mediaAssetId: productMedia.id,
          isActive: true,
        },
        create: {
          slug: category.slug,
          name: category.name,
          description: category.description,
          href: `/categorias/${category.slug}`,
          mediaAssetId: productMedia.id,
          isActive: true,
        },
      }),
    ),
  );

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const keptCategorySlugs = categorySeedData.map((category) => category.slug);

  // ── Purga de catálogo anterior (productos y categorías de demo) ────────────
  await prisma.productCertificateBadge.deleteMany({});
  await prisma.productPickupLocation.deleteMany({});
  await prisma.productTrustBadge.deleteMany({});
  await prisma.productUsageStep.deleteMany({});
  await prisma.productGalleryImage.deleteMany({});
  await prisma.productBenefit.deleteMany({});
  await prisma.productIngredient.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productCategoryAssignment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.restockAlert.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({ where: { slug: { notIn: keptCategorySlugs } } });

  // ── Productos ─────────────────────────────────────────────────────────────
  const products = [];
  for (const seed of productSeedData) {
    const category = categoryBySlug.get(seed.category);
    if (!category) throw new Error(`Categoría no encontrada: ${seed.category}`);

    const product = await prisma.product.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        shortDescription: seed.shortDescription,
        longDescription: seed.longDescription,
        preTitle: seed.preTitle ?? null,
        slogan: seed.slogan ?? null,
        href: `/productos/${seed.slug}`,
        badge: seed.badge ?? null,
        badgeColor: seed.badgeColor ?? null,
        price: basePrice(seed),
        discountPrice: null,
        discountPercent: 0,
        stock: totalStock(seed),
        productColor: seed.productColor ?? null,
        brand: BRAND,
        isActive: true,
        mediaAsset: { connect: { id: productMedia.id } },
        category: { connect: { id: category.id } },
      },
    });

    products.push({ record: product, seed, categoryId: category.id });
  }

  // ── Pickup locations ──────────────────────────────────────────────────────
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

  // ── Datos ricos por producto ──────────────────────────────────────────────
  for (const { record, seed, categoryId } of products) {
    const productId = record.id;

    // Asignación de categoría (relación many-to-many usada por el catálogo público)
    await prisma.productCategoryAssignment.create({
      data: { productId, categoryId, position: 0 },
    });

    // Presentaciones (producto variable)
    await prisma.productVariant.createMany({
      data: seed.variants.map((variant) => ({
        productId,
        name: variant.name,
        price: variant.price,
        discountPrice: variant.discountPrice,
        stock: variant.stock,
        mediaAssetId: productMedia.id,
        isActive: true,
        sortOrder: variant.sortOrder,
      })),
    });

    // Tab "Ingredientes clave"
    await prisma.productIngredient.createMany({
      data: seed.ingredients.map((item) => ({
        productId,
        name: item.name,
        description: item.description,
        sortOrder: item.sortOrder,
      })),
    });

    // Tab "Detalles del producto" — beneficios
    await prisma.productBenefit.createMany({
      data: seed.benefits.map((item) => ({
        productId,
        text: item.text,
        iconKey: item.iconKey,
        sortOrder: item.sortOrder,
      })),
    });

    // Galería
    await prisma.productGalleryImage.create({
      data: { productId, mediaAssetId: productMedia.id, sortOrder: 0 },
    });

    // Tab "Modo de uso"
    await prisma.productUsageStep.createMany({
      data: seed.usageSteps.map((step) => ({
        productId,
        stepNumber: step.stepNumber,
        text: step.text,
      })),
    });

    // Tab "Reseñas de clientes"
    await prisma.review.createMany({
      data: seed.reviews.map((review) => ({
        productId,
        clerkUserId: review.clerkUserId,
        rating: review.rating,
        title: review.title,
        body: review.body,
        isVerifiedPurchase: true,
        status: ReviewStatus.approved,
      })),
    });

    await prisma.productTrustBadge.createMany({
      data: trustBadgesDefault.map((badge) => ({
        productId,
        text: badge.text,
        iconKey: badge.iconKey,
        sortOrder: badge.sortOrder,
      })),
    });

    await prisma.productCertificateBadge.createMany({
      data: (certByCategory[seed.category] ?? []).map((badge) => ({
        productId,
        label: badge.label,
        iconKey: badge.iconKey,
        sortOrder: badge.sortOrder,
      })),
    });

    await prisma.productPickupLocation.createMany({
      data: pickupLocations.map((loc) => ({ productId, pickupLocationId: loc.id })),
    });
  }

  // ── Home page content ─────────────────────────────────────────────────────
  const featuredCategorySlugs = [
    "productos-de-la-colmena",
    "cacao-de-palanda",
    "aceites-vegetales",
  ];
  const featuredProductSlugs = ["miel-de-abeja", "aceite-de-coco", "cacao-en-polvo"];

  const featuredCategories = featuredCategorySlugs.map((slug) => categoryBySlug.get(slug));
  const featuredProducts = featuredProductSlugs.map((slug) =>
    products.find((entry) => entry.seed.slug === slug),
  );

  const homeContentData = {
    heroEyebrow: "Eternavida",
    heroTitle: "Ciencia, naturaleza y tecnología desde el origen.",
    heroSubtitle:
      "Miel, cacao de Palanda, aceites prensados en frío, esenciales destilados y snacks deshidratados. Del origen al proceso, del proceso al producto.",
    heroSupportingBadge: "Cultivando bienestar",
    heroPrimaryCtaText: "Explorar productos",
    heroPrimaryCtaHref: "/productos",
    heroSecondaryCtaText: "Conocer nuestros procesos",
    heroSecondaryCtaHref: "/nosotros",
    heroMediaId: heroMedia.id,
    heroSecondaryMediaId: heroSecondaryMedia.id,
    heroTertiaryMediaId: heroTertiaryMedia.id,
    featuredCategoriesEyebrow: "Categorías",
    featuredCategoriesTitle: "Ocho líneas, una misma filosofía.",
    featuredCategoriesDescription:
      "Diferentes materias primas. Diferentes procesos. Conocer lo que procesamos para entender lo que producimos.",
    featuredCategoriesItems: featuredCategories.map((category) => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      href: `/categorias/${category.slug}`,
    })),
    featuredProductsEyebrow: "Destacados",
    featuredProductsTitle: "Del origen a tus manos.",
    featuredProductsDescription:
      "Colmenas, frutas, semillas, plantas, mar y cacao transformados con procesos controlados.",
    featuredProductsItems: featuredProducts.map(({ seed }) => ({
      id: seed.slug,
      name: seed.name,
      description: seed.shortDescription,
      href: `/productos/${seed.slug}`,
      ...(seed.badge ? { badge: seed.badge } : {}),
      ...(seed.badgeColor ? { badgeColor: seed.badgeColor } : {}),
    })),
    trustHighlightsEyebrow: "Nuestra forma de hacer las cosas",
    trustHighlightsTitle: "Naturaleza como origen. Ciencia como herramienta.",
    trustHighlightsDescription:
      "Seleccionamos el origen. Estudiamos la materia prima. Definimos el proceso. Controlamos las variables. Transformamos.",
    trustHighlightsItems: [
      {
        id: "origen",
        title: "Origen trazable",
        description:
          "Colmenas, cultivos y cacao de Palanda seleccionados antes de iniciar cualquier transformación.",
      },
      {
        id: "proceso",
        title: "Procesos controlados",
        description:
          "Centrifugación, deshidratación, fermentación, prensado en frío, destilación, molienda, refinado y encapsulado.",
      },
      {
        id: "producto",
        title: "Producto sin atajos",
        description:
          "Sin aditivos innecesarios. Cada etapa responde a las características particulares de la materia prima.",
      },
    ],
    ctaEyebrow: "Contáctanos",
    ctaTitle: "¿Listo para llevar el origen a tu mesa?",
    ctaDescription:
      "Escoge la presentación que mejor se adapte a ti y recíbela en la comodidad de tu hogar.",
    ctaPrimaryCtaText: "Ver productos",
    ctaPrimaryCtaHref: "/productos",
    ctaSecondaryCtaText: "WhatsApp",
    ctaSecondaryCtaHref: "https://wa.me/593999999999",
  };

  const homeRecord = await prisma.homePageContent.upsert({
    where: { slug: "home" },
    update: homeContentData,
    create: { slug: "home", ...homeContentData },
  });

  await prisma.homeFeaturedCategory.deleteMany({ where: { homePageContentId: homeRecord.id } });
  await prisma.homeFeaturedProduct.deleteMany({ where: { homePageContentId: homeRecord.id } });

  await prisma.homeFeaturedCategory.createMany({
    data: featuredCategories.map((category, index) => ({
      homePageContentId: homeRecord.id,
      categoryId: category.id,
      position: index,
    })),
  });

  await prisma.homeFeaturedProduct.createMany({
    data: featuredProducts.map(({ record }, index) => ({
      homePageContentId: homeRecord.id,
      productId: record.id,
      position: index,
    })),
  });

  // ── Shipping methods ──────────────────────────────────────────────────────
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
      name: "Retiro en Tienda Eternavida",
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

  // ── Payment methods ───────────────────────────────────────────────────────
  await prisma.paymentMethod.upsert({
    where: { type: "bank_transfer" },
    update: { name: "Transferencia bancaria", isActive: true, sortOrder: 0 },
    create: {
      name: "Transferencia bancaria",
      type: "bank_transfer",
      description: "Paga mediante transferencia y envía tu comprobante por WhatsApp.",
      instructions:
        "Banco: Tu Banco\nCuenta corriente: 0000000000\nBeneficiario: Eternavida\n\nEnvía tu comprobante de pago por WhatsApp al +593 99 999 9999 junto con tu número de pedido.",
      isActive: true,
      sortOrder: 0,
    },
  });

  console.log(
    `Seed completo: ${categories.length} categorías, ${products.length} productos, ` +
      `${productSeedData.reduce((n, p) => n + p.variants.length, 0)} presentaciones, ` +
      `${productSeedData.reduce((n, p) => n + p.reviews.length, 0)} reseñas.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
