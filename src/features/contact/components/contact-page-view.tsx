"use client";

import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/motion/tokens";

const businessHours = [
  { day: "Lunes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Martes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Miércoles", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Jueves", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Viernes", hours: "8:00 a. m. - 8:00 p. m." },
  { day: "Sábado", hours: "8:00 a. m. - 6:00 p. m." },
  { day: "Domingo", hours: "Cerrado" },
] as const;

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
    <section className="container py-8 sm:py-12 lg:py-16">
      <div className="overflow-hidden rounded-[32px] border border-border-soft bg-surface-canvas shadow-sm">
        <div className="grid min-h-[520px] lg:grid-cols-[1.05fr_minmax(0,1fr)]">
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
                Agenda tu visita en Eterna Vida
              </h1>
              <p className="max-w-prose text-body-md text-text-secondary">
                Brindamos atención personalizada en Loja, Ecuador. Escríbenos o
                llámanos para resolver tus dudas y coordinar tu visita.
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
                  <p>Vilcabamba, Loja, Ecuador</p>
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
                <div className="grid gap-2 sm:grid-cols-2">
                  <a
                    href="tel:+593988158964"
                    className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-2.5 text-body-sm text-text-primary transition hover:border-border-brand"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                    <span>098 815 8964</span>
                  </a>
                  <a
                    href="tel:+593988158964"
                    className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-2.5 text-body-sm text-text-primary transition hover:border-border-brand"
                  >
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
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
                  className="inline-flex items-start gap-2 rounded-md border border-border bg-surface-canvas p-2.5 text-body-sm text-text-primary transition hover:border-border-brand"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                  <span>info@eternavida.com.ec</span>
                </a>
              </motion.article>

              {/* Business hours */}
              <motion.article
                initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.base, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="inline-flex items-center rounded-pill bg-brand-primary px-3 py-1 text-label-sm uppercase text-text-inverse">
                    Horario
                  </h2>
                  <span className="inline-flex items-center gap-1 text-label-sm text-status-success">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    Abierto ahora
                  </span>
                </div>
                <ul className="space-y-0.5 rounded-md border border-border bg-surface-canvas p-2.5">
                  {businessHours.map((item) => (
                    <li key={item.day} className="flex items-center justify-between gap-4 text-body-sm">
                      <span className="text-text-secondary">{item.day}</span>
                      <span className="font-medium text-text-primary">{item.hours}</span>
                    </li>
                  ))}
                </ul>
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
      </div>
    </section>
  );
}
