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
    slug: "aceites-naturales",
    name: "Aceites naturales",
    description: "Aceites vírgenes y esenciales para alimentación, cuidado personal y bienestar.",
    href: "#contact-cta",
  },
  {
    slug: "miel-y-derivados",
    name: "Miel y derivados",
    description: "Miel pura, vino de miel y productos derivados de colmenas propias.",
    href: "#contact-cta",
  },
  {
    slug: "suplementos",
    name: "Suplementos naturales",
    description: "Suplementos herbales y naturales para fortalecer tu salud de forma preventiva.",
    href: "#contact-cta",
  },
  {
    slug: "bienestar-general",
    name: "Bienestar general",
    description: "Productos para el bienestar integral: piel, cabello, digestión e inmunidad.",
    href: "#contact-cta",
  },
];

const productSeedData = [
  {
    slug: "aceite-coco-virgen",
    name: "Aceite de coco virgen",
    description: "Aceite de coco virgen multifuncional para alimentación, cuidado personal y bienestar. 100% natural, artesanal y sin aditivos. Desde la palma a tu mesa.",
    href: "#contact-cta",
    badge: "Destacado",
    badgeColor: "#1F8F6B",
    price: 13.0,
    discountPrice: null,
    stock: 45,
    productColor: "#4CAF50",
    preTitle: "Multifuncional",
    slogan: "Desde la palma a tu mesa. 100% natural, artesanal y multifuncional.",
    shortDescription: "Aceite de coco virgen para alimentación, piel y cabello. 100% natural y artesanal.",
    longDescription: "",
    brand: "Eterna Vida",
  },
  {
    slug: "aceite-oregano",
    name: "Aceite de orégano",
    description: "Suplemento natural de orégano orgánico para fortalecer el sistema inmune y promover el bienestar general. Pequeñas gotas, grandes defensas.",
    href: "#contact-cta",
    badge: "Natural",
    badgeColor: "#2F6FDE",
    price: 15.0,
    discountPrice: null,
    stock: 28,
    productColor: "#673AB7",
    preTitle: "Suplemento inmune",
    slogan: "Pequeñas gotas, grandes defensas.",
    shortDescription: "Suplemento natural de orégano orgánico para el sistema inmune.",
    longDescription: "",
    brand: "Eterna Vida",
  },
  {
    slug: "miel-abeja-pura",
    name: "Miel de abeja pura",
    description: "Miel pura de abeja proveniente de colmenas propias. Endulzante natural, artesanal y responsable. La dulzura que sana.",
    href: "#contact-cta",
    badge: "Artesanal",
    badgeColor: "#B7791F",
    price: 14.0,
    discountPrice: null,
    stock: 52,
    productColor: "#FF9800",
    preTitle: "Colmenas propias",
    slogan: "La dulzura que sana.",
    shortDescription: "Miel pura de abeja, endulzante natural de colmenas propias.",
    longDescription: "",
    brand: "Eterna Vida",
  },
  {
    slug: "vino-miel",
    name: "Vino de miel",
    description: "Vino artesanal elaborado con miel de abeja pura. Sabor único y natural, producción tradicional. Línea complementaria de nuestra miel.",
    href: "#contact-cta",
    badge: "Edición especial",
    badgeColor: "#8A5CF6",
    price: 18.0,
    discountPrice: null,
    stock: 20,
    productColor: "#7B1FA2",
    preTitle: "Línea complementaria",
    slogan: "El sabor de la tradición.",
    shortDescription: "Vino artesanal de miel pura, producción tradicional.",
    longDescription: "",
    brand: "Eterna Vida",
  },
];

// ── Product-specific seed data ──────────────────────────────────────────────

const productDetails = {
  "aceite-coco-virgen": {
    variants: [
      { name: "250ml", price: 13.0, discountPrice: null, stock: 45, sortOrder: 0 },
      { name: "500ml", price: 18.0, discountPrice: null, stock: 32, sortOrder: 1 },
      { name: "1000ml", price: 24.0, discountPrice: null, stock: 18, sortOrder: 2 },
    ],
    ingredients: [
      { name: "Coco orgánico", description: "Aceite extraído de coco fresco cultivado sin pesticidas.", sortOrder: 0 },
      { name: "Ácido láurico", description: "Ácido graso de cadena media con propiedades antimicrobianas.", sortOrder: 1 },
      { name: "Vitamina E", description: "Antioxidante natural que protege y nutre la piel.", sortOrder: 2 },
      { name: "Ácidos grasos de cadena media", description: "MCT que proporcionan energía rápida y apoyo metabólico.", sortOrder: 3 },
    ],
    benefits: [
      { text: "Alternativa a aceites procesados", iconKey: "leaf", sortOrder: 0 },
      { text: "Uso culinario saludable", iconKey: "check-circle", sortOrder: 1 },
      { text: "Hidratación para piel y cabello", iconKey: "droplet", sortOrder: 2 },
      { text: "Producción artesanal", iconKey: "award", sortOrder: 3 },
      { text: "Sin aditivos ni refinados", iconKey: "shield", sortOrder: 4 },
      { text: "Resultados visibles en 7 días", iconKey: "clock", sortOrder: 5 },
    ],
    usageSteps: [
      { stepNumber: 1, text: "Para cocinar: usa 1-2 cucharadas como sustituto de aceites procesados." },
      { stepNumber: 2, text: "Para piel: aplica una pequeña cantidad y masajea suavemente hasta absorción." },
      { stepNumber: 3, text: "Para cabello: aplica desde la mitad hasta las puntas, deja actuar 20 minutos y enjuaga." },
      { stepNumber: 4, text: "Para limpieza facial: aplica con un disco de algodón y retira con movimientos suaves." },
    ],
    trustBadges: [
      { text: "Envío gratis a todo el país", iconKey: "shield", sortOrder: 0 },
      { text: "Devolución sin costo en 30 días", iconKey: "check-circle", sortOrder: 1 },
      { text: "Producto 100% natural", iconKey: "leaf", sortOrder: 2 },
    ],
    certificateBadges: [
      { label: "100% Natural", iconKey: "leaf", sortOrder: 0 },
      { label: "Artesanal", iconKey: "award", sortOrder: 1 },
      { label: "Sin aditivos", iconKey: "shield", sortOrder: 2 },
    ],
  },
  "aceite-oregano": {
    variants: [
      { name: "30ml", price: 15.0, discountPrice: null, stock: 28, sortOrder: 0 },
      { name: "60ml", price: 22.0, discountPrice: null, stock: 15, sortOrder: 1 },
    ],
    ingredients: [
      { name: "Orégano orgánico", description: "Orégano cultivado de forma orgánica, rico en carvacrol.", sortOrder: 0 },
      { name: "Carvacrol", description: "Compuesto activo principal con propiedades antimicrobianas.", sortOrder: 1 },
      { name: "Timol", description: "Fenol natural con acción antioxidante y antiséptica.", sortOrder: 2 },
      { name: "Ácido rosmarínico", description: "Polifenol con efecto antiinflamatorio y protector celular.", sortOrder: 3 },
    ],
    benefits: [
      { text: "Apoyo al sistema inmunológico", iconKey: "shield", sortOrder: 0 },
      { text: "Uso para salud respiratoria", iconKey: "wind", sortOrder: 1 },
      { text: "Bienestar digestivo", iconKey: "heart", sortOrder: 2 },
      { text: "Producción artesanal", iconKey: "award", sortOrder: 3 },
      { text: "Orégano cultivado orgánicamente", iconKey: "leaf", sortOrder: 4 },
    ],
    usageSteps: [
      { stepNumber: 1, text: "Diluir 2-3 gotas en un vaso de agua o jugo y consumir antes de las comidas." },
      { stepNumber: 2, text: "Para uso aromático: agregar 3-4 gotas en un difusor para purificar el ambiente." },
      { stepNumber: 3, text: "Uso tópico: diluir con un aceite portador y aplicar en el pecho para bienestar respiratorio." },
    ],
    trustBadges: [
      { text: "Envío gratis a todo el país", iconKey: "shield", sortOrder: 0 },
      { text: "Devolución sin costo en 30 días", iconKey: "check-circle", sortOrder: 1 },
      { text: "Orégano 100% orgánico", iconKey: "leaf", sortOrder: 2 },
    ],
    certificateBadges: [
      { label: "Orgánico", iconKey: "leaf", sortOrder: 0 },
      { label: "Sistema inmune", iconKey: "shield", sortOrder: 1 },
      { label: "Artesanal", iconKey: "award", sortOrder: 2 },
    ],
  },
  "miel-abeja-pura": {
    variants: [
      { name: "250g", price: 14.0, discountPrice: null, stock: 52, sortOrder: 0 },
      { name: "500g", price: 19.0, discountPrice: null, stock: 38, sortOrder: 1 },
      { name: "1000g", price: 25.0, discountPrice: null, stock: 22, sortOrder: 2 },
    ],
    ingredients: [
      { name: "Miel de abeja pura", description: "Miel cruda extraída de colmenas propias sin procesamiento industrial.", sortOrder: 0 },
      { name: "Enzimas naturales", description: "Enzimas que favorecen la digestión y absorción de nutrientes.", sortOrder: 1 },
      { name: "Antioxidantes", description: "Flavonoides y compuestos fenólicos que combaten el estrés oxidativo.", sortOrder: 2 },
      { name: "Polen natural", description: "Micronutrientes esenciales: vitaminas, minerales y aminoácidos.", sortOrder: 3 },
    ],
    benefits: [
      { text: "Endulzante natural", iconKey: "sparkle", sortOrder: 0 },
      { text: "Producto artesanal", iconKey: "award", sortOrder: 1 },
      { text: "Producción responsable", iconKey: "leaf", sortOrder: 2 },
      { text: "Apoyo al sistema inmune", iconKey: "shield", sortOrder: 3 },
      { text: "Sustituto del azúcar refinada", iconKey: "heart", sortOrder: 4 },
    ],
    usageSteps: [
      { stepNumber: 1, text: "Endulzar bebidas calientes o frías: agregar 1-2 cucharadas al gusto." },
      { stepNumber: 2, text: "Untar en pan, tostadas o galletas como alternativa al azúcar." },
      { stepNumber: 3, text: "Mascarilla facial: aplicar una capa fina, dejar 15 minutos y enjuagar con agua tibia." },
      { stepNumber: 4, text: "Para alivio de garganta: disolver 1 cucharada en agua tibia con limón." },
    ],
    trustBadges: [
      { text: "Envío gratis a todo el país", iconKey: "shield", sortOrder: 0 },
      { text: "Devolución sin costo en 30 días", iconKey: "check-circle", sortOrder: 1 },
      { text: "Miel 100% pura", iconKey: "droplet", sortOrder: 2 },
    ],
    certificateBadges: [
      { label: "Pura", iconKey: "droplet", sortOrder: 0 },
      { label: "Artesanal", iconKey: "award", sortOrder: 1 },
      { label: "Natural", iconKey: "leaf", sortOrder: 2 },
    ],
  },
  "vino-miel": {
    variants: [
      { name: "375ml", price: 18.0, discountPrice: null, stock: 20, sortOrder: 0 },
      { name: "750ml", price: 24.0, discountPrice: null, stock: 12, sortOrder: 1 },
    ],
    ingredients: [
      { name: "Miel de abeja pura", description: "Miel de colmenas propias, base del proceso de fermentación.", sortOrder: 0 },
      { name: "Uvas seleccionadas", description: "Uvas de calidad seleccionadas para el blend del vino.", sortOrder: 1 },
      { name: "Levaduras naturales", description: "Levaduras que fermentan los azúcares de forma controlada.", sortOrder: 2 },
      { name: "Agua de manantial", description: "Agua pura de manantial para el proceso de elaboración.", sortOrder: 3 },
    ],
    benefits: [
      { text: "Sabor único y natural", iconKey: "sparkle", sortOrder: 0 },
      { text: "Producción artesanal", iconKey: "award", sortOrder: 1 },
      { text: "Línea complementaria de miel", iconKey: "heart", sortOrder: 2 },
      { text: "Elaboración tradicional", iconKey: "leaf", sortOrder: 3 },
    ],
    usageSteps: [
      { stepNumber: 1, text: "Servir frío entre 8-10°C para apreciar mejor sus notas aromáticas." },
      { stepNumber: 2, text: "Maridar con quesos suaves, frutas frescas o postres ligeros." },
      { stepNumber: 3, text: "Disfrutar con moderación como parte de una experiencia gourmet." },
    ],
    trustBadges: [
      { text: "Envío gratis a todo el país", iconKey: "shield", sortOrder: 0 },
      { text: "Devolución sin costo en 30 días", iconKey: "check-circle", sortOrder: 1 },
      { text: "Elaboración artesanal", iconKey: "award", sortOrder: 2 },
    ],
    certificateBadges: [
      { label: "Artesanal", iconKey: "award", sortOrder: 0 },
      { label: "Natural", iconKey: "leaf", sortOrder: 1 },
      { label: "Producción propia", iconKey: "flask", sortOrder: 2 },
    ],
  },
};

async function main() {
  // ── Badge presets ─────────────────────────────────────────────────────────
  await Promise.all(
    [
      { label: "Nuevo", color: "#1F8F6B", sortOrder: 0 },
      { label: "Oferta", color: "#D94F4F", sortOrder: 1 },
      { label: "Destacado", color: "#B7791F", sortOrder: 2 },
    ].map((preset) =>
      prisma.productBadgePreset.upsert({
        where: { label: preset.label },
        update: { color: preset.color, isActive: true, sortOrder: preset.sortOrder },
        create: { label: preset.label, color: preset.color, isActive: true, sortOrder: preset.sortOrder },
      }),
    ),
  );

  // ── Media assets (reuse hero images for gallery) ──────────────────────────
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

  const galleryMediaAssets = [heroMedia, heroSecondaryMedia, heroTertiaryMedia];

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all(
    categorySeedData.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name, description: category.description, href: category.href, isActive: true },
        create: { slug: category.slug, name: category.name, description: category.description, href: category.href, isActive: true },
      }),
    ),
  );

  // ── Delete ALL existing products and related data ─────────────────────────
  await prisma.productCertificateBadge.deleteMany({});
  await prisma.productPickupLocation.deleteMany({});
  await prisma.productTrustBadge.deleteMany({});
  await prisma.productUsageStep.deleteMany({});
  await prisma.productGalleryImage.deleteMany({});
  await prisma.productBenefit.deleteMany({});
  await prisma.productIngredient.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.restockAlert.deleteMany({});
  await prisma.product.deleteMany({});

  // ── Create products ───────────────────────────────────────────────────────
  const products = await Promise.all(
    productSeedData.map((product) =>
      prisma.product.create({
        data: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          href: product.href,
          badge: product.badge,
          badgeColor: product.badgeColor,
          price: product.price,
          discountPrice: product.discountPrice,
          discountPercent: 0,
          stock: product.stock,
          productColor: product.productColor ?? null,
          preTitle: product.preTitle ?? null,
          slogan: product.slogan ?? null,
          shortDescription: product.shortDescription ?? "",
          longDescription: product.longDescription ?? "",
          brand: product.brand,
          isActive: true,
          category: { connect: { id: categories[0].id } },
        },
      }),
    ),
  );

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

  // ── Seed rich data for each product ───────────────────────────────────────
  for (const product of products) {
    const details = productDetails[product.slug];
    if (!details) continue;

    // Variants
    await prisma.productVariant.createMany({
      data: details.variants.map((v) => ({
        productId: product.id,
        name: v.name,
        price: v.price,
        discountPrice: v.discountPrice,
        stock: v.stock,
        isActive: true,
        sortOrder: v.sortOrder,
      })),
    });

    // Ingredients
    await prisma.productIngredient.createMany({
      data: details.ingredients.map((ing) => ({
        productId: product.id,
        name: ing.name,
        description: ing.description,
        sortOrder: ing.sortOrder,
      })),
    });

    // Benefits
    await prisma.productBenefit.createMany({
      data: details.benefits.map((b) => ({
        productId: product.id,
        text: b.text,
        iconKey: b.iconKey,
        sortOrder: b.sortOrder,
      })),
    });

    // Gallery images (reuse hero media assets)
    await prisma.productGalleryImage.createMany({
      data: galleryMediaAssets.map((media, index) => ({
        productId: product.id,
        mediaAssetId: media.id,
        sortOrder: index,
      })),
    });

    // Usage steps
    await prisma.productUsageStep.createMany({
      data: details.usageSteps.map((s) => ({
        productId: product.id,
        stepNumber: s.stepNumber,
        text: s.text,
      })),
    });

    // Trust badges
    await prisma.productTrustBadge.createMany({
      data: details.trustBadges.map((tb) => ({
        productId: product.id,
        text: tb.text,
        iconKey: tb.iconKey,
        sortOrder: tb.sortOrder,
      })),
    });

    // Certificate badges
    await prisma.productCertificateBadge.createMany({
      data: details.certificateBadges.map((cb) => ({
        productId: product.id,
        label: cb.label,
        iconKey: cb.iconKey,
        sortOrder: cb.sortOrder,
      })),
    });

    // Pickup locations
    await prisma.productPickupLocation.createMany({
      data: pickupLocations.map((loc) => ({
        productId: product.id,
        pickupLocationId: loc.id,
      })),
    });
  }

  // ── Home page content ─────────────────────────────────────────────────────
  const homeContentData = {
    heroEyebrow: "Eterna Vida",
    heroTitle: "Productos naturales para tu bienestar.",
    heroSubtitle:
      "Aceites vírgenes, miel pura y suplementos artesanales directo de nuestras manos a tu mesa.",
    heroSupportingBadge: "100% natural, artesanal y multifuncional",
    heroPrimaryCtaText: "Explorar productos",
    heroPrimaryCtaHref: "#featured-products",
    heroSecondaryCtaText: "Conocer más",
    heroSecondaryCtaHref: "#contact-cta",
    heroMediaId: heroMedia.id,
    heroSecondaryMediaId: heroSecondaryMedia.id,
    heroTertiaryMediaId: heroTertiaryMedia.id,
    featuredCategoriesEyebrow: "Categorías",
    featuredCategoriesTitle: "Nuestros productos naturales.",
    featuredCategoriesDescription:
      "Aceites, mieles y suplementos elaborados con procesos artesanales y responsables.",
    featuredCategoriesItems: categories.slice(0, 3).map((category) => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      href: category.href,
    })),
    featuredProductsEyebrow: "Destacados",
    featuredProductsTitle: "Productos seleccionados para ti.",
    featuredProductsDescription:
      "Descubre nuestros productos más populares, elaborados con ingredientes naturales de la más alta calidad.",
    featuredProductsItems: productSeedData.slice(0, 3).map((product) => ({
      id: product.slug,
      name: product.name,
      description: product.shortDescription,
      href: product.href,
      ...(product.badge ? { badge: product.badge } : {}),
      ...(product.badgeColor ? { badgeColor: product.badgeColor } : {}),
    })),
    trustHighlightsEyebrow: "Confianza",
    trustHighlightsTitle: "Compromiso con la calidad.",
    trustHighlightsDescription:
      "Cada producto es elaborado con procesos artesanales, ingredientes naturales y producción responsable.",
    trustHighlightsItems: [
      {
        id: "natural",
        title: "100% Natural",
        description: "Todos nuestros productos son elaborados con ingredientes naturales sin aditivos artificiales.",
      },
      {
        id: "artesanal",
        title: "Producción artesanal",
        description: "Procesos tradicionales que preservan las propiedades naturales de cada ingrediente.",
      },
      {
        id: "responsable",
        title: "Producción responsable",
        description: "Compromiso con el medio ambiente y las comunidades que nos rodean.",
      },
    ],
    ctaEyebrow: "Contáctanos",
    ctaTitle: "¿Listo para cuidar tu bienestar de forma natural?",
    ctaDescription:
      "Escoge el producto que mejor se adapte a tus necesidades y recíbelo en la comodidad de tu hogar.",
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
      name: "Retiro en Tienda Eterna Vida",
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
    update: {
      name: "Transferencia bancaria",
      isActive: true,
      sortOrder: 0,
    },
    create: {
      name: "Transferencia bancaria",
      type: "bank_transfer",
      description: "Paga mediante transferencia y envía tu comprobante por WhatsApp.",
      instructions:
        "Banco: Tu Banco\nCuenta corriente: 0000000000\nBeneficiario: Eterna Vida\n\nEnvía tu comprobante de pago por WhatsApp al +593 99 999 9999 junto con tu número de pedido.",
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
    console.error("Failed to seed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
