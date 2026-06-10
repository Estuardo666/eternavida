"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

import { PublicAccountEntry } from "@/components/layout/public-account-entry";
import { CartHeaderButton } from "@/components/layout/cart-header-button";
import { LiveSearch } from "@/features/search/components/live-search";

const navigationLinks = [
  { href: "/productos", label: "Productos" },
] as const;

const categoryLinks = [
  { href: "/categorias/productos-apicolas", label: "Apícolas" },
  { href: "/categorias/aceites-naturales", label: "Aceites" },
  { href: "/categorias/bienestar-natural", label: "Bienestar" },
] as const;

export function PublicHeader() {
  const [isPromoBarVisible, setIsPromoBarVisible] = useState(true);

  return (
    <header className="sticky top-0 z-sticky border-b border-border-soft bg-surface-canvas/85 backdrop-blur-md">
      {isPromoBarVisible && (
        <div className="border-b border-brand-primary/35 bg-brand-soft transition-all duration-200 ease-out animate-[promo-in_200ms_ease-out]">
          <div className="container flex min-h-9 items-center justify-between gap-2 py-1.5">
            <p className="truncate text-body-sm font-semibold text-text-brand">
              Promociones activas hoy: descuentos especiales en productos naturales artesanales.
            </p>
            <button
              type="button"
              onClick={() => setIsPromoBarVisible(false)}
              aria-label="Cerrar barra de promociones"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-primary/30 bg-white/70 text-text-brand transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-soft"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="container flex flex-col gap-2.5 py-2.5">
        <div className="flex items-center gap-2.5 md:gap-4">
          <Link
            href="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
          >
            <Image
              src="/media/logotipo.jpg"
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
                className="inline-flex min-h-9 items-center rounded-pill px-3 text-[14px] font-semibold text-text-primary transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
              >
                Inicio
              </Link>
            </li>

            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-pill px-3 text-[14px] font-semibold text-text-secondary transition hover:bg-surface-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
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
                  className="inline-flex min-h-8 items-center rounded-pill px-2.5 text-[11px] font-semibold uppercase tracking-[0.02em] text-text-brand transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  {category.label}
                </Link>
              ))}
              <span className="inline-flex min-h-8 items-center rounded-pill bg-brand-primary px-3 text-[11px] font-semibold uppercase tracking-[0.02em] text-text-inverse">
                Naturales
              </span>
              <span className="inline-flex min-h-8 items-center rounded-pill bg-[#F59E0B] px-3 text-[11px] font-semibold uppercase tracking-[0.02em] text-ink-900">
                Artesanales
              </span>
            </li>

          </ul>
        </nav>
      </div>
    </header>
  );
}
