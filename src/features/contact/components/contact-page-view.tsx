"use client";

import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/motion/tokens";

const mapEmbedUrl =
  "https://www.google.com/maps?q=-3.995121259388611,-79.1971842368048&z=17&output=embed";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function ContactPageView() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section className="w-full">
      <div className="grid min-h-[calc(100vh-152px)] lg:grid-cols-[2fr_1fr]">
          {/* Left: Map with verdoso overlay */}
          <div className="relative min-h-[420px] lg:min-h-full">
            <iframe
              title="Ubicación Eterna Vida en Loja"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
            {/* Soft green overlay */}
            <div className="pointer-events-none absolute inset-0 bg-brand-primary/8 mix-blend-multiply" />
            {/* Green gradient fade on right edge (desktop) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-brand-primary/10 to-transparent lg:block" />
          </div>

          {/* Right: Contact info */}
          <div className="space-y-5 bg-surface-soft p-6 sm:p-8 lg:p-10">
            <motion.span
              initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionTokens.duration.base, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex rounded-pill border border-border-brand bg-surface-brandTint px-3 py-1 text-caption uppercase tracking-[0.14em] text-text-brand"
            >
              Contacto
            </motion.span>

            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionTokens.duration.moderate, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2"
            >
              <h1 className="text-headline-sm text-text-primary sm:text-headline-md">
                Visítanos en Eterna Vida
              </h1>
              <p className="max-w-prose text-body-md text-text-secondary">
                Productos orgánicos y artesanales desde Vilcabamba, Loja.
                Escríbenos o llámanos para consultar disponibilidad, pedidos y envíos.
              </p>
            </motion.div>

            <div className="space-y-4">
              {/* Address */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Dirección
                </h2>
                <div className="flex items-start gap-3 text-body-sm text-text-primary">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                  <a
                    href="https://maps.app.goo.gl/DoBH5qRPAMyjP5GXA?g_st=ic"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-text-brand"
                  >
                    Vía Cucanamá - Vilcabamba
                  </a>
                </div>
              </motion.article>

              {/* Hours */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Horarios de atención
                </h2>
                <div className="flex items-start gap-3 text-body-sm text-text-primary">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                  <ul className="space-y-0.5">
                    <li>Lunes a Viernes: 08:30 – 18:00</li>
                    <li>Sábados: 09:00 – 13:00</li>
                    <li>Domingos: Cerrado</li>
                  </ul>
                </div>
              </motion.article>

              {/* Phones */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Teléfonos
                </h2>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:+593988158964"
                    className="inline-flex items-start gap-3 text-body-sm text-text-primary transition hover:text-text-brand"
                  >
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                    <span>098 815 8964</span>
                  </a>
                  <a
                    href="tel:+593988158964"
                    className="inline-flex items-start gap-3 text-body-sm text-text-primary transition hover:text-text-brand"
                  >
                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                    <span>098 815 8964</span>
                  </a>
                </div>
              </motion.article>

              {/* Email */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Correo electrónico
                </h2>
                <a
                  href="mailto:info@eternavida.com.ec"
                  className="inline-flex items-start gap-3 text-body-sm text-text-primary transition hover:text-text-brand"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                  <span>info@eternavida.com.ec</span>
                </a>
              </motion.article>

              {/* Social media */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                  Redes sociales
                </h2>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/eternavida.ec/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram Eterna Vida"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-canvas text-brand-primary transition hover:border-border-brand hover:bg-surface-brandTint"
                  >
                    <InstagramIcon className="h-4.5 w-4.5" />
                  </a>
                  <a
                    href="https://www.facebook.com/eternavidaec/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Eterna Vida"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-canvas text-brand-primary transition hover:border-border-brand hover:bg-surface-brandTint"
                  >
                    <FacebookIcon className="h-4.5 w-4.5" />
                  </a>
                </div>
              </motion.article>
            </div>
          </div>
      </div>
    </section>
  );
}
