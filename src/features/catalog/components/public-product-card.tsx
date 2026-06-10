"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { ProductBadge } from "@/components/ui/product-badge";
import { useCart } from "@/features/cart/context/cart-context";
import { motionTokens } from "@/motion/tokens";
import type { MediaAsset } from "@/types/media";
import type { PublicCatalogCategoryReference, PublicPromotionPill } from "@/types/public-catalog";

interface PublicProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    href: string;
    price: number | null;
    discountPrice: number | null;
    stock?: number;
    badge?: string;
    badgeColor?: string;
    activePromotion?: PublicPromotionPill | null;
    media: MediaAsset | null;
    category: PublicCatalogCategoryReference | null;
  };
}

const storefrontPriceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const addToCartButtonVariants: Variants = {
  initial: {
    opacity: 0,
    y: motionTokens.distance.xs,
    scale: motionTokens.scale.enterSoft,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.soft,
    },
  },
  exit: {
    opacity: 0,
    y: motionTokens.distance.micro,
    scale: motionTokens.scale.enterSoft,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.exit,
    },
  },
};

const cardIdleVariants: Variants = {
  initial: { opacity: 0, y: 7, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.soft },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.97,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
  },
};

const cardAddedVariants: Variants = {
  initial: { opacity: 0, scale: 0.88, y: 6 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.soft },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
  },
};

export function PublicProductCard({ product }: PublicProductCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [cardState, setCardState] = useState<"idle" | "added">("idle");
  const cardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem } = useCart();
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const mediaLabel = product.media?.altText?.trim() || product.name;

  useEffect(() => {
    return () => {
      if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    };
  }, []);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (cardState === "added" || isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      href: product.href,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.media?.url ?? null,
      imageAlt: mediaLabel,
    });
    setCardState("added");
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    cardTimerRef.current = setTimeout(() => setCardState("idle"), 2200);
  }
  const basePrice = product.price;
  const hasPrice = basePrice !== null;
  const hasDiscount =
    basePrice !== null &&
    product.discountPrice !== null &&
    product.discountPrice < basePrice;
  const displayPrice = hasDiscount && product.discountPrice !== null
    ? product.discountPrice
    : basePrice;
  const discountPercentage = hasDiscount && basePrice !== null && product.discountPrice !== null
    ? Math.max(1, Math.round(((basePrice - product.discountPrice) / basePrice) * 100))
    : null;
  const activePromotion = product.activePromotion ?? null;

  return (
    <Link
      href={product.href}
      onPointerEnter={() => setShowAddToCart(true)}
      onPointerLeave={() => setShowAddToCart(false)}
      onFocus={() => setShowAddToCart(true)}
      onBlur={() => setShowAddToCart(false)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-soft hover:border-[#d9d6ce] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      {/* Image area */}
      <div className="relative bg-white">
        <div className="relative aspect-square w-full p-6">
          {product.media?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- R2 assets use native img
            <img
              src={product.media.url}
              alt={mediaLabel}
              className="h-full w-full object-contain transition-transform duration-300 ease-soft group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-label-md text-neutral-500">
                {product.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {activePromotion ? (
          <div className="group/promo absolute left-3 top-3 max-w-[68%]">
            <span
              className="inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50/95 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-emerald-800 shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
              title={activePromotion.tooltip}
              aria-label={activePromotion.tooltip}
            >
              <span className="truncate">{activePromotion.shortLabel}</span>
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-0 top-full z-tooltip mt-2 w-[220px] rounded-md bg-ink-700 px-3 py-2 text-[0.72rem] font-medium leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/promo:opacity-100 group-focus-visible:opacity-100"
            >
              {activePromotion.tooltip}
            </span>
          </div>
        ) : null}

        <div className="absolute right-3 top-3 flex max-w-[70%] flex-col items-end gap-2">
          {product.badge ? (
            <ProductBadge
              label={product.badge}
              color={product.badgeColor}
              className="max-w-full rounded-full border px-1 py-0.5 text-[0.58rem] leading-none scale-90 origin-top-right"
            />
          ) : null}

          {discountPercentage !== null ? (
            <span className="rounded-full bg-status-error px-3 py-1 text-[0.74rem] font-medium leading-none text-white">
              -{discountPercentage}%
            </span>
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {showAddToCart ? (
            reduceMotion ? (
              <motion.div
                key="add-to-cart"
                className="pointer-events-auto absolute inset-x-3 bottom-3 hidden cursor-pointer md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cardState === "added" || isOutOfStock}
                  whileTap={reduceMotion ? {} : { scale: 0.975, transition: { duration: 0.1 } }}
                  className={[
                    "flex w-full min-h-11 items-center justify-center overflow-hidden rounded-full px-3 py-2 text-white transition-colors duration-200 ease-soft sm:px-4",
                    isOutOfStock
                      ? "cursor-not-allowed bg-neutral-400"
                      : cardState === "added"
                        ? "cursor-default bg-brand-primary"
                        : "cursor-pointer bg-gradient-to-br from-[#E5B85C] via-[#D6A03A] to-[#C58A1D] text-[#0B5D1E] font-bold shadow-cta hover:shadow-[0_12px_32px_rgba(197,138,29,0.35)]",
                  ].join(" ")}
                  aria-label={
                    isOutOfStock
                      ? "Producto sin stock"
                      : cardState === "added"
                        ? "Producto agregado al carrito"
                        : `Agregar ${product.name} al carrito`
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {cardState === "idle" || isOutOfStock ? (
                      <motion.span
                        key="idle"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em] sm:gap-2 sm:text-[0.84rem] sm:tracking-[0.03em]"
                        variants={reduceMotion ? {} : cardIdleVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="added"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em] sm:gap-2 sm:text-[0.84rem] sm:tracking-[0.03em]"
                        variants={reduceMotion ? {} : cardAddedVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        ¡Agregado!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="add-to-cart"
                className="pointer-events-auto absolute inset-x-3 bottom-3 hidden cursor-pointer md:block"
                variants={addToCartButtonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cardState === "added" || isOutOfStock}
                  whileTap={reduceMotion ? {} : { scale: 0.975, transition: { duration: 0.1 } }}
                  className={[
                    "flex w-full min-h-11 items-center justify-center overflow-hidden rounded-full px-3 py-2 text-white transition-colors duration-200 ease-soft sm:px-4",
                    isOutOfStock
                      ? "cursor-not-allowed bg-neutral-400"
                      : cardState === "added"
                        ? "cursor-default bg-brand-primary"
                        : "cursor-pointer bg-gradient-to-br from-[#E5B85C] via-[#D6A03A] to-[#C58A1D] text-[#0B5D1E] font-bold shadow-cta hover:shadow-[0_12px_32px_rgba(197,138,29,0.35)]",
                  ].join(" ")}
                  aria-label={
                    isOutOfStock
                      ? "Producto sin stock"
                      : cardState === "added"
                        ? "Producto agregado al carrito"
                        : `Agregar ${product.name} al carrito`
                  }
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {cardState === "idle" || isOutOfStock ? (
                      <motion.span
                        key="idle"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em] sm:gap-2 sm:text-[0.84rem] sm:tracking-[0.03em]"
                        variants={reduceMotion ? {} : cardIdleVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="added"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em] sm:gap-2 sm:text-[0.84rem] sm:tracking-[0.03em]"
                        variants={reduceMotion ? {} : cardAddedVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        ¡Agregado!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            )
          ) : null}
        </AnimatePresence>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col bg-surface-soft p-[6px] pb-4 pt-4 sm:p-4">
        <div className="flex items-baseline justify-between gap-3">
          {product.category ? (
            <p className="min-w-0 text-[0.74rem] font-normal leading-[1.1] tracking-[-0.015em] text-text-primary sm:text-body-sm sm:tracking-normal">
              {product.category.name}
            </p>
          ) : null}

          {hasDiscount && hasPrice && displayPrice !== null ? (
            <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
              <span className="text-[0.72rem] font-light leading-none text-neutral-400 line-through sm:text-[0.83rem]">
                {storefrontPriceFormatter.format(basePrice)}
              </span>
              <span className="text-[0.95rem] font-semibold leading-none text-ink-700 sm:text-[1rem]">
                {storefrontPriceFormatter.format(displayPrice)}
              </span>
            </span>
          ) : displayPrice !== null ? (
            <span className="shrink-0 whitespace-nowrap text-[0.95rem] font-semibold leading-none text-ink-700 sm:text-[1rem]">
              {storefrontPriceFormatter.format(displayPrice)}
            </span>
          ) : (
            <span className="shrink-0 whitespace-nowrap text-[0.78rem] font-semibold leading-none text-ink-700 sm:text-[0.84rem]">
              Consultar precio
            </span>
          )}
        </div>

        <h2 className="mt-3 w-full text-[0.98rem] font-medium leading-[1.15] text-text-primary line-clamp-3 sm:w-4/5 sm:text-[1.04rem] sm:leading-[1.2rem]">
          {product.name}
        </h2>

        <p className="mt-2 text-body-sm font-normal leading-[1.12] text-text-secondary">
          {product.brand}
        </p>

        <div className="mt-auto pt-4 md:hidden">
          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={cardState === "added" || isOutOfStock}
            whileTap={reduceMotion ? {} : { scale: 0.975, transition: { duration: 0.1 } }}
            className={[
              "flex w-full min-h-11 items-center justify-center overflow-hidden rounded-full px-3 py-2 text-white transition-colors duration-200 ease-soft",
              isOutOfStock
                ? "cursor-not-allowed bg-neutral-400"
                : cardState === "added"
                  ? "cursor-default bg-brand-primary"
                  : "cursor-pointer bg-gradient-to-br from-[#E5B85C] via-[#D6A03A] to-[#C58A1D] text-[#0B5D1E] font-bold shadow-cta hover:shadow-[0_12px_32px_rgba(197,138,29,0.35)]",
            ].join(" ")}
            aria-label={
              isOutOfStock
                ? "Producto sin stock"
                : cardState === "added"
                  ? "Producto agregado al carrito"
                  : `Agregar ${product.name} al carrito`
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              {cardState === "idle" || isOutOfStock ? (
                <motion.span
                  key="idle"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em]"
                  variants={reduceMotion ? {} : cardIdleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
                </motion.span>
              ) : (
                <motion.span
                  key="added"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-normal tracking-[0.02em]"
                  variants={reduceMotion ? {} : cardAddedVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  ¡Agregado!
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </Link>
  );
}