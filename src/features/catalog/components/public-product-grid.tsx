"use client";

import { useEffect, useState } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { motionTokens } from "@/motion/tokens";
import type { PublicCatalogProductSummary } from "@/types/public-catalog";

import { PublicProductCard } from "./public-product-card";

interface PublicProductGridProps {
  items: PublicCatalogProductSummary[];
  mobileColumns?: 1 | 2;
  inlineBannerSlot?: React.ReactNode;
  bannerPosition?: number;
  layout?: "default" | "withSidebar";
  id?: string;
}

const ROW_STAGGER_DELAY = 0.08;

function resolveColumnCount(
  width: number,
  mobileColumns: 1 | 2,
  layout: "default" | "withSidebar" = "default",
): number {
  if (layout === "withSidebar") {
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 640) return 2;
    return mobileColumns;
  }

  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return mobileColumns;
}

export function PublicProductGrid({ items, mobileColumns = 1, inlineBannerSlot, bannerPosition = 2, layout = "default", id }: PublicProductGridProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [columnCount, setColumnCount] = useState<number>(mobileColumns);

  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(resolveColumnCount(window.innerWidth, mobileColumns, layout));
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);

    return () => {
      window.removeEventListener("resize", updateColumnCount);
    };
  }, [mobileColumns, layout]);

  // Build the ordered list of slots: products with the banner injected at bannerPosition
  const slots: Array<{ type: "product"; product: PublicCatalogProductSummary } | { type: "banner" }> = [];
  const insertAt = Math.min(bannerPosition, items.length);

  items.forEach((product, i) => {
    if (inlineBannerSlot && i === insertAt) {
      slots.push({ type: "banner" });
    }
    slots.push({ type: "product", product });
  });

  // If insertAt is beyond all items (e.g. fewer items than bannerPosition)
  if (inlineBannerSlot && insertAt >= items.length) {
    slots.push({ type: "banner" });
  }

  const gridClass =
    layout === "withSidebar"
      ? mobileColumns === 2
        ? "grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
        : "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : mobileColumns === 2
        ? "grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        : "grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <ul id={id} className={gridClass}>
      {slots.map((slot, visualIndex) => {
        if (slot.type === "banner") {
          return <li key="banner-slot">{inlineBannerSlot}</li>;
        }

        const rowIndex = Math.floor(visualIndex / columnCount);

        return (
          <motion.li
            key={slot.product.id}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: motionTokens.distance.sm,
                    filter: "blur(10px)",
                  }
            }
            whileInView={
              reduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }
            }
            viewport={{ once: true, amount: 0.22 }}
            transition={{
              duration: reduceMotion ? motionTokens.duration.fast : motionTokens.duration.moderate,
              delay: rowIndex * ROW_STAGGER_DELAY,
              ease: motionTokens.ease.standard,
            }}
          >
            <PublicProductCard product={slot.product} />
          </motion.li>
        );
      })}
    </ul>
  );
}