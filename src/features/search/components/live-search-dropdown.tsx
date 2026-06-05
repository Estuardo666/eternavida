import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { LiveSearchBrandItem } from "@/features/search/components/live-search-brand-item";
import { LiveSearchCategoryItem } from "@/features/search/components/live-search-category-item";
import { LiveSearchProductItem } from "@/features/search/components/live-search-product-item";
import type {
  LiveSearchBrandResult,
  LiveSearchCategoryResult,
  LiveSearchProductResult,
  LiveSearchResults,
} from "@/features/search/types";
import { cx } from "@/lib/utils";

interface LiveSearchDropdownProps {
  className?: string;
  listId: string;
  query: string;
  results: LiveSearchResults;
  isLoading: boolean;
  error: string | null;
  activeIndex: number;
  onCategoryHover: (index: number) => void;
  onBrandHover: (index: number) => void;
  onProductHover: (index: number) => void;
  onViewAllHover: () => void;
  onCategorySelect: (category: LiveSearchCategoryResult) => void;
  onBrandSelect: (brand: LiveSearchBrandResult) => void;
  onProductSelect: (product: LiveSearchProductResult) => void;
  onViewAllSelect: () => void;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const dropdownTransition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-2 rounded-[24px] border border-border-soft bg-surface-subtle px-4 py-4">
      <div className="h-4 w-28 animate-pulse rounded-full bg-surface-soft" />
      <div className="h-12 animate-pulse rounded-[20px] bg-surface-canvas" />
      <div className="h-12 animate-pulse rounded-[20px] bg-surface-canvas" />
      <div className="h-12 animate-pulse rounded-[20px] bg-surface-canvas" />
    </div>
  );
}

export function LiveSearchDropdown({
  className,
  listId,
  query,
  results,
  isLoading,
  error,
  activeIndex,
  onCategoryHover,
  onBrandHover,
  onProductHover,
  onViewAllHover,
  onCategorySelect,
  onBrandSelect,
  onProductSelect,
  onViewAllSelect,
}: LiveSearchDropdownProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const trimmedQuery = query.trim();
  const categoryCount = results.categories.length;
  const brandCount = results.brands.length;
  const productCount = results.products.length;
  const brandOffset = categoryCount;
  const productOffset = categoryCount + brandCount;
  const viewAllIndex = categoryCount + brandCount + productCount;
  const hasResults = categoryCount > 0 || brandCount > 0 || productCount > 0;
  const showPrompt = trimmedQuery.length > 0 && trimmedQuery.length < 2;
  const showViewAll = trimmedQuery.length >= 2;
  const showEmptyState = !isLoading && !error && !hasResults && showViewAll;
  const dropdownMotionProps = reduceMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        exit: "hidden" as const,
        variants: dropdownVariants,
        transition: dropdownTransition,
      };
  const listAnimationProps = reduceMotion
    ? {}
    : { initial: "hidden" as const, animate: "visible" as const, variants: listVariants };
  const itemAnimationProps = reduceMotion ? {} : { variants: itemVariants };

  return (
    <motion.div
      {...dropdownMotionProps}
      className={cx(
        "rounded-[28px] border border-brand-primary/40 bg-surface-canvas/98 p-3 backdrop-blur md:p-4",
        className,
      )}
    >
      <div role="listbox" id={listId} aria-label="Sugerencias de busqueda" className="space-y-3">
        {showPrompt ? (
          <div className="rounded-[24px] border border-dashed border-border-soft bg-surface-subtle px-4 py-5 text-center">
            <p className="text-body-sm text-text-primary">Escribe al menos 2 caracteres para buscar.</p>
          </div>
        ) : null}

        {isLoading ? <LoadingSkeleton /> : null}

        {!isLoading && error ? (
          <div className="rounded-[24px] border border-border-soft bg-surface-subtle px-4 py-5 text-center">
            <p className="text-body-sm text-text-primary">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && hasResults ? (
          <>
            {categoryCount > 0 ? (
              <section className="space-y-2">
                <p className="px-1 text-label-sm uppercase tracking-[0.12em] text-text-muted">Categorias</p>
                <motion.div className="space-y-1" {...listAnimationProps}>
                  {results.categories.map((category, index) => (
                    <motion.div key={category.id} {...itemAnimationProps}>
                      <LiveSearchCategoryItem
                        id={`${listId}-option-${index}`}
                        category={category}
                        isActive={activeIndex === index}
                        onInteract={() => onCategoryHover(index)}
                        onSelect={() => onCategorySelect(category)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            ) : null}

            {brandCount > 0 ? (
              <section className="space-y-2">
                <p className="px-1 text-label-sm uppercase tracking-[0.12em] text-text-muted">Marcas</p>
                <motion.div className="space-y-1" {...listAnimationProps}>
                  {results.brands.map((brand, index) => {
                    const optionIndex = brandOffset + index;

                    return (
                      <motion.div key={brand.id} {...itemAnimationProps}>
                        <LiveSearchBrandItem
                          id={`${listId}-option-${optionIndex}`}
                          brand={brand}
                          isActive={activeIndex === optionIndex}
                          onInteract={() => onBrandHover(optionIndex)}
                          onSelect={() => onBrandSelect(brand)}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>
            ) : null}

            {productCount > 0 ? (
              <section className="space-y-2">
                <p className="px-1 text-label-sm uppercase tracking-[0.12em] text-text-muted">Productos</p>
                <motion.div className="space-y-1" {...listAnimationProps}>
                  {results.products.map((product, index) => {
                    const optionIndex = productOffset + index;

                    return (
                      <motion.div key={product.id} {...itemAnimationProps}>
                        <LiveSearchProductItem
                          id={`${listId}-option-${optionIndex}`}
                          product={product}
                          isActive={activeIndex === optionIndex}
                          onInteract={() => onProductHover(optionIndex)}
                          onSelect={() => onProductSelect(product)}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </section>
            ) : null}
          </>
        ) : null}

        {showEmptyState ? (
          <div className="rounded-[24px] border border-dashed border-border-soft bg-surface-subtle px-4 py-5 text-center">
            <p className="text-body-sm text-text-primary">No encontramos resultados para "{trimmedQuery}".</p>
            <p className="mt-1 text-body-sm text-text-muted">Presiona Enter para buscar en todo el catalogo.</p>
          </div>
        ) : null}

        {showViewAll ? (
          <>
            {(hasResults || isLoading || error || showEmptyState) ? (
              <div className="border-t border-border-soft" aria-hidden="true" />
            ) : null}
            <motion.div {...itemAnimationProps}>
              <button
                id={`${listId}-option-${viewAllIndex}`}
                type="button"
                role="option"
                aria-selected={activeIndex === viewAllIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={onViewAllHover}
                onFocus={onViewAllHover}
                onClick={onViewAllSelect}
                className={cx(
                  "flex w-full items-center justify-between gap-3 rounded-[22px] border border-transparent px-3.5 py-3 text-left transition-[background-color,border-color] duration-[180ms] ease-soft hover:border-brand-primary/30 hover:bg-brand-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
                  activeIndex === viewAllIndex && "border-brand-primary/35 bg-brand-primary/[0.1]",
                )}
              >
                <div>
                  <p className="text-label-md text-text-primary">Ver todos los resultados</p>
                  <p className="mt-1 text-body-sm text-text-muted">Ir al catalogo con "{trimmedQuery}"</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}