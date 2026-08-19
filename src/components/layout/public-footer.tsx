import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const exploreLinks = [
  { label: "Nuestra historia" },
  { href: "/productos", label: "Productos" },
  { href: "/blog", label: "Blog" },
  { label: "Contacto" },
  { label: "Impacto social" },
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
    <footer className="relative overflow-hidden border-t border-white/15 bg-gradient-to-br from-[#0B5D1E] via-[#0F6B25] to-[#1A6B2E] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(197,138,29,0.18)_0%,rgba(197,138,29,0.06)_40%,rgba(11,93,30,0)_70%)]"
      />

      <div className="container relative z-10 grid gap-10 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <Image
              src="/media/logo para background verde.png"
              alt="Eterna Vida"
              width={224}
              height={56}
              className="h-14 w-auto"
            />
            <p className="max-w-prose text-body-md text-white/85">
              Productos naturales y artesanales para la salud, el bienestar y la alimentación consciente. Desde Vilcabamba, Ecuador.
            </p>
            <ul className="space-y-2 text-body-sm text-white/80">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B85C]" aria-hidden="true" />
                <a
                  href="tel:+593988158964"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
                >
                  098 815 8964
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B85C]" aria-hidden="true" />
                <a
                  href="https://maps.app.goo.gl/DoBH5qRPAMyjP5GXA?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
                >
                  Vía Cucanamá - Vilcabamba
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B85C]" aria-hidden="true" />
                <a
                  href="mailto:info@eternavida.com.ec"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
                >
                  info@eternavida.com.ec
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-3">
            <h3 className="text-label-md uppercase tracking-[0.14em] text-[#E5B85C]">
              Explorar
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  {"href" in link ? (
                    <Link
                      href={link.href}
                      className="text-body-sm text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-body-sm text-white/80">{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-label-md uppercase tracking-[0.14em] text-[#E5B85C]">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B5D1E]"
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
          <p className="text-caption text-white/70">
            {currentYear} Eterna Vida. Todos los derechos reservados. Ecuador.
          </p>
          <p className="text-caption text-white/70">
            Precios en USD (dólares estadounidenses) incluido IVA.
          </p>
        </div>
      </div>
    </footer>
  );
}
