import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const exploreLinks = [
  { label: "Quienes sómos" },
  { href: "/productos", label: "Productos" },
  { label: "Contacto" },
  { label: "Colecciones" },
] as const;

const legalLinks = [
  { href: "/politica-de-envios", label: "Política de Envíos" },
  { href: "/politica-de-devoluciones", label: "Política de Devoluciones y Cancelaciones" },
  { href: "/terminos-y-condiciones", label: "Términos y Condiciones" },
  { href: "/politica-de-privacidad", label: "Política de Privacidad" },
] as const;

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/15 bg-[#72b255] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.14)_32%,rgba(114,178,85,1)_72%)]"
      />

      <div className="container relative z-10 grid gap-10 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <Image
              src="/logotipo.png"
              alt="Dermatologika"
              width={224}
              height={56}
              className="h-14 w-auto"
            />
            <p className="max-w-prose text-body-md text-emerald-50/95">
              Dermocosmética y cuidado de la piel con respaldo científico para todo Ecuador.
            </p>
            <ul className="space-y-2 text-body-sm text-emerald-50/90">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
                <a
                  href="tel:+593982740049"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A6A4E]"
                >
                  098 274 0049
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
                <span>Av. Jose Maria Vivar, Castro, Loja, Ecuador</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
                <a
                  href="mailto:info@dermatologika.ec"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A6A4E]"
                >
                  info@dermatologika.ec
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-3">
            <h3 className="text-label-md uppercase tracking-[0.14em] text-emerald-200">
              Explorar
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  {"href" in link ? (
                    <Link
                      href={link.href}
                      className="text-body-sm text-emerald-50/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A6A4E]"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-body-sm text-emerald-50/90">{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-label-md uppercase tracking-[0.14em] text-emerald-200">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-emerald-50/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A6A4E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/15">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-caption text-emerald-100/90">
            {currentYear} Dermatologika. Todos los derechos reservados. Ecuador.
          </p>
          <p className="text-caption text-emerald-100/90">
            Precios en USD (dólares estadounidenses) incluido IVA.
          </p>
        </div>
      </div>
    </footer>
  );
}
