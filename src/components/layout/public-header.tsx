import Link from "next/link";
import Image from "next/image";

import { PublicAccountEntry } from "@/components/layout/public-account-entry";
import { CartHeaderButton } from "@/components/layout/cart-header-button";
import { PublicLinkButton } from "@/components/ui/public-link-button";

const navigationLinks = [
  { href: "/categorias", label: "Categorias" },
  { href: "/productos", label: "Productos" },
  { href: "/#trust-highlights", label: "Beneficios" },
] as const;

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-sticky border-b border-border-soft bg-surface-canvas/95 backdrop-blur">
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
          >
            <Image
              src="/logotipo.png"
              alt="Dermatologika"
              width={224}
              height={56}
              className="h-14 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <PublicAccountEntry />
            <div className="hidden md:block">
              <PublicLinkButton
                action={{ href: "/#contact-cta", label: "Contacto" }}
                variant="secondary"
                className="min-h-10 px-5 py-2"
              />
            </div>
            <CartHeaderButton />
          </div>
        </div>

        <nav aria-label="Navegación principal" className="overflow-x-auto">
          <ul className="flex min-w-max items-center gap-2 md:gap-3">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-pill px-4 text-label-md text-text-primary transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
              >
                Inicio
              </Link>
            </li>

            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-pill px-4 text-label-md text-text-secondary transition hover:bg-surface-soft hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="md:hidden">
              <PublicLinkButton
                action={{ href: "/#contact-cta", label: "Contacto" }}
                variant="secondary"
                className="min-h-11 px-4 py-2"
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
