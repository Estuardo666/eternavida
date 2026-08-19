"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

import { PublicAccountEntry } from "@/components/layout/public-account-entry";
import { CartHeaderButton } from "@/components/layout/cart-header-button";
import { LiveSearch } from "@/features/search/components/live-search";

const navigationLinks = [
  { href: "/productos", label: "Productos" },
  { href: "/blog", label: "Blog" },
  { href: "/acerca-de-nosotros", label: "Acerca de nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

const categoryLinks = [
  { href: "/categorias/productos-apicolas", label: "Apícolas" },
  { href: "/categorias/aceites-naturales", label: "Aceites" },
  { href: "/categorias/bienestar-natural", label: "Bienestar" },
] as const;

export function PublicHeader() {
  const [isPromoBarVisible, setIsPromoBarVisible] = useState(true);
  const headerRef = useRef<HTMLElement | null>(null);

  // Publish the live header height so sticky page elements can offset below it.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--public-header-height",
        `${Math.round(header.getBoundingClientRect().height)}px`,
      );
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-sticky border-b border-white/20 bg-brand-primary backdrop-blur-md"
    >
      {isPromoBarVisible && (
        <div className="border-b border-[#8a6412]/40 bg-gradient-to-r from-[#B47C18] via-[#E3B558] to-[#B47C18] transition-all duration-200 ease-out animate-[promo-in_200ms_ease-out]">
          <div className="container flex min-h-0 items-center justify-between gap-2 py-0.5">
            <p className="truncate text-body-sm font-semibold text-[#0F2A21]">
              Promociones activas hoy: descuentos especiales en productos naturales artesanales.
            </p>
            <button
              type="button"
              onClick={() => setIsPromoBarVisible(false)}
              aria-label="Cerrar barra de promociones"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0F2A21]/25 bg-white/30 text-[#0F2A21] transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2A21] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E3B558]"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="container flex flex-col gap-2.5 py-2.5">
        <div className="flex items-center gap-2.5 md:gap-4">
          <Link
            href="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
          >
            <Image
              src="/media/logo para background verde.png"
              alt="Eterna Vida"
              width={192}
              height={48}
              className="h-9 w-auto md:h-11"
            />
          </Link>

          <div className="hidden md:min-w-0 md:flex-1 md:block">
            <LiveSearch />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="md:hidden">
              <LiveSearch />
            </div>
            <PublicAccountEntry />
            <CartHeaderButton />
          </div>
        </div>

        <nav aria-label="Navegación principal" className="overflow-x-auto">
          <ul className="flex min-w-max items-center gap-1.5 md:gap-2.5">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-9 items-center rounded-pill px-3 text-[14px] font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
              >
                Inicio
              </Link>
            </li>

            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-pill px-3 text-[14px] font-semibold text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="ml-auto flex min-h-9 items-center gap-1 pl-1.5">
              {categoryLinks.map((category) => (
                <Link
                  key={category.label}
                  href={category.href}
                  className="inline-flex min-h-8 items-center rounded-pill px-2.5 text-[11px] font-semibold uppercase tracking-[0.02em] text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
                >
                  {category.label}
                </Link>
              ))}
              <span className="inline-flex min-h-7 items-center rounded-full bg-[#F59E0B] px-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-ink-900 shadow-sm">
                Artesanales
              </span>
            </li>

          </ul>
        </nav>
      </div>
    </header>
  );
}
