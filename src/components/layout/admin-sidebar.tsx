"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_PANEL_SURFACE_CLASS_NAME } from "@/components/admin/surface-styles";
import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

interface AdminSidebarProps {
  userEmail: string;
  userRole: string;
  userImageUrl?: string | undefined;
}

type NavigationItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
};

const primaryNavigation: ReadonlyArray<NavigationItem> = [
  {
    href: "/admin/leads",
    label: "Leads",
    icon: LeadsIcon,
  },
  {
    href: "/admin/content/home",
    label: "Home pública",
    icon: HomeIcon,
  },
  {
    href: "/admin/media",
    label: "Biblioteca de medios",
    icon: MediaLibraryIcon,
  },
] as const;

const catalogNavigation: ReadonlyArray<NavigationItem> = [
  {
    href: "/admin/catalog/categories",
    label: "Categorías",
    icon: CategoriesIcon,
  },
  {
    href: "/admin/catalog/products",
    label: "Productos",
    icon: ProductsIcon,
  },
  {
    href: "/admin/catalog/brands",
    label: "Marcas",
    icon: BrandIcon,
  },
  {
    href: "/admin/catalog/badges",
    label: "Badges",
    icon: TagIcon,
  },
  {
    href: "/admin/catalog/promotions",
    label: "Promociones",
    icon: PromotionIcon,
  },
] as const;

const navigationSections: ReadonlyArray<{
  id: string;
  label: string;
  items: ReadonlyArray<NavigationItem>;
}> = [
  {
    id: "general",
    label: "General",
    items: primaryNavigation,
  },
  {
    id: "catalog",
    label: "Catálogo",
    items: catalogNavigation,
  },
] as const;

const sidebarEaseEnter = [0.2, 0.9, 0.24, 1] as const;
const sidebarEaseExit = [0.45, 0.05, 0.22, 1] as const;
const sidebarWidthDuration = 0.52;
const sidebarContentDuration = 0.42;
const sidebarMobileDuration = 0.4;

const desktopPanelTransition = {
  duration: sidebarContentDuration,
  ease: sidebarEaseEnter,
} as const;

const railReveal: Variants = {
  initial: { opacity: 0, x: -motionTokens.distance.sm, scale: 0.985 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: motionTokens.duration.slow, ease: sidebarEaseEnter },
  },
  exit: {
    opacity: 0,
    x: -motionTokens.distance.xs,
    scale: 0.985,
    transition: { duration: sidebarContentDuration, ease: sidebarEaseExit },
  },
};

const panelReveal: Variants = {
  initial: { opacity: 0, x: -motionTokens.distance.md, scale: 0.985 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: motionTokens.duration.slow,
      ease: sidebarEaseEnter,
    },
  },
  exit: {
    opacity: 0,
    x: -motionTokens.distance.xs,
    scale: 0.985,
    transition: {
      duration: motionTokens.duration.base,
      ease: sidebarEaseExit,
    },
  },
};

const navListReveal: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

const navItemReveal: Variants = {
  initial: { opacity: 0, y: motionTokens.distance.xs },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.ease.standard,
    },
  },
};

const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: sidebarMobileDuration,
      ease: sidebarEaseEnter,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: sidebarMobileDuration,
      ease: sidebarEaseExit,
    },
  },
};

const mobileDrawerReveal: Variants = {
  initial: { opacity: 0, x: -motionTokens.distance.drawer, scale: 0.99 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: sidebarMobileDuration,
      ease: sidebarEaseEnter,
    },
  },
  exit: {
    opacity: 0,
    x: -motionTokens.distance.lg,
    scale: 0.99,
    transition: {
      duration: sidebarMobileDuration,
      ease: sidebarEaseExit,
    },
  },
};

const sectionAccordionReveal: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    y: -motionTokens.distance.micro,
    transition: {
      opacity: { duration: 0.16 },
      height: { duration: 0.2, ease: motionTokens.ease.exit },
      y: { duration: 0.16 },
    },
  },
  expanded: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      opacity: { duration: 0.2, delay: 0.02 },
      height: { duration: motionTokens.duration.slow, ease: sidebarEaseEnter },
      y: { duration: 0.24, ease: sidebarEaseEnter },
    },
  },
};

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSectionActive(
  pathname: string,
  items: ReadonlyArray<NavigationItem>,
): boolean {
  return items.some((item) => isActivePath(pathname, item.href));
}

function NavigationLink(props: NavigationItem & {
  pathname: string;
  compact?: boolean;
}) {
  const isActive = isActivePath(props.pathname, props.href);
  const Icon = props.icon;
  const linkClasses = cx(
    props.compact
      ? "group flex h-12 w-12 items-center justify-center rounded-2xl border transition-[background-color,border-color,color,transform] duration-[200ms] ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
      : "group flex min-h-[3.25rem] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-[background-color,border-color,color,transform] duration-[200ms] ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas sm:min-h-14 sm:px-4",
    isActive
      ? "border-border-brand bg-surface-brandTint text-text-primary shadow-sm"
      : "border-border-soft bg-surface-canvas text-text-secondary hover:border-border-default hover:bg-surface-subtle hover:text-text-primary",
  );

  if (props.compact) {
    return (
      <div className="group/tooltip relative">
        <Link
          href={props.href}
          aria-current={isActive ? "page" : undefined}
          aria-label={props.label}
          className={linkClasses}
        >
          <Icon className={cx("h-5 w-5", isActive ? "text-text-brand" : "text-current")} />
          <span className="sr-only">{props.label}</span>
        </Link>

        <span
          role="tooltip"
          className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-20 -translate-y-1/2 rounded-full border border-border-soft bg-surface-canvas px-3 py-1.5 text-label-sm text-text-primary opacity-0 shadow-sm transition-[opacity,transform] duration-[180ms] ease-soft group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
        >
          {props.label}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={props.href}
      aria-current={isActive ? "page" : undefined}
      className={linkClasses}
    >
      <Icon className={cx("h-5 w-5 shrink-0", isActive ? "text-text-brand" : "text-current")} />
      <span className="min-w-0 flex-1 text-label-md text-current">{props.label}</span>
    </Link>
  );
}

export function AdminSidebar({ userEmail, userRole, userImageUrl }: AdminSidebarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    catalog: true,
  });

  const navigationItems = useMemo(
    () => navigationSections.flatMap((section) => section.items),
    [],
  );
  const activeItem = navigationItems.find((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const activeSection = navigationSections.find((section) =>
      section.items.some((item) => item.href === activeItem.href),
    );

    if (!activeSection) {
      return;
    }

    setOpenSections((current) => ({
      ...current,
      [activeSection.id]: true,
    }));
  }, [activeItem]);

  const desktopInitial = reduceMotion ? false : "initial";

  return (
    <>
      <aside className="w-full shrink-0 lg:hidden">
        <div className={`flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 ${ADMIN_PANEL_SURFACE_CLASS_NAME}`}>
          <div className="min-w-0">
            <p className="truncate text-label-md text-text-primary">{activeItem?.label ?? "Dermatologika"}</p>
          </div>

          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="admin-sidebar-mobile-drawer"
            onClick={() => setIsMobileOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-subtle text-text-primary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-default hover:bg-surface-brandTint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Abrir navegacion</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar navegacion"
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              initial={reduceMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={backdropFade}
              onClick={() => setIsMobileOpen(false)}
            />

            <motion.aside
              id="admin-sidebar-mobile-drawer"
              initial={reduceMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={mobileDrawerReveal}
              className="fixed inset-y-3 left-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-[#d9e5d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,245,0.98))] shadow-[0_28px_60px_-32px_rgba(28,56,41,0.38)] sm:inset-y-4 sm:left-4 sm:w-[min(22rem,calc(100vw-2rem))] sm:rounded-[30px] lg:hidden"
            >
              <SidebarPanel
                pathname={pathname}
                openSections={openSections}
                onSectionToggle={(sectionId, nextOpen) =>
                  setOpenSections((current) => ({
                    ...current,
                    [sectionId]: nextOpen,
                  }))
                }
                onCollapseToggle={() => setIsMobileOpen(false)}
                userEmail={userEmail}
                userRole={userRole}
                userImageUrl={userImageUrl}
                reduceMotion={reduceMotion}
                collapseLabel="Cerrar"
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="hidden shrink-0 lg:sticky lg:top-6 lg:block lg:self-start">
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 84 : 296 }}
          transition={reduceMotion
            ? { duration: 0 }
            : {
                duration: sidebarWidthDuration,
                ease: sidebarEaseEnter,
              }}
          className="overflow-visible"
        >
          {isCollapsed ? (
            <motion.div
              key="collapsed-rail"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion
                ? { duration: 0 }
                : {
                    duration: sidebarContentDuration,
                    ease: sidebarEaseEnter,
                  }}
              className="flex w-full flex-col items-center gap-3 rounded-[28px] border border-[#d9e5d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,246,0.98))] px-3 py-3 shadow-[0_20px_44px_-34px_rgba(28,56,41,0.34)]"
            >
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-brand bg-surface-brandTint text-text-brand transition-[transform,background-color,border-color,color] duration-[200ms] ease-soft hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                title="Expandir sidebar"
                aria-label="Expandir sidebar"
              >
                <Image
                  src="/logotipo.png"
                  alt="Dermatologika"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  priority
                />
              </button>

              <motion.nav
                aria-label="Accesos rapidos del backend"
                initial={desktopInitial}
                animate="animate"
                variants={navListReveal}
                className="flex w-full flex-1 flex-col items-center gap-3"
              >
                {navigationItems.map((item) => (
                  <motion.div key={item.href} variants={navItemReveal}>
                    <NavigationLink {...item} pathname={pathname} compact />
                  </motion.div>
                ))}
              </motion.nav>

              <div className="mt-auto flex w-full flex-col items-center gap-3 border-t border-border-soft pt-4">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-subtle text-text-secondary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-default hover:bg-surface-canvas hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                  title="Expandir panel"
                  aria-label="Expandir panel"
                >
                  <PanelToggleIcon className={cx("h-5 w-5 transition-transform duration-[200ms] ease-soft", "rotate-180")} />
                </button>

                <Link
                  href="/admin/profile"
                  aria-label="Mi perfil"
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border-soft bg-surface-subtle text-label-md text-text-primary transition-[background-color,border-color] duration-[200ms] ease-soft hover:border-border-brand hover:bg-surface-brandTint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  {userImageUrl ? (
                    <Image src={userImageUrl} alt={userEmail} width={44} height={44} className="h-full w-full object-cover" />
                  ) : (
                    userEmail.slice(0, 1).toUpperCase()
                  )}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-panel"
              initial={reduceMotion ? false : { opacity: 0, x: -8, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={reduceMotion
                ? { duration: 0 }
                : {
                    duration: sidebarContentDuration,
                    ease: sidebarEaseEnter,
                  }}
              className="w-full"
            >
              <SidebarPanel
                pathname={pathname}
                openSections={openSections}
                onSectionToggle={(sectionId, nextOpen) =>
                  setOpenSections((current) => ({
                    ...current,
                    [sectionId]: nextOpen,
                  }))
                }
                onCollapseToggle={() => setIsCollapsed(true)}
                userEmail={userEmail}
                userRole={userRole}
                userImageUrl={userImageUrl}
                reduceMotion={reduceMotion}
                collapseLabel="Ocultar"
              />
            </motion.div>
          )}
        </motion.div>
      </aside>
    </>
  );
}

function SidebarPanel(props: {
  pathname: string;
  openSections: Record<string, boolean>;
  onSectionToggle: (sectionId: string, nextOpen: boolean) => void;
  onCollapseToggle: () => void;
  userEmail: string;
  userRole: string;
  userImageUrl?: string | undefined;
  reduceMotion: boolean;
  collapseLabel: string;
}) {
  return (
    <div className="flex h-full w-full flex-col rounded-[28px] border border-[#d9e5d5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,246,0.98))] p-3.5 shadow-[0_24px_52px_-36px_rgba(28,56,41,0.36)] sm:rounded-[30px] sm:p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border-soft pb-3.5 sm:pb-4">
        <div className="space-y-3">
          <Image
            src="/logotipo.png"
            alt="Dermatologika"
            width={144}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>

        <button
          type="button"
          onClick={props.onCollapseToggle}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-subtle text-text-secondary transition-[background-color,border-color,color] duration-[200ms] ease-soft hover:border-border-default hover:bg-surface-canvas hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
        >
          <PanelToggleIcon className="h-5 w-5" />
          <span className="sr-only">{props.collapseLabel}</span>
        </button>
      </div>

      <motion.nav
        aria-label="Navegacion principal del backend"
        initial={props.reduceMotion ? false : "initial"}
        animate="animate"
        variants={navListReveal}
        className="mt-4 flex-1 space-y-3.5 sm:mt-5 sm:space-y-4"
      >
        {navigationSections.map((section) => {
          const sectionActive = isSectionActive(props.pathname, section.items);
          const isOpen = props.openSections[section.id] ?? true;

          return (
            <motion.section
              key={section.id}
              variants={navItemReveal}
              className={cx(
                "rounded-[22px] border p-2.5 transition-[background-color,border-color,box-shadow] duration-[200ms] ease-soft sm:rounded-[24px] sm:p-3",
                sectionActive
                  ? "border-border-brand bg-surface-brandTint/60 shadow-[0_16px_34px_-28px_rgba(32,92,76,0.4)]"
                  : "border-border-soft bg-surface-subtle",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => props.onSectionToggle(section.id, !isOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl px-1 py-1 text-left transition-[color] duration-[200ms] ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
              >
                <div className="flex items-center gap-2">
                  <span className="text-label-sm uppercase tracking-[0.16em] text-ink-900">{section.label}</span>
                </div>

                <span
                  aria-hidden="true"
                  className={cx(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft bg-surface-canvas text-text-secondary transition-[transform,background-color,border-color,color] duration-[200ms] ease-soft",
                    isOpen ? "rotate-0" : "-rotate-90",
                  )}
                >
                  <ChevronIcon className="h-4 w-4" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={props.reduceMotion ? false : "collapsed"}
                    animate="expanded"
                    exit="collapsed"
                    variants={sectionAccordionReveal}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {section.items.map((item) => (
                        <NavigationLink key={item.href} {...item} pathname={props.pathname} />
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.section>
          );
        })}
      </motion.nav>

      <Link
        href="/admin/profile"
        className="mt-4 flex items-center gap-3 rounded-[22px] border border-border-soft bg-surface-subtle p-3 transition-[background-color,border-color] duration-[200ms] ease-soft hover:border-border-brand hover:bg-surface-brandTint sm:mt-5 sm:rounded-[24px]"
      >
        <div className="flex h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border-soft bg-surface-canvas text-label-md text-text-primary">
          {props.userImageUrl ? (
            <Image src={props.userImageUrl} alt={props.userEmail} width={44} height={44} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              {props.userEmail.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-sm text-text-primary">{props.userEmail}</p>
          <p className="truncate text-body-sm text-text-secondary">{props.userRole}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted">
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

function MenuIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M5 7H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 17H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PanelToggleIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeadsIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <rect x="4" y="5" width="16" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M5 11.5L12 6L19 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.5V18H16.5V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoriesIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ProductsIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M12 4L19 8V16L12 20L5 16V8L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5 8L12 12L19 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 12V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BrandIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M5 19V8.8C5 7.81 5.81 7 6.8 7H17.2C18.19 7 19 7.81 19 8.8V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5.6C9 4.72 9.72 4 10.6 4H13.4C14.28 4 15 4.72 15 5.6V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 12H15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M20 10.5 13 3.5H5v8l7 7 8-8Z" />
      <circle cx="8.5" cy="8.5" r="1.25" />
    </svg>
  );
}

function PromotionIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M7 6.5H17" />
      <path d="M7 12H17" />
      <path d="M7 17.5H13" />
      <path d="M4.5 4.5H19.5V19.5H4.5Z" />
    </svg>
  );
}

function MediaLibraryIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}