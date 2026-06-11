"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronRight, Store } from "lucide-react";

import { ProductBadge } from "@/components/ui/product-badge";
import { AccordionSection } from "@/components/ui/accordion-section";
import { useCart } from "@/features/cart/context/cart-context";
import { motionTokens } from "@/motion/tokens";
import type { PublicProductDetailData, PublicProductVariantSummary } from "@/types/public-catalog";

import { PublicProductCarousel } from "./public-product-carousel";
import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";
import { RestockAlertForm } from "./restock-alert-form";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductCertificateBadges } from "./product-certificate-badges";
import { BenefitCardScroll } from "./benefit-card-scroll";
import { PickupLocationDrawer } from "./pickup-location-drawer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { duration, ease, distance } = motionTokens;

const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

type StockStatus = { label: string; textColor: string };

function deriveStockStatus(stock: number): StockStatus {
  if (stock === 0) return { label: "Sin stock", textColor: "text-status-error" };
  if (stock <= 5) return { label: "Últimas unidades", textColor: "text-status-warning" };
  return { label: "EN STOCK", textColor: "text-status-success" };
}

// ─── Framer Motion variants ──────────────────────────────────────────────────

const sectionFadeUp: Variants = {
  initial: { opacity: 0, y: distance.lg },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.page, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageReveal: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.slow, ease: [0.22, 1, 0.36, 1] },
  },
};

const cartIdleVariants: Variants = {
  initial: { opacity: 0, y: 7, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.base, ease: ease.soft },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.97,
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

const cartAddedVariants: Variants = {
  initial: { opacity: 0, scale: 0.88, y: 6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.soft },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

// ─── Section wrapper with motion ──────────────────────────────────────────────

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      variants={reduceMotion ? {} : sectionFadeUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.15 }}
      {...(delay ? { transition: { delay } } : {})}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PublicProductDetailViewProps {
  data: PublicProductDetailData;
}

export function PublicProductDetailView({ data }: PublicProductDetailViewProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { product, brandProducts, recommendedProducts, reviewAggregate, variants, ingredients, benefits, galleryImages, certificateBadges, pickupLocations, usageSteps } = data;

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState<"idle" | "added">("idle");
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PublicProductVariantSummary | null>(
    variants.length > 0 ? (variants[0] ?? null) : null,
  );
  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
  const effectiveDiscountPrice = selectedVariant
    ? selectedVariant.discountPrice
    : product.discountPrice;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;

  const hasPrice = typeof effectivePrice === "number" && effectivePrice > 0;
  const hasDiscount =
    hasPrice &&
    effectiveDiscountPrice !== null &&
    effectiveDiscountPrice < effectivePrice;
  const displayPrice =
    hasDiscount && effectiveDiscountPrice !== null
      ? effectiveDiscountPrice
      : hasPrice
        ? effectivePrice
        : null;
  const discountPercent =
    hasDiscount && effectiveDiscountPrice !== null
      ? Math.round(((effectivePrice - effectiveDiscountPrice) / effectivePrice) * 100)
      : null;

  const outOfStock = effectiveStock === 0;
  const stockStatus = deriveStockStatus(effectiveStock);

  const gradientBg = product.productColor
    ? `linear-gradient(135deg, ${product.productColor}18, #FFF8F0 60%)`
    : undefined;

  const handleAddToCart = useCallback(() => {
    if (cartState !== "idle" || outOfStock) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([12, 60, 18]);
    }
    const variantLabel = selectedVariant ? ` - ${selectedVariant.name}` : "";
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: selectedVariant ? `${product.id}__${selectedVariant.id}` : product.id,
        name: `${product.name}${variantLabel}`,
        brand: product.brand,
        href: product.href,
        price: effectivePrice,
        discountPrice: effectiveDiscountPrice,
        imageUrl: product.media?.url ?? null,
        imageAlt: product.media?.altText?.trim() || product.name,
      });
    }
    setCartState("added");
    cartTimerRef.current = setTimeout(() => setCartState("idle"), 2200);
  }, [cartState, outOfStock, addItem, product, quantity, selectedVariant, effectivePrice, effectiveDiscountPrice]);

  useEffect(() => {
    return () => {
      if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
    };
  }, []);

  return (
    <div
      className="overflow-x-hidden py-10 sm:py-14"
      style={gradientBg ? { background: gradientBg } : undefined}
    >
      <div className="container space-y-16">

        {/* ── Product layout ──────────────────────────────────────────────── */}
        <section
          aria-label="Detalle del producto"
          className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-start"
        >
          {/* Left: image gallery (sticky) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <motion.div
              variants={reduceMotion ? {} : imageReveal}
              initial="initial"
              animate="animate"
            >
              <ProductImageGallery
                primaryImage={product.media}
                galleryImages={galleryImages}
                productName={product.name}
              />
            </motion.div>

            <ProductCertificateBadges badges={certificateBadges} />
          </div>

          {/* Right: info panel */}
          <AnimatedSection>
            <div className="flex min-w-0 flex-col gap-5">

              {/* Breadcrumbs + Stock status */}
              <div className="flex items-start justify-between gap-3">
                <nav aria-label="Breadcrumb" className="min-w-0 text-body-sm text-text-secondary">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li>
                      <Link href="/" className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                        Inicio
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link href="/productos" className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                        Productos
                      </Link>
                    </li>
                    {product.category ? (
                      <>
                        <li aria-hidden="true">/</li>
                        <li aria-current="page">
                          <Link href={product.category.href} className="transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                            {product.category.name}
                          </Link>
                        </li>
                      </>
                    ) : null}
                  </ol>
                </nav>
                <div className="flex shrink-0 items-center gap-1.5 opacity-75">
                  {effectiveStock > 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 ${stockStatus.textColor}`} aria-hidden="true">
                      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                  )}
                  <span className={`text-body-sm font-medium ${stockStatus.textColor}`}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              {/* Badge */}
              {product.badge ? (
                <div>
                  <ProductBadge
                    label={product.badge}
                    color={product.badgeColor}
                    className="rounded-pill border px-2.5 py-0.5 text-[0.68rem]"
                  />
                </div>
              ) : null}

              {product.activePromotion ? (
                <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-emerald-200/80 bg-emerald-50/35 px-2.5 py-1.5 text-[0.78rem] text-emerald-900">
                  <span className="inline-flex items-center rounded-full border border-emerald-200/90 bg-white/85 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                    {product.activePromotion.shortLabel}
                  </span>
                  <p className="leading-relaxed text-emerald-900/85">
                    Oferta activa: <span className="font-semibold">{product.activePromotion.fullLabel}</span>
                  </p>
                </div>
              ) : null}

              {/* Name */}
              <h1 className="text-[2.16rem] font-bold leading-tight text-text-primary sm:text-[2.64rem]">
                {product.name}
              </h1>

              {/* Rating */}
              {reviewAggregate && reviewAggregate.totalReviews > 0 ? (
                <a
                  href="#reviews"
                  className="flex items-center gap-2 transition hover:opacity-80"
                  aria-label={`Calificación: ${reviewAggregate.averageRating} de 5 estrellas, ${reviewAggregate.totalReviews} reseñas`}
                >
                  <StarRating value={Math.round(reviewAggregate.averageRating)} readonly size="sm" />
                  <span className="text-body-sm font-semibold text-text-primary">
                    {reviewAggregate.averageRating}
                  </span>
                  <span className="text-body-sm text-text-secondary">
                    ({reviewAggregate.totalReviews} reseña{reviewAggregate.totalReviews !== 1 ? "s" : ""})
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <StarRating value={0} readonly size="sm" />
                  <span className="text-body-sm text-text-secondary">Sin reseñas</span>
                </div>
              )}

              {/* Description */}
              <p className="text-body-md leading-relaxed text-text-secondary">
                {product.description}
              </p>

              {/* Variant selector */}
              {variants.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-body-sm font-medium text-text-secondary">Presentación</span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <motion.button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        whileTap={reduceMotion ? {} : { scale: 0.95 }}
                        className={[
                          "rounded-full border px-4 py-2 text-body-sm font-medium transition-all duration-200",
                          selectedVariant?.id === variant.id
                            ? "border-brand-primary bg-emerald-50 text-brand-primary shadow-sm"
                            : "border-border-soft bg-white text-text-secondary hover:border-border-brand hover:bg-surface-canvas",
                          variant.stock === 0 ? "opacity-50 cursor-not-allowed" : "",
                        ].join(" ")}
                        disabled={variant.stock === 0}
                      >
                        {variant.name}
                        {variant.stock === 0 ? (
                          <span className="ml-1 text-[0.6rem] text-status-error">(Agotado)</span>
                        ) : null}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Low stock warning */}
              {effectiveStock > 0 && effectiveStock <= 5 ? (
                <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-status-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  ¡Solo quedan {effectiveStock} unidades!
                </p>
              ) : null}

              {/* Purchase area */}
              <div className="space-y-4">

                {/* Price */}
                {hasPrice ? (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-[1.45rem] font-semibold leading-none text-ink-700">
                      {priceFormatter.format(displayPrice!)}
                    </span>
                    {hasDiscount ? (
                      <>
                        <span className="text-body-md font-light text-neutral-400 line-through">
                          {priceFormatter.format(effectivePrice)}
                        </span>
                        {discountPercent !== null ? (
                          <span className="rounded-full bg-status-error px-2.5 py-0.5 text-[0.72rem] font-medium text-white">
                            -{discountPercent}%
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-body-sm font-medium text-text-secondary">Consultar precio</p>
                )}

                {/* Quantity selector */}
                <div className="flex items-center gap-3">
                  <span className="text-body-sm text-text-secondary sm:text-body-sm">Cantidad</span>
                  <div className="flex items-center overflow-hidden rounded-full border border-border-soft bg-surface-canvas">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || outOfStock}
                      aria-label="Reducir cantidad"
                      className="flex h-11 w-11 items-center justify-center text-text-secondary transition hover:bg-surface-soft hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary sm:h-9 sm:w-9"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <span
                      className="w-11 text-center text-[1rem] font-semibold tabular-nums text-text-primary sm:w-9 sm:text-[0.9rem]"
                      aria-live="polite"
                      aria-label={`Cantidad: ${quantity}`}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                      disabled={outOfStock || quantity >= effectiveStock}
                      aria-label="Aumentar cantidad"
                      className="flex h-11 w-11 items-center justify-center text-text-secondary transition hover:bg-surface-soft hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary sm:h-9 sm:w-9"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cart */}
                <div className="flex items-center gap-3">

                  {/* Add to cart */}
                  <motion.button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock || cartState === "added"}
                    whileTap={reduceMotion ? {} : { scale: 0.975, transition: { duration: 0.1 } }}
                    className={[
                      "relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-full px-5 text-white transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                      outOfStock
                        ? "cursor-not-allowed bg-neutral-400"
                        : cartState === "added"
                          ? "cursor-default bg-brand-primary"
                          : "cursor-pointer bg-gradient-to-br from-[#E5B85C] via-[#D6A03A] to-[#C58A1D] text-[#0B5D1E] font-bold shadow-cta hover:shadow-[0_12px_32px_rgba(197,138,29,0.35)]",
                    ].join(" ")}
                    aria-label={
                      cartState === "added"
                        ? "Producto agregado al carrito"
                        : outOfStock
                          ? "Producto sin stock"
                          : `Agregar ${quantity} unidad${quantity !== 1 ? "es" : ""} al carrito`
                    }
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {cartState === "idle" ? (
                        <motion.span
                          key="idle"
                          className="flex w-full items-center justify-between gap-2 px-1"
                          variants={reduceMotion ? {} : cartIdleVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[1.05rem] w-[1.05rem] shrink-0" aria-hidden="true">
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <span className="text-[1.05rem] font-medium tracking-[0.01em]">
                              {outOfStock ? "Sin stock" : "Agregar al carrito"}
                            </span>
                          </span>
                          {displayPrice !== null && !outOfStock ? (
                            <>
                              <span className="h-4 w-px shrink-0 bg-white/40" aria-hidden="true" />
                              <span className="shrink-0 tabular-nums text-[1.05rem] font-semibold tracking-[0.01em]">
                                {priceFormatter.format(displayPrice * quantity)}
                              </span>
                            </>
                          ) : null}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="added"
                          className="flex items-center justify-center gap-2"
                          variants={reduceMotion ? {} : cartAddedVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-[1.05rem] w-[1.05rem] shrink-0" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="text-[0.97rem] font-medium">¡Agregado!</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                </div>
              </div>

              {/* Restock alert */}
              {outOfStock ? (
                <div className="rounded-xl border border-border-soft bg-white p-4">
                  <RestockAlertForm productId={product.id} productName={product.name} />
                </div>
              ) : null}

              {/* Trust badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex items-center gap-1.5 text-[0.72rem] text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Pago seguro
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.72rem] text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden="true">
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <path d="M16 8h4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-4" />
                      <circle cx="12" cy="16" r="1" />
                    </svg>
                    Envío protegido
                  </span>
                  <span className="flex items-center gap-1.5 text-[0.72rem] text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden="true">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Devoluciones fáciles
                  </span>
                </div>

                <div className="flex items-center gap-2" aria-label="Métodos de pago aceptados">
                  <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" aria-label="Visa" role="img">
                    <rect width="38" height="24" rx="4" fill="#f6f4ef" />
                    <text x="19" y="17" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="11" fill="#1a1f71" letterSpacing="-0.3">VISA</text>
                  </svg>
                  <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" aria-label="Mastercard" role="img">
                    <rect width="38" height="24" rx="4" fill="#f6f4ef" />
                    <circle cx="15" cy="12" r="6" fill="#eb001b" fillOpacity="0.85" />
                    <circle cx="23" cy="12" r="6" fill="#f79e1b" fillOpacity="0.85" />
                    <path d="M19 7.8a6 6 0 0 1 0 8.4A6 6 0 0 1 19 7.8z" fill="#ff5f00" fillOpacity="0.85" />
                  </svg>
                  <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" aria-label="American Express" role="img">
                    <rect width="38" height="24" rx="4" fill="#f6f4ef" />
                    <text x="19" y="16" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="7.5" fill="#2e77bc" letterSpacing="0.2">AMERICAN</text>
                    <text x="19" y="21" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="5" fill="#2e77bc" letterSpacing="1">EXPRESS</text>
                  </svg>
                  <svg viewBox="0 0 38 24" className="h-5 w-auto opacity-60" aria-label="Diners Club" role="img">
                    <rect width="38" height="24" rx="4" fill="#f6f4ef" />
                    <circle cx="15.5" cy="12" r="5.5" fill="none" stroke="#004a97" strokeWidth="1.2" />
                    <circle cx="22.5" cy="12" r="5.5" fill="none" stroke="#004a97" strokeWidth="1.2" />
                    <text x="19" y="20.5" textAnchor="middle" fontFamily="sans-serif" fontWeight="600" fontSize="3.8" fill="#004a97" letterSpacing="0.2">DINERS</text>
                  </svg>
                </div>
              </div>

              {/* Benefit cards scroll */}
              <BenefitCardScroll benefits={benefits} />

              {/* Pickup location */}
              {pickupLocations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsPickupOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-border-soft bg-surface-canvas px-4 py-3.5 text-left transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Recoger en <span className="font-semibold">{pickupLocations[0]?.name}</span>
                      </p>
                      <p className="text-xs text-text-secondary">Listo en 24 horas</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-secondary" />
                </button>
              )}

              {/* Product ID */}
              <p className="text-[0.7rem] tracking-[0.04em] text-text-muted">
                ID: {product.id}
              </p>

              {/* ── Acordeón de secciones ──────────────────────────────────── */}
              <div className="mt-6 divide-y divide-border-soft border-y border-border-soft">
                {product.description ? (
                  <AccordionSection title="Detalles del producto">
                    <p>{product.description}</p>
                  </AccordionSection>
                ) : null}

                {ingredients.length > 0 ? (
                  <AccordionSection title="Ingredientes clave">
                    <ul className="space-y-2">
                      {ingredients.map((ing) => (
                        <li key={ing.id} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                          <div>
                            <span className="font-medium text-text-primary">{ing.name}</span>
                            {ing.description ? (
                              <span className="text-text-secondary"> — {ing.description}</span>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionSection>
                ) : null}

                {usageSteps.length > 0 ? (
                  <AccordionSection title="Modo de uso">
                    <ol className="space-y-3">
                      {usageSteps.map((step) => (
                        <li key={step.id} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
                            {step.stepNumber}
                          </span>
                          <span className="text-text-secondary">{step.text}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionSection>
                ) : null}

                <AccordionSection title="Reseñas de clientes">
                  <div id="reviews" className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-body-lg font-semibold text-text-primary">
                        Deja tu reseña
                      </h3>
                      <ReviewForm productId={product.id} />
                    </div>
                    <ReviewList productSlug={product.slug} aggregate={reviewAggregate} />
                  </div>
                </AccordionSection>
              </div>

              {/* ── Compartir + Necesitas ayuda ──────────────────────────────── */}
              <div className="mt-8 flex items-center gap-6 border-t border-border-soft pt-6">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href });
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Compartir
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open("https://wa.me/593999999999?text=Hola, necesito ayuda con " + encodeURIComponent(product.name), "_blank");
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Necesitas ayuda
                </button>
              </div>

            </div>
          </AnimatedSection>
        </section>

        {/* ── Productos relacionados ────────────────────────────────────── */}
        {brandProducts.length > 0 ? (
          <AnimatedSection>
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-section-xl text-text-primary">También te puede interesar</h2>
                <p className="text-body-md text-text-secondary">
                  Descubre más productos de {product.brand} que podrían complementar tu rutina.
                </p>
              </div>
              <PublicProductCarousel items={brandProducts} />
            </section>
          </AnimatedSection>
        ) : null}

        {/* ── Recomendados para ti ───────────────────────────────────────── */}
        {recommendedProducts.length > 0 ? (
          <AnimatedSection>
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-section-xl text-text-primary">Recomendados para ti</h2>
                <p className="text-body-md text-text-secondary">
                  {product.category
                    ? `Más productos de ${product.category.name} que podrían interesarte.`
                    : "Otros productos que podrían interesarte."}
                </p>
              </div>
              <PublicProductCarousel items={recommendedProducts} />
            </section>
          </AnimatedSection>
        ) : null}

      </div>

      {/* Pickup location drawer */}
      <PickupLocationDrawer
        isOpen={isPickupOpen}
        onClose={() => setIsPickupOpen(false)}
        locations={pickupLocations}
        productName={product.name}
      />
    </div>
  );
}
