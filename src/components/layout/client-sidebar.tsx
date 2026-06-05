"use client";

import { useState } from "react";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Globe,
  UserPlus,
  Shield,
  Menu,
  ChevronLeft,
  ChevronDown,
  Settings,
} from "lucide-react";

import { cx } from "@/lib/utils";
import { motionTokens } from "@/motion/tokens";

interface ClientSidebarProps {
  userEmail: string;
  userName: string;
  userImageUrl?: string | undefined;
}

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const accountNavigation: ReadonlyArray<NavigationItem> = [
  { href: "/cuenta/perfil", label: "Mi perfil", icon: User },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: ShoppingBag },
  { href: "/cuenta/direcciones", label: "Mis direcciones", icon: MapPin },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cuenta/suscripciones", label: "Suscripciones", icon: Globe },
  { href: "/cuenta/referidos", label: "Referidos", icon: UserPlus },
  { href: "/cuenta/privacidad", label: "Privacidad", icon: Shield },
] as const;

const navigationSections: ReadonlyArray<{
  id: string;
  label: string;
  items: ReadonlyArray<NavigationItem>;
}> = [
  { id: "cuenta", label: "Mi cuenta", items: accountNavigation },
] as const;

const sidebarEaseEnter = [0.2, 0.9, 0.24, 1] as const;
const sidebarEaseExit = [0.45, 0.05, 0.22, 1] as const;
const sidebarWidthDuration = 0.52;
const sidebarContentDuration = 0.42;
const sidebarMobileDuration = 0.4;

const navListReveal: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

const navItemReveal: Variants = {
  initial: { opacity: 0, y: motionTokens.distance.xs },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
  },
};

const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: sidebarMobileDuration, ease: sidebarEaseEnter } },
  exit: { opacity: 0, transition: { duration: sidebarMobileDuration, ease: sidebarEaseExit } },
};

const mobileDrawerReveal: Variants = {
  initial: { opacity: 0, x: -motionTokens.distance.drawer, scale: 0.99 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: sidebarMobileDuration, ease: sidebarEaseEnter } },
  exit: { opacity: 0, x: -motionTokens.distance.lg, scale: 0.99, transition: { duration: sidebarMobileDuration, ease: sidebarEaseExit } },
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

function NavigationLink(props: NavigationItem & { pathname: string; compact?: boolean }) {
  const isActive = isActivePath(props.pathname, props.href);
  const Icon = props.icon;
  const linkClasses = cx(
    props.compact
      ? "group flex h-10 w-10 items-center justify-center rounded-lg transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
      : "group relative flex min-h-[2.125rem] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
    isActive
      ? props.compact
        ? "bg-brand-primary/10 text-brand-primary"
        : "bg-brand-primary/8 text-brand-primary"
      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
  );

  if (props.compact) {
    return (
      <div className="group/tooltip relative">
        <Link href={props.href} aria-current={isActive ? "page" : undefined} aria-label={props.label} className={linkClasses}>
          <Icon className="h-[18px] w-[18px]" />
          <span className="sr-only">{props.label}</span>
        </Link>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-tooltip -translate-y-1/2 whitespace-nowrap rounded-md border border-border-soft bg-surface-canvas px-2 py-1 text-label-sm text-text-primary opacity-0 shadow-sm transition-[opacity,transform] duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
        >
          {props.label}
        </span>
      </div>
    );
  }

  return (
    <Link href={props.href} aria-current={isActive ? "page" : undefined} className={linkClasses}>
      {isActive ? (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-primary" />
      ) : null}
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="min-w-0 flex-1 text-label-md">{props.label}</span>
    </Link>
  );
}

export function ClientSidebar({ userEmail, userName, userImageUrl }: ClientSidebarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ cuenta: true });

  const activeItem = accountNavigation.find((item) => isActivePath(pathname, item.href));

  return (
    <>
      {/* Mobile trigger */}
      <aside className="w-full shrink-0 lg:hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border-soft bg-surface-canvas px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-label-md text-text-primary">{activeItem?.label ?? "Mi cuenta"}</p>
          </div>
          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="client-sidebar-mobile-drawer"
            onClick={() => setIsMobileOpen((c) => !c)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-soft bg-surface-canvas text-text-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir navegación</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar navegación"
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              initial={reduceMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={backdropFade}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              id="client-sidebar-mobile-drawer"
              initial={reduceMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={mobileDrawerReveal}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(17rem,calc(100vw-2rem))] flex-col overflow-y-auto overflow-x-hidden border-r border-border-soft bg-surface-canvas lg:hidden"
            >
              <SidebarPanel
                pathname={pathname}
                openSections={openSections}
                onSectionToggle={(id, next) => setOpenSections((c) => ({ ...c, [id]: next }))}
                onCollapseToggle={() => setIsMobileOpen(false)}
                userEmail={userEmail}
                userName={userName}
                userImageUrl={userImageUrl}
                reduceMotion={reduceMotion}
                collapseLabel="Cerrar"
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 lg:sticky lg:top-6 lg:block lg:self-start">
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 60 : 256 }}
          transition={reduceMotion ? { duration: 0 } : { duration: sidebarWidthDuration, ease: sidebarEaseEnter }}
          className="overflow-visible"
        >
          {isCollapsed ? (
            <motion.div
              key="collapsed-rail"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: sidebarContentDuration, ease: sidebarEaseEnter }}
              className="flex w-full flex-col items-center gap-1 rounded-xl border border-border-soft bg-surface-canvas px-2 py-3"
            >
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                title="Expandir sidebar"
                aria-label="Expandir sidebar"
              >
                <Image src="/logotipo.png" alt="Dermatologika" width={20} height={20} className="h-5 w-5 object-contain brightness-0 invert" priority />
              </button>

              <div className="my-2 h-px w-6 bg-border-soft" />

              <motion.nav
                aria-label="Accesos rápidos de mi cuenta"
                initial={reduceMotion ? false : "initial"}
                animate="animate"
                variants={navListReveal}
                className="flex w-full flex-1 flex-col items-center gap-0.5"
              >
                {accountNavigation.map((item) => (
                  <motion.div key={item.href} variants={navItemReveal}>
                    <NavigationLink {...item} pathname={pathname} compact />
                  </motion.div>
                ))}
              </motion.nav>

              <div className="mt-auto flex w-full flex-col items-center gap-1 border-t border-border-soft pt-3">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                  title="Expandir panel"
                  aria-label="Expandir panel"
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </button>

                <Link
                  href="/cuenta/perfil"
                  aria-label="Mi perfil"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border-soft bg-surface-subtle text-label-sm text-text-primary transition-colors duration-150 hover:border-border-brand hover:bg-brand-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  {userImageUrl ? (
                    <Image src={userImageUrl} alt={userEmail} width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    <Settings className="h-4 w-4 text-text-muted" />
                  )}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-panel"
              initial={reduceMotion ? false : { opacity: 0, x: -8, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: sidebarContentDuration, ease: sidebarEaseEnter }}
              className="w-full"
            >
              <SidebarPanel
                pathname={pathname}
                openSections={openSections}
                onSectionToggle={(id, next) => setOpenSections((c) => ({ ...c, [id]: next }))}
                onCollapseToggle={() => setIsCollapsed(true)}
                userEmail={userEmail}
                userName={userName}
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
  onSectionToggle: (id: string, next: boolean) => void;
  onCollapseToggle: () => void;
  userEmail: string;
  userName: string;
  userImageUrl?: string | undefined;
  reduceMotion: boolean;
  collapseLabel: string;
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border-soft bg-surface-canvas p-3">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-soft">
        <Image src="/logotipo.png" alt="Dermatologika" width={120} height={28} className="h-7 w-auto object-contain" priority />
        <button
          type="button"
          onClick={props.onCollapseToggle}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">{props.collapseLabel}</span>
        </button>
      </div>

      <motion.nav
        aria-label="Navegación de mi cuenta"
        initial={props.reduceMotion ? false : "initial"}
        animate="animate"
        variants={navListReveal}
        className="mt-3 flex-1 space-y-4"
      >
        {navigationSections.map((section) => {
          const isOpen = props.openSections[section.id] ?? true;

          return (
            <motion.section
              key={section.id}
              variants={navItemReveal}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => props.onSectionToggle(section.id, !isOpen)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{section.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cx(
                    "h-3.5 w-3.5 text-text-muted transition-transform duration-200",
                    isOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
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
                    <div className="mt-0.5 space-y-px">
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
        href="/cuenta/perfil"
        className="mt-3 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-surface-subtle border-t border-border-soft pt-3"
      >
        <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-border-soft bg-surface-subtle text-label-sm text-text-primary">
          {props.userImageUrl ? (
            <Image src={props.userImageUrl} alt={props.userEmail} width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] font-medium text-text-muted">
              {props.userEmail.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-sm text-text-primary">{props.userName || props.userEmail}</p>
          <p className="truncate text-[11px] text-text-muted">{props.userEmail}</p>
        </div>
        <Settings className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      </Link>
    </div>
  );
}
