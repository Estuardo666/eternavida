"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { LiveSearchDropdown } from "@/features/search/components/live-search-dropdown";
import { LiveSearchTrigger } from "@/features/search/components/live-search-trigger";
import { useLiveSearch } from "@/features/search/hooks/use-live-search";
import { cx } from "@/lib/utils";

type SearchOption =
  | { type: "category"; href: string }
  | { type: "brand"; href: string }
  | { type: "product"; href: string }
  | { type: "viewAll"; href: string };

const MAX_VISIBLE_RESULTS = 6;

const overlayTransition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export function LiveSearch() {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const listId = useId();
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const { query, setQuery, results, isLoading, error, clear } = useLiveSearch();

  const trimmedQuery = query.trim();
  const visibleCategories = useMemo(
    () => results.categories.slice(0, Math.min(results.categories.length, MAX_VISIBLE_RESULTS)),
    [results.categories],
  );
  const visibleBrands = useMemo(() => {
    const remainingSlots = Math.max(MAX_VISIBLE_RESULTS - visibleCategories.length, 0);

    if (remainingSlots === 0) {
      return [];
    }

    return results.brands.slice(0, remainingSlots);
  }, [results.brands, visibleCategories.length]);
  const visibleProducts = useMemo(() => {
    const remainingSlots = Math.max(MAX_VISIBLE_RESULTS - visibleCategories.length - visibleBrands.length, 0);

    if (remainingSlots === 0) {
      return [];
    }

    return results.products.slice(0, remainingSlots);
  }, [results.products, visibleBrands.length, visibleCategories.length]);
  const hasResults = visibleCategories.length > 0 || visibleBrands.length > 0 || visibleProducts.length > 0;
  const isOpen = isDesktopOpen || isMobileOpen;
  const shouldRenderDropdown = isOpen && (trimmedQuery.length > 0 || isLoading || error !== null || hasResults);
  const searchHref = trimmedQuery.length > 0
    ? `/productos?q=${encodeURIComponent(trimmedQuery)}`
    : "/productos";
  const activeDescendantId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  const options = useMemo<SearchOption[]>(() => {
    const nextOptions: SearchOption[] = [
      ...visibleCategories.map((category) => ({ type: "category" as const, href: category.href })),
      ...visibleBrands.map((brand) => ({ type: "brand" as const, href: brand.href })),
      ...visibleProducts.map((product) => ({ type: "product" as const, href: product.href })),
    ];

    if (trimmedQuery.length >= 2) {
      nextOptions.push({ type: "viewAll", href: searchHref });
    }

    return nextOptions;
  }, [searchHref, trimmedQuery.length, visibleBrands, visibleCategories, visibleProducts]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isDesktopOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (desktopContainerRef.current?.contains(target)) {
        return;
      }

      setIsDesktopOpen(false);
      setActiveIndex(-1);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isDesktopOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      if (options.length === 0) {
        return -1;
      }

      return currentIndex >= options.length ? options.length - 1 : currentIndex;
    });
  }, [options.length]);

  useEffect(() => {
    if (isDesktopOpen) {
      desktopInputRef.current?.focus();
    }
  }, [isDesktopOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      mobileInputRef.current?.focus();
    }
  }, [isMobileOpen]);

  function openDesktop() {
    setIsMobileOpen(false);
    setIsDesktopOpen(true);
  }

  function closeDesktop(returnFocus = false) {
    setIsDesktopOpen(false);
    setActiveIndex(-1);

    if (returnFocus) {
      requestAnimationFrame(() => {
        desktopInputRef.current?.focus();
      });
    }
  }

  function openMobile() {
    setIsDesktopOpen(false);
    setIsMobileOpen(true);
  }

  function closeMobile() {
    setIsMobileOpen(false);
    setActiveIndex(-1);

    requestAnimationFrame(() => {
      mobileTriggerRef.current?.focus();
    });
  }

  function closeSearch() {
    setIsDesktopOpen(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);
  }

  function navigateTo(href: string) {
    closeSearch();
    clear();
    router.push(href);
  }

  function selectOption(index: number) {
    const option = options[index];

    if (!option) {
      if (trimmedQuery.length > 0) {
        navigateTo(searchHref);
      }
      return;
    }

    navigateTo(option.href);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown": {
        if (options.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex((currentIndex) => (currentIndex + 1 + options.length) % options.length);
        break;
      }

      case "ArrowUp": {
        if (options.length === 0) {
          return;
        }

        event.preventDefault();
        setActiveIndex((currentIndex) => {
          if (currentIndex < 0) {
            return options.length - 1;
          }

          return (currentIndex - 1 + options.length) % options.length;
        });
        break;
      }

      case "Enter": {
        if (trimmedQuery.length === 0) {
          return;
        }

        event.preventDefault();

        if (activeIndex >= 0) {
          selectOption(activeIndex);
          return;
        }

        navigateTo(searchHref);
        break;
      }

      case "Escape": {
        if (!isOpen) {
          return;
        }

        event.preventDefault();

        if (isMobileOpen) {
          closeMobile();
          return;
        }

        closeDesktop(true);
        break;
      }

      default:
        break;
    }
  }

  function handleContainerKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();

    if (isMobileOpen) {
      closeMobile();
      return;
    }

    if (isDesktopOpen) {
      closeDesktop(true);
    }
  }

  function handleDesktopBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && desktopContainerRef.current?.contains(nextTarget)) {
      return;
    }

    setIsDesktopOpen(false);
    setActiveIndex(-1);
  }

  return (
    <>
      <div
        ref={desktopContainerRef}
        onBlurCapture={handleDesktopBlur}
        onKeyDownCapture={handleContainerKeyDown}
        className="relative hidden md:flex md:justify-center"
      >
        <LiveSearchTrigger
          className={cx("w-full", isDesktopOpen ? "max-w-[42rem]" : "max-w-[18rem]")}
          query={query}
          isOpen={isDesktopOpen}
          isLoading={isLoading}
          controlsId={listId}
          activeDescendantId={activeDescendantId}
          inputRef={desktopInputRef}
          onChange={setQuery}
          onFocus={openDesktop}
          onOpen={openDesktop}
          onKeyDown={handleInputKeyDown}
        />

        <AnimatePresence>
          {isDesktopOpen && shouldRenderDropdown ? (
            <LiveSearchDropdown
              className="absolute left-1/2 top-[calc(100%+0.75rem)] z-[55] w-full max-w-[42rem] -translate-x-1/2"
              listId={listId}
              query={query}
              results={{ categories: visibleCategories, brands: visibleBrands, products: visibleProducts }}
              isLoading={isLoading}
              error={error}
              activeIndex={activeIndex}
              onCategoryHover={setActiveIndex}
              onBrandHover={setActiveIndex}
              onProductHover={setActiveIndex}
              onViewAllHover={() => setActiveIndex(visibleCategories.length + visibleBrands.length + visibleProducts.length)}
              onCategorySelect={(category) => navigateTo(category.href)}
              onBrandSelect={(brand) => navigateTo(brand.href)}
              onProductSelect={(product) => navigateTo(product.href)}
              onViewAllSelect={() => navigateTo(searchHref)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {isMounted ? createPortal(
        <AnimatePresence>
          {isDesktopOpen ? (
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : overlayTransition}
              onClick={closeSearch}
              className="fixed inset-0 z-dropdown hidden bg-ink-900/10 backdrop-blur-sm md:block"
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>,
        document.body,
      ) : null}

      <div className="md:hidden">
        <LiveSearchTrigger
          query={query}
          isOpen={false}
          isLoading={isLoading}
          controlsId={listId}
          inputRef={mobileInputRef}
          buttonRef={mobileTriggerRef}
          mobile
          onChange={setQuery}
          onFocus={openMobile}
          onOpen={openMobile}
          onKeyDown={handleInputKeyDown}
        />

        {isMounted ? createPortal(
          <AnimatePresence>
            {isMobileOpen ? (
              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : overlayTransition}
                className="fixed inset-0 z-modal md:hidden"
                onKeyDownCapture={handleContainerKeyDown}
              >
                <motion.button
                  type="button"
                  aria-label="Cerrar busqueda"
                  onClick={closeMobile}
                  className="absolute inset-0 backdrop-blur-sm"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, backgroundColor: "rgba(18,18,18,0)" }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, backgroundColor: "rgba(18,18,18,0.12)" }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, backgroundColor: "rgba(18,18,18,0)" }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                  animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                  transition={reduceMotion ? { duration: 0 } : overlayTransition}
                  className="relative z-10 px-4 pt-4"
                >
                  <div className="mx-auto flex max-w-xl flex-col gap-3">
                    <LiveSearchTrigger
                      query={query}
                      isOpen={isMobileOpen}
                      isLoading={isLoading}
                      controlsId={listId}
                      activeDescendantId={activeDescendantId}
                      inputRef={mobileInputRef}
                      mobile
                      onChange={setQuery}
                      onFocus={openMobile}
                      onOpen={openMobile}
                      onClose={closeMobile}
                      onKeyDown={handleInputKeyDown}
                    />

                    {shouldRenderDropdown ? (
                      <LiveSearchDropdown
                        className="max-h-[calc(100vh-8rem)] overflow-y-auto"
                        listId={listId}
                        query={query}
                        results={{ categories: visibleCategories, brands: visibleBrands, products: visibleProducts }}
                        isLoading={isLoading}
                        error={error}
                        activeIndex={activeIndex}
                        onCategoryHover={setActiveIndex}
                        onBrandHover={setActiveIndex}
                        onProductHover={setActiveIndex}
                        onViewAllHover={() => setActiveIndex(visibleCategories.length + visibleBrands.length + visibleProducts.length)}
                        onCategorySelect={(category) => navigateTo(category.href)}
                        onBrandSelect={(brand) => navigateTo(brand.href)}
                        onProductSelect={(product) => navigateTo(product.href)}
                        onViewAllSelect={() => navigateTo(searchHref)}
                      />
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        ) : null}
      </div>
    </>
  );
}