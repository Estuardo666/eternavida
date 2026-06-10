"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, SlidersHorizontal, X } from "lucide-react";

import { motionTokens } from "@/motion/tokens";
import type {
  PublicCatalogBrandOption,
  PublicProductCatalogFilters,
  PublicProductCatalogSort,
} from "@/types/public-catalog";

// --- Constants ----------------------------------------------------------------

const SLIDER_STEP = 500;

const SORT_OPTIONS: { value: PublicProductCatalogSort; label: string }[] = [
  { value: "recent",     label: "Mas recientes" },
  { value: "oldest",     label: "Mas antiguos" },
  { value: "name",       label: "Nombre A-Z" },
  { value: "name-desc",  label: "Nombre Z-A" },
  { value: "price-asc",  label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "bestseller", label: "Mas vendidos" },
  { value: "highest-discount", label: "Mayor descuento" },
];

// --- Types --------------------------------------------------------------------

interface PublicCatalogFilterSidebarProps {
  actionPath: string;
  filters: PublicProductCatalogFilters;
  sortBy: PublicProductCatalogSort;
  brandOptions: PublicCatalogBrandOption[];
  totalItems: number;
  maxPrice: number;
  includeCategorySlugInUrl?: boolean;
}

type SectionKey = "ordenar" | "precio" | "marcas";

interface FilterDraft {
  sortBy: PublicProductCatalogSort;
  priceMinInput: string;
  priceMaxInput: string;
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  onSale: boolean;
  brandIds: string[];
}

// --- URL builder --------------------------------------------------------------

function buildCatalogUrl(
  actionPath: string,
  preserved: Pick<PublicProductCatalogFilters, "query" | "categorySlug">,
  d: Pick<FilterDraft, "sortBy" | "priceMin" | "priceMax" | "inStock" | "onSale" | "brandIds">,
  brandOptions: PublicCatalogBrandOption[],
): string {
  const p = new URLSearchParams();
  if (preserved.query) p.set("q", preserved.query);
  if (preserved.categorySlug) p.set("categoria", preserved.categorySlug);
  if (d.sortBy !== "recent") p.set("orden", d.sortBy);
  if (d.priceMin !== null && d.priceMin > 0) p.set("precioMin", String(d.priceMin));
  if (d.priceMax !== null) p.set("precioMax", String(d.priceMax));
  if (d.inStock) p.set("enStock", "1");
  if (d.onSale) p.set("enOferta", "1");
  const brandSlugs = d.brandIds
    .map((brandId) => brandOptions.find((brand) => brand.id === brandId)?.slug)
    .filter((slug): slug is string => Boolean(slug));
  if (brandSlugs.length > 0) p.set("marcas", brandSlugs.join(","));
  const qs = p.toString();
  return qs ? `${actionPath}?${qs}` : actionPath;
}

function draftFromFilters(
  filters: PublicProductCatalogFilters,
  sortBy: PublicProductCatalogSort,
): FilterDraft {
  return {
    sortBy,
    priceMinInput: filters.priceMin !== null ? String(filters.priceMin) : "",
    priceMaxInput: filters.priceMax !== null ? String(filters.priceMax) : "",
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    inStock: filters.inStock,
    onSale: filters.onSale,
    brandIds: [...filters.brandIds],
  };
}

// --- AccordionSection ---------------------------------------------------------

interface AccordionSectionProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ label, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-sm py-2.25 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
      >
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
          className="shrink-0 text-text-muted"
        >
          <Plus size={15} strokeWidth={2} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
              opacity: { duration: motionTokens.duration.fast },
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-border-soft" />
    </div>
  );
}

// --- Toggle ------------------------------------------------------------------

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-[200ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
        checked ? "bg-brand-primary" : "bg-neutral-400"
      }`}
    >
      <motion.span
        animate={{ x: checked ? 16 : 2 }}
        transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
        className="block h-3.5 w-3.5 rounded-full bg-surface-canvas shadow-xs"
      />
    </button>
  );
}

// --- PriceSection ------------------------------------------------------------

interface PriceSectionProps {
  draft: FilterDraft;
  sliderMax: number;
  onDraftChange: (partial: Partial<FilterDraft>) => void;
}

function PriceSection({ draft, sliderMax, onDraftChange }: PriceSectionProps) {
  const THUMB_SIZE = 22;
  const THUMB_R = THUMB_SIZE / 2;
  const displaySliderMax = Math.max(0, sliderMax);
  const safeSliderMax = Math.max(1, displaySliderMax);
  const STEP = safeSliderMax <= 100 ? 1 : safeSliderMax <= 500 ? 5 : safeSliderMax <= 2000 ? 10 : SLIDER_STEP;
  const minGap = Math.min(STEP, displaySliderMax);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);
  const reduceMotion = useReducedMotion();

  const currentMin = Math.min(
    Math.max(draft.priceMin ?? 0, 0),
    Math.max(0, displaySliderMax - minGap),
  );
  const currentMax = Math.max(
    Math.min(draft.priceMax ?? displaySliderMax, displaySliderMax),
    Math.min(displaySliderMax, currentMin + minGap),
  );

  const liveRef = useRef({ currentMin, currentMax, displaySliderMax, minGap, onDraftChange });
  liveRef.current = { currentMin, currentMax, displaySliderMax, minGap, onDraftChange };

  const applyThumbValue = useCallback(
    (thumb: "min" | "max", nextValue: number) => {
      if (thumb === "min") {
        const upperBound = Math.max(0, currentMax - minGap);
        const clamped = Math.max(0, Math.min(nextValue, upperBound));
        onDraftChange({
          priceMin: clamped <= 0 ? null : clamped,
          priceMinInput: clamped <= 0 ? "" : String(clamped),
        });
        return;
      }

      const lowerBound = Math.min(displaySliderMax, currentMin + minGap);
      const clamped = Math.min(displaySliderMax, Math.max(nextValue, lowerBound));
      onDraftChange({
        priceMax: clamped >= displaySliderMax ? null : clamped,
        priceMaxInput: clamped >= displaySliderMax ? "" : String(clamped),
      });
    },
    [currentMax, currentMin, displaySliderMax, minGap, onDraftChange],
  );

  useEffect(() => {
    if (!activeThumb) return;

    const computeValue = (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return 0;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = pct * liveRef.current.displaySliderMax;
      return Math.round(rawValue / Math.max(1, liveRef.current.minGap || STEP)) * Math.max(1, liveRef.current.minGap || STEP);
    };

    const handleMove = (e: PointerEvent) => {
      const val = computeValue(e.clientX);
      const { currentMin: mn, currentMax: mx, displaySliderMax: smax, minGap: gap, onDraftChange: cb } = liveRef.current;
      if (activeThumb === "min") {
        const clamped = Math.max(0, Math.min(val, Math.max(0, mx - gap)));
        cb({ priceMin: clamped <= 0 ? null : clamped, priceMinInput: clamped <= 0 ? "" : String(clamped) });
      } else {
        const clamped = Math.min(smax, Math.max(val, Math.min(smax, mn + gap)));
        cb({ priceMax: clamped >= smax ? null : clamped, priceMaxInput: clamped >= smax ? "" : String(clamped) });
      }
    };

    const handleUp = () => setActiveThumb(null);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [activeThumb, STEP]);

  const getTrackValueFromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = pct * displaySliderMax;
    return Math.round(rawValue / Math.max(1, minGap || STEP)) * Math.max(1, minGap || STEP);
  }, [STEP, displaySliderMax, minGap]);

  const handleTrackPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const nextValue = getTrackValueFromClientX(e.clientX);
    const nextThumb = Math.abs(nextValue - currentMin) <= Math.abs(nextValue - currentMax) ? "min" : "max";
    setActiveThumb(nextThumb);
    applyThumbValue(nextThumb, nextValue);
  }, [applyThumbValue, currentMax, currentMin, getTrackValueFromClientX]);

  const handleMinInput = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    if (raw === "" || raw === "0") {
      onDraftChange({ priceMinInput: raw, priceMin: null });
    } else if (Number.isFinite(parsed) && parsed >= 0) {
      onDraftChange({ priceMinInput: raw, priceMin: parsed });
    } else {
      onDraftChange({ priceMinInput: raw });
    }
  };

  const handleMaxInput = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    if (raw === "") {
      onDraftChange({ priceMaxInput: raw, priceMax: null });
    } else if (Number.isFinite(parsed) && parsed >= 0) {
      onDraftChange({ priceMaxInput: raw, priceMax: parsed });
    } else {
      onDraftChange({ priceMaxInput: raw });
    }
  };

  const leftPct = (currentMin / safeSliderMax) * 100;
  const rightPct = 100 - (currentMax / safeSliderMax) * 100;
  const maxPct = 100 - rightPct;

  const formatPrice = (v: number) =>
    `$${v.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

  const springTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 35 };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 5, scale: 0.85 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const resolveTooltipPosition = (pct: number) => {
    if (pct >= 88) {
      return {
        className: "pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm",
        arrowClassName: "pointer-events-none absolute bottom-full right-2 border-[5px] border-transparent",
      };
    }

    if (pct <= 12) {
      return {
        className: "pointer-events-none absolute left-0 top-full mt-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm",
        arrowClassName: "pointer-events-none absolute bottom-full left-2 border-[5px] border-transparent",
      };
    }

    return {
      className: "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm",
      arrowClassName: "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent",
    };
  };

  const minTooltipPosition = resolveTooltipPosition(leftPct);
  const maxTooltipPosition = resolveTooltipPosition(maxPct);

  return (
    <>
      {/* Slider */}
      <div className="relative mb-1 mt-0 pt-0.5" style={{ height: "50px" }}>
        <div
          className="relative touch-none"
          onPointerDown={handleTrackPointerDown}
          style={{ marginLeft: THUMB_R, marginRight: THUMB_R, height: "44px", overflow: "visible" }}
        >
          <div
            ref={trackRef}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-border-soft"
          >
            <motion.div
              className="absolute h-full rounded-full"
              style={{ left: `${leftPct}%`, right: `${rightPct}%`, backgroundColor: "#0B5D1E" }}
              layout
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }}
            />
          </div>

          {/* Min thumb */}
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Precio minimo"
            aria-valuemin={0}
            aria-valuemax={displaySliderMax}
            aria-valuenow={currentMin}
            aria-valuetext={formatPrice(currentMin)}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[22px] w-[22px] cursor-grab items-center justify-center rounded-full bg-white shadow-md active:cursor-grabbing touch-none select-none"
            style={{
              left: `${leftPct}%`,
              border: "2.5px solid #0B5D1E",
              zIndex: activeThumb === "min" ? 4 : (leftPct >= 95 ? 3 : 2),
            }}
            whileHover={reduceMotion ? {} : { scale: 1.2 }}
            animate={{ scale: activeThumb === "min" ? 1.25 : 1 }}
            transition={springTransition}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveThumb("min");
              applyThumbValue("min", getTrackValueFromClientX(e.clientX));
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                const c = Math.max(0, Math.min(currentMin - STEP, currentMax - minGap));
                onDraftChange({ priceMin: c <= 0 ? null : c, priceMinInput: c <= 0 ? "" : String(c) });
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                const c = Math.min(currentMin + STEP, currentMax - minGap);
                onDraftChange({ priceMin: c <= 0 ? null : c, priceMinInput: c <= 0 ? "" : String(c) });
              }
            }}
          >
            <AnimatePresence>
              {activeThumb === "min" && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                  className={minTooltipPosition.className}
                  style={{ backgroundColor: "#0B5D1E" }}
                >
                  {formatPrice(currentMin)}
                  <span
                    className={minTooltipPosition.arrowClassName}
                    style={{ borderBottomColor: "#0B5D1E" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Max thumb */}
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Precio maximo"
            aria-valuemin={0}
            aria-valuemax={displaySliderMax}
            aria-valuenow={currentMax}
            aria-valuetext={formatPrice(currentMax)}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[22px] w-[22px] cursor-grab items-center justify-center rounded-full bg-white shadow-md active:cursor-grabbing touch-none select-none"
            style={{
              left: `${100 - rightPct}%`,
              border: "2.5px solid #0B5D1E",
              zIndex: activeThumb === "max" ? 4 : 1,
            }}
            whileHover={reduceMotion ? {} : { scale: 1.2 }}
            animate={{ scale: activeThumb === "max" ? 1.25 : 1 }}
            transition={springTransition}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveThumb("max");
              applyThumbValue("max", getTrackValueFromClientX(e.clientX));
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                const c = Math.max(currentMax - STEP, currentMin + minGap);
                onDraftChange({ priceMax: c >= displaySliderMax ? null : c, priceMaxInput: c >= displaySliderMax ? "" : String(c) });
              } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                const c = Math.min(currentMax + STEP, displaySliderMax);
                onDraftChange({ priceMax: c >= displaySliderMax ? null : c, priceMaxInput: c >= displaySliderMax ? "" : String(c) });
              }
            }}
          >
            <AnimatePresence>
              {activeThumb === "max" && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.1 }}
                  className={maxTooltipPosition.className}
                  style={{ backgroundColor: "#0B5D1E" }}
                >
                  {formatPrice(currentMax)}
                  <span
                    className={maxTooltipPosition.arrowClassName}
                    style={{ borderBottomColor: "#0B5D1E" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Min / max labels */}
      <div className="mb-1.5 flex justify-between" style={{ paddingLeft: THUMB_R - 2, paddingRight: THUMB_R - 2 }}>
        <span className="text-[11px] text-text-muted">{formatPrice(0)}</span>
        <span className="text-[11px] text-text-muted">{formatPrice(displaySliderMax)}</span>
      </div>

      {/* Number inputs */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          placeholder="Min"
          value={draft.priceMinInput}
          onChange={(e) => handleMinInput(e.target.value)}
          className="w-0 flex-1 rounded-md border border-transparent bg-surface-canvas px-2.5 py-1.5 text-body-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
          style={{ borderColor: "rgba(24, 24, 27, 0.66)" }}
        />
        <span className="shrink-0 text-body-sm text-text-muted">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          value={draft.priceMaxInput}
          onChange={(e) => handleMaxInput(e.target.value)}
          className="w-0 flex-1 rounded-md border border-transparent bg-surface-canvas px-2.5 py-1.5 text-body-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
          style={{ borderColor: "rgba(24, 24, 27, 0.66)" }}
        />
      </div>
    </>
  );
}

// --- FilterBody --------------------------------------------------------------

interface FilterBodyProps {
  filters: PublicProductCatalogFilters;
  sortBy: PublicProductCatalogSort;
  brandOptions: PublicCatalogBrandOption[];
  totalItems: number;
  previewTotalItems: number;
  isPreviewLoading: boolean;
  isApplyingFilters: boolean;
  openSections: Record<SectionKey, boolean>;
  draft: FilterDraft;
  sliderMax: number;
  onToggleSection: (key: SectionKey) => void;
  onDraftChange: (partial: Partial<FilterDraft>) => void;
  onApply: () => void;
  onInStockToggle: (v: boolean) => void;
  onOnSaleToggle: (v: boolean) => void;
  onSortChange: (value: PublicProductCatalogSort) => void;
  onRemoveActiveFilter: (
    key: "sort" | "price" | "inStock" | "onSale" | "brand",
    brandId?: string,
  ) => void;
  onReset: () => void;
}

function FilterBody({
  filters,
  sortBy,
  brandOptions,
  totalItems,
  previewTotalItems,
  isPreviewLoading,
  isApplyingFilters,
  openSections,
  draft,
  sliderMax,
  onToggleSection,
  onDraftChange,
  onApply,
  onInStockToggle,
  onOnSaleToggle,
  onSortChange,
  onRemoveActiveFilter,
  onReset,
}: FilterBodyProps) {
  const activeBrands = filters.brandIds
    .map((id) => brandOptions.find((b) => b.id === id))
    .filter((b): b is PublicCatalogBrandOption => b !== undefined);
  const sortedBrandOptions = useMemo(
    () => [...brandOptions].sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name)),
    [brandOptions],
  );

  const hasActiveFilters =
    sortBy !== "recent" ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.inStock ||
    filters.onSale ||
    filters.brandIds.length > 0;

  const chipMotion = {
    initial: { opacity: 0, scale: 0.92, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.92, y: -4 },
  };

  return (
    <div className="flex h-full flex-col">
      {/* Active chips */}
      <div className="pb-3">
        <AnimatePresence initial={false} mode="popLayout">
          {hasActiveFilters ? (
            <motion.div
              key="active-filters"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
              className="space-y-2"
            >
              <motion.div layout className="flex flex-wrap gap-1.25">
                <AnimatePresence initial={false}>
                  {sortBy !== "recent" && (
                    <motion.button
                      key={`sort-${sortBy}`}
                      type="button"
                      layout
                      variants={chipMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                      onClick={() => onRemoveActiveFilter("sort")}
                      className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-[3px] text-[11px] text-text-brand transition-colors hover:bg-brand-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                      <X size={10} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                  )}
                  {(filters.priceMin !== null || filters.priceMax !== null) && (
                    <motion.button
                      key="price"
                      type="button"
                      layout
                      variants={chipMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                      onClick={() => onRemoveActiveFilter("price")}
                      className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-[3px] text-[11px] text-text-brand transition-colors hover:bg-brand-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      {filters.priceMin !== null ? `$${filters.priceMin.toLocaleString()}` : "$0"}
                      {" - "}
                      {filters.priceMax !== null ? `$${filters.priceMax.toLocaleString()}` : "Max"}
                      <X size={10} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                  )}
                  {filters.inStock && (
                    <motion.button
                      key="inStock"
                      type="button"
                      layout
                      variants={chipMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                      onClick={() => onRemoveActiveFilter("inStock")}
                      className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-[3px] text-[11px] text-text-brand transition-colors hover:bg-brand-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      Solo en stock
                      <X size={10} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                  )}
                  {filters.onSale && (
                    <motion.button
                      key="onSale"
                      type="button"
                      layout
                      variants={chipMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                      onClick={() => onRemoveActiveFilter("onSale")}
                      className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-[3px] text-[11px] text-text-brand transition-colors hover:bg-brand-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      En oferta
                      <X size={10} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                  )}
                  {activeBrands.map((brand) => (
                    <motion.button
                      key={brand.id}
                      type="button"
                      layout
                      variants={chipMotion}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                      onClick={() => onRemoveActiveFilter("brand", brand.id)}
                      className="inline-flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-[3px] text-[11px] text-text-brand transition-colors hover:bg-brand-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      {brand.name}
                      <X size={10} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence initial={false}>
                <motion.button
                  key="reset-filters"
                  type="button"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-neutral-900 px-3 py-1.5 text-label-sm text-text-inverse transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
                >
                  Resetear filtros
                </motion.button>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.p
              key="no-active-filters"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
              className="text-body-sm text-text-muted"
            >
              Sin filtros activos
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-border-soft" />

      {/* Accordion sections */}
      <div className="flex-1">
        <AccordionSection
          label="Ordenar"
          isOpen={openSections.ordenar}
          onToggle={() => onToggleSection("ordenar")}
        >
          <div className="grid grid-cols-2 gap-1 pt-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSortChange(opt.value)}
                className={`min-h-[34px] rounded-pill px-2 py-1 text-left text-[11px] leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                  draft.sortBy === opt.value
                    ? "bg-brand-soft/[0.66] text-text-brand"
                    : "bg-brand-soft/[0.66] text-text-secondary hover:bg-brand-soft/[0.8] hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          label="Precio"
          isOpen={openSections.precio}
          onToggle={() => onToggleSection("precio")}
        >
          <PriceSection draft={draft} sliderMax={sliderMax} onDraftChange={onDraftChange} />
        </AccordionSection>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-semibold text-text-primary">Solo en stock</span>
          <Toggle checked={draft.inStock} onChange={onInStockToggle} label="Solo en stock" />
        </div>
        <div className="h-px bg-border-soft" />

        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-semibold text-text-primary">En oferta</span>
          <Toggle checked={draft.onSale} onChange={onOnSaleToggle} label="Productos en oferta" />
        </div>
        <div className="h-px bg-border-soft" />

        {brandOptions.length > 0 && (
          <AccordionSection
            label="Marca"
            isOpen={openSections.marcas}
            onToggle={() => onToggleSection("marcas")}
          >
            <div className="flex flex-wrap gap-1 pt-0.5">
              {sortedBrandOptions.map((brand) => {
                const active = draft.brandIds.includes(brand.id);
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? draft.brandIds.filter((id) => id !== brand.id)
                        : [...draft.brandIds, brand.id];
                      onDraftChange({ brandIds: next });
                    }}
                    className={`rounded-pill px-2 py-[3px] text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                      active
                        ? "bg-brand-soft/[0.66] text-text-brand"
                        : "bg-brand-soft/[0.66] text-text-secondary hover:bg-brand-soft/[0.8] hover:text-text-primary"
                    }`}
                  >
                    {brand.name}
                  </button>
                );
              })}
            </div>
          </AccordionSection>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onApply}
          disabled={isApplyingFilters}
          className="w-full rounded-pill bg-brand-primary py-3 text-label-md text-text-inverse transition-colors hover:bg-brand-primaryHover disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          {isApplyingFilters ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              <span>Actualizando resultados...</span>
            </span>
          ) : (
            `Mostrar ${isPreviewLoading ? totalItems : previewTotalItems} resultados`
          )}
        </button>
      </div>
    </div>
  );
}

// --- PublicCatalogFilterSidebar -----------------------------------------------

export function PublicCatalogFilterSidebar({
  actionPath,
  filters,
  sortBy,
  brandOptions,
  totalItems,
  maxPrice,
  includeCategorySlugInUrl = true,
}: PublicCatalogFilterSidebarProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const catalogTopId = "catalog-products-top";
  const preservedRouteFilters = useMemo(
    () => ({ query: filters.query, categorySlug: includeCategorySlugInUrl ? filters.categorySlug : "" }),
    [filters.categorySlug, filters.query, includeCategorySlugInUrl],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewTotalItems, setPreviewTotalItems] = useState(totalItems);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    ordenar: true,
    precio: false,
    marcas: false,
  });

  const [draft, setDraftState] = useState<FilterDraft>(() => draftFromFilters(filters, sortBy));
  const prevFilterKeyRef = useRef<string>("");

  useEffect(() => {
    const filterKey = [
      filters.priceMin,
      filters.priceMax,
      filters.inStock,
      filters.onSale,
      filters.brandIds.join(","),
      filters.query,
      filters.categorySlug,
    ].join("|");
    if (filterKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = filterKey;
      setDraftState(draftFromFilters(filters, sortBy));
      setPreviewTotalItems(totalItems);
      setIsPreviewLoading(false);
      setIsApplyingFilters(false);
    } else {
      setDraftState((prev) => (prev.sortBy === sortBy ? prev : { ...prev, sortBy }));
    }
  }, [filters, sortBy, totalItems]);

  // clear any pending apply timeout when filters change
  const applyTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
        applyTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const appliedFilterKey = useMemo(
    () => [
      filters.query,
      filters.categorySlug,
      filters.priceMin,
      filters.priceMax,
      filters.inStock,
      filters.onSale,
      filters.brandIds.join(","),
    ].join("|"),
    [filters.brandIds, filters.categorySlug, filters.inStock, filters.onSale, filters.priceMax, filters.priceMin, filters.query],
  );

  const draftFilterKey = useMemo(
    () => [
      filters.query,
      filters.categorySlug,
      draft.priceMin,
      draft.priceMax,
      draft.inStock,
      draft.onSale,
      draft.brandIds.join(","),
    ].join("|"),
    [draft.brandIds, draft.inStock, draft.onSale, draft.priceMax, draft.priceMin, filters.categorySlug, filters.query],
  );

  const [debouncedDraftKey, setDebouncedDraftKey] = useState(draftFilterKey);
  const draftDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (draftFilterKey === appliedFilterKey) {
      if (draftDebounceRef.current) {
        clearTimeout(draftDebounceRef.current);
        draftDebounceRef.current = null;
      }
      setDebouncedDraftKey(draftFilterKey);
      return;
    }

    if (draftDebounceRef.current) {
      clearTimeout(draftDebounceRef.current);
    }
    draftDebounceRef.current = setTimeout(() => {
      setDebouncedDraftKey(draftFilterKey);
    }, 400);

    return () => {
      if (draftDebounceRef.current) {
        clearTimeout(draftDebounceRef.current);
        draftDebounceRef.current = null;
      }
    };
  }, [appliedFilterKey, draftFilterKey]);

  useEffect(() => {
    if (debouncedDraftKey === appliedFilterKey) {
      setPreviewTotalItems(totalItems);
      setIsPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const [dQuery, dCategory, dPriceMin, dPriceMax, dInStock, dOnSale, dBrandIds] = debouncedDraftKey.split("|");
    const search = new URLSearchParams();
    if (dQuery) search.set("q", dQuery);
    if (dCategory) search.set("categoria", dCategory);
    if (dPriceMin && dPriceMin !== "null" && Number(dPriceMin) > 0) search.set("precioMin", dPriceMin);
    if (dPriceMax && dPriceMax !== "null") search.set("precioMax", dPriceMax);
    if (dInStock === "true") search.set("enStock", "1");
    if (dOnSale === "true") search.set("enOferta", "1");
    if (dBrandIds) {
      const slugs = dBrandIds
        .split(",")
        .map((brandId) => brandOptions.find((brand) => brand.id === brandId)?.slug)
        .filter((slug): slug is string => Boolean(slug));
      if (slugs.length > 0) search.set("marcas", slugs.join(","));
    }

    setIsPreviewLoading(true);
    fetch(`/api/catalog/count?${search.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("count request failed");
        return response.json() as Promise<{ totalItems: number }>;
      })
      .then((data) => {
        setPreviewTotalItems(data.totalItems);
        setIsPreviewLoading(false);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") return;
        setPreviewTotalItems(totalItems);
        setIsPreviewLoading(false);
      });

    return () => controller.abort();
  }, [debouncedDraftKey, appliedFilterKey, totalItems, brandOptions]);

  const updateDraft = useCallback((partial: Partial<FilterDraft>) => {
    setDraftState((prev) => ({ ...prev, ...partial }));
  }, []);

  const navigateCatalog = useCallback((url: string, closeMobileSheet = false) => {
    if (closeMobileSheet) setMobileOpen(false);
    setIsApplyingFilters(true);
    // start navigation; we rely on the effect that listens to `filters` prop to clear isApplyingFilters
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
    window.requestAnimationFrame(() => {
      const target = document.getElementById(catalogTopId);
      if (!target) return;

      const topOffset = 48;
      const nextTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - topOffset);
      window.scrollTo({
        top: nextTop,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
    // Safety fallback: clear the applying state after 8s if navigation didn't complete
    if (applyTimeoutRef.current) clearTimeout(applyTimeoutRef.current);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    applyTimeoutRef.current = window.setTimeout(() => {
      setIsApplyingFilters(false);
      applyTimeoutRef.current = null;
    }, 8000);
  }, [catalogTopId, reduceMotion, router]);

  const handleApply = useCallback(() => {
    navigateCatalog(buildCatalogUrl(actionPath, preservedRouteFilters, draft, brandOptions), true);
  }, [actionPath, brandOptions, draft, navigateCatalog, preservedRouteFilters]);

  const handleReset = useCallback(() => {
    navigateCatalog(buildCatalogUrl(actionPath, preservedRouteFilters, {
      sortBy: "recent",
      priceMin: null,
      priceMax: null,
      inStock: false,
      onSale: false,
      brandIds: [],
    }, brandOptions), true);
  }, [actionPath, brandOptions, navigateCatalog, preservedRouteFilters]);

  const handleInStockToggle = useCallback((v: boolean) => {
    setDraftState((prev) => ({ ...prev, inStock: v }));
  }, []);

  const handleOnSaleToggle = useCallback((v: boolean) => {
    setDraftState((prev) => ({ ...prev, onSale: v }));
  }, []);

  const handleSortChange = useCallback((value: PublicProductCatalogSort) => {
    setDraftState((prev) => ({ ...prev, sortBy: value }));
    navigateCatalog(
      buildCatalogUrl(actionPath, preservedRouteFilters, {
        sortBy: value,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        inStock: filters.inStock,
        onSale: filters.onSale,
        brandIds: filters.brandIds,
      }, brandOptions),
      mobileOpen,
    );
  }, [actionPath, brandOptions, filters.brandIds, filters.inStock, filters.onSale, filters.priceMax, filters.priceMin, mobileOpen, navigateCatalog, preservedRouteFilters]);

  const handleRemoveActiveFilter = useCallback(
    (key: "sort" | "price" | "inStock" | "onSale" | "brand", brandId?: string) => {
      const base: FilterDraft = {
        sortBy,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        inStock: filters.inStock,
        onSale: filters.onSale,
        brandIds: [...filters.brandIds],
        priceMinInput: filters.priceMin !== null ? String(filters.priceMin) : "",
        priceMaxInput: filters.priceMax !== null ? String(filters.priceMax) : "",
      };
      // Sort should apply instantly. Other removals should update the draft and wait for explicit Apply.
      if (key === "sort") {
        base.sortBy = "recent";
        navigateCatalog(buildCatalogUrl(actionPath, preservedRouteFilters, base, brandOptions));
        return;
      }

      // For other keys, update the draft only (no navigation). This keeps behavior consistent
      // with the UX: Ordenar applies instantly, other filters require clicking the Apply button.
      if (key === "price") {
        updateDraft({ priceMin: null, priceMax: null, priceMinInput: "", priceMaxInput: "" });
        return;
      }
      if (key === "inStock") {
        updateDraft({ inStock: false });
        return;
      }
      if (key === "onSale") {
        updateDraft({ onSale: false });
        return;
      }
      if (key === "brand" && brandId) {
        updateDraft({ brandIds: filters.brandIds.filter((id) => id !== brandId) });
        return;
      }
    },
    [actionPath, brandOptions, filters, navigateCatalog, preservedRouteFilters, sortBy],
  );

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const hasActiveFilters =
    sortBy !== "recent" ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.inStock ||
    filters.onSale ||
    filters.brandIds.length > 0;

  const activeFilterCount = [
    sortBy !== "recent",
    filters.priceMin !== null || filters.priceMax !== null,
    filters.inStock,
    filters.onSale,
    filters.brandIds.length > 0,
  ].filter(Boolean).length;

  const bodyProps: FilterBodyProps = {
    filters,
    sortBy,
    brandOptions,
    totalItems,
    previewTotalItems,
    isPreviewLoading,
    isApplyingFilters,
    openSections,
    draft,
    sliderMax: maxPrice,
    onToggleSection: toggleSection,
    onDraftChange: updateDraft,
    onApply: handleApply,
    onInStockToggle: handleInStockToggle,
    onOnSaleToggle: handleOnSaleToggle,
    onSortChange: handleSortChange,
    onRemoveActiveFilter: handleRemoveActiveFilter,
    onReset: handleReset,
  };

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside
        aria-label="Filtros de catalogo"
        className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 self-start sticky flex-col"
        style={{ top: "108px" }}
      >
        <div className="flex flex-col rounded-2xl border p-4 shadow-xs" style={{ background: "#0B5D1E08", borderColor: "#0B5D1E69" }}>
          <FilterBody {...bodyProps} />
        </div>
      </aside>

      {/* Mobile floating trigger */}
      <AnimatePresence>
        {!mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
            className="fixed bottom-6 left-0 right-0 z-sticky flex justify-center lg:hidden"
          >
            <motion.button
              type="button"
              onClick={() => setMobileOpen(true)}
              {...(!reduceMotion && { whileTap: { scale: motionTokens.scale.press } })}
              aria-label="Abrir filtros"
              className="inline-flex items-center gap-2 rounded-pill bg-neutral-900 px-5 py-3.5 text-label-md text-text-inverse shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <SlidersHorizontal size={16} strokeWidth={1.8} aria-hidden="true" />
              Filtrar
              {hasActiveFilters && (
                <span
                  aria-label={`${activeFilterCount} filtros activos`}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-label-sm text-text-inverse"
                >
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar filtros"
              className="fixed inset-0 z-overlay block border-0 bg-transparent p-0 lg:hidden"
            >
              <motion.span
                variants={{
                  hidden: {
                    opacity: 0,
                    transition: reduceMotion
                      ? { duration: 0 }
                      : { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
                  },
                  visible: {
                    opacity: 1,
                    transition: reduceMotion
                      ? { duration: 0 }
                      : { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
              />
              <motion.span
                variants={{
                  hidden: {
                    opacity: 0,
                    transition: reduceMotion
                      ? { duration: 0 }
                      : { duration: motionTokens.duration.fast, ease: motionTokens.ease.exit },
                  },
                  visible: {
                    opacity: 1,
                    transition: reduceMotion
                      ? { duration: 0 }
                      : { duration: motionTokens.duration.slow, ease: motionTokens.ease.soft },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-0 backdrop-blur-[2px]"
                aria-hidden="true"
              />
            </button>

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros de catalogo"
              variants={{
                hidden: {
                  y: "100%",
                  transition: reduceMotion
                    ? { duration: 0 }
                    : { duration: motionTokens.duration.base, ease: motionTokens.ease.exit },
                },
                visible: {
                  y: 0,
                  transition: reduceMotion
                    ? { duration: 0 }
                    : { duration: motionTokens.duration.emphasis, ease: motionTokens.ease.soft },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed bottom-0 left-0 right-0 z-modal flex flex-col rounded-none bg-surface-canvas shadow-lg lg:hidden"
              style={{ maxHeight: "85dvh", willChange: "transform" }}
            >
              <div className="flex shrink-0 justify-center pb-1 pt-3">
                <div className="h-1 w-10 rounded-full bg-border-default" aria-hidden="true" />
              </div>

              <div className="flex shrink-0 items-center justify-end px-5 pb-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar filtros"
                  className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6">
                <FilterBody {...bodyProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
