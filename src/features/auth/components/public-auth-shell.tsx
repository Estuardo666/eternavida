"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, HeartPulse, ShieldCheck, ShoppingBag } from "lucide-react";

import { motionTokens } from "@/motion/tokens";
import { cx } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

interface PublicAuthShellProps {
  mode: AuthMode;
  children: ReactNode;
}

const shellContent: Record<AuthMode, { title: string; description: string; accent: string }> = {
  "sign-in": {
    title: "Bienvenida de vuelta",
    description:
      "Ingresa con tu correo para retomar tu compra, revisar favoritos y mantener tu experiencia conectada en Eterna Vida.",
    accent: "Acceso seguro por email",
  },
  "sign-up": {
    title: "Crea tu cuenta",
    description:
      "Activa una cuenta Eterna Vida para guardar tu carrito, acelerar el checkout y seguir tus compras desde un mismo lugar.",
    accent: "Registro privado sin proveedores externos",
  },
};

const valuePillItems = [
  "Checkout más ágil",
  "Promociones visibles",
  "Historial conectado",
] as const;

export function PublicAuthShell({ mode, children }: PublicAuthShellProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const content = shellContent[mode];

  return (
    <div className="min-h-screen overflow-x-clip bg-surface-subtle px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1320px]">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft }}
          className="overflow-hidden rounded-[32px] border border-border-soft/70 bg-surface-canvas shadow-[0_28px_70px_rgba(18,18,18,0.08)] lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.82fr)]"
        >
          <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#E8F2EA_0%,#f7f4ef_48%,#ffffff_100%)] lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-10 xl:px-14 xl:py-12">
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                initial={reduceMotion ? { opacity: 0.5 } : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: motionTokens.duration.page, ease: motionTokens.ease.soft }}
                className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-brand-soft/80 blur-3xl"
              />
              <motion.div
                initial={reduceMotion ? { opacity: 0.45 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.page, delay: 0.08, ease: motionTokens.ease.soft }}
                className="absolute bottom-8 right-0 h-80 w-80 rounded-full bg-[#F3EFE7] blur-3xl"
              />
            </div>

            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
              className="relative z-10 flex items-center justify-between gap-4"
            >
              <Image
                src="/media/logotipo general.png"
                alt="Eterna Vida"
                width={220}
                height={72}
                className="h-auto w-44 object-contain"
                priority
              />
              <Link
                href="/"
                className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-white/70 bg-white/70 px-4 py-2 text-label-md text-text-primary backdrop-blur transition hover:border-border-strong hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver a la tienda
              </Link>
            </motion.div>

            <div className="relative z-10 space-y-8">
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: motionTokens.duration.moderate, delay: 0.06, ease: motionTokens.ease.soft }}
                className="max-w-[34rem] space-y-4"
              >
                <span className="inline-flex rounded-pill border border-white/70 bg-white/65 px-4 py-2 text-label-sm uppercase tracking-[0.16em] text-text-secondary backdrop-blur">
                  {content.accent}
                </span>
                <h2 className="max-w-[18ch] text-headline-lg font-semibold text-text-primary xl:text-[3.15rem] xl:leading-[1.08]">
                  {content.title}
                </h2>
                <p className="max-w-[30rem] text-body-md text-text-secondary">
                  {content.description}
                </p>
              </motion.div>

              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.994 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: motionTokens.duration.moderate, delay: 0.12, ease: motionTokens.ease.soft }}
                className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/72 p-6 shadow-[0_20px_50px_rgba(18,18,18,0.06)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label-md text-text-secondary">Resumen Eterna Vida</p>
                    <p className="mt-2 text-section-md font-semibold text-text-primary">
                      Una cuenta para mantener tu compra ordenada.
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-border-soft bg-surface-canvas/85 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-label-md text-text-primary">Checkout guiado</p>
                        <p className="mt-1 text-body-sm text-text-muted">
                          Datos guardados, flujo claro y continuidad entre carrito y pago.
                        </p>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-soft bg-surface-canvas/85 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-label-md text-text-primary">Rutina conectada</p>
                        <p className="mt-1 text-body-sm text-text-muted">
                          Conserva contexto de compra, productos vistos y próximas decisiones.
                        </p>
                      </div>
                      <HeartPulse className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {valuePillItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-pill border border-border-soft bg-white px-3 py-2 text-label-sm text-text-secondary"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="relative flex min-h-full flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 xl:px-14 xl:py-12">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link
                href="/"
                className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-border-soft bg-white px-4 py-2 text-label-md text-text-primary transition hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver
              </Link>
              <Image
                src="/media/logotipo general.png"
                alt="Eterna Vida"
                width={184}
                height={60}
                className="h-auto w-36 object-contain sm:w-40"
                priority
              />
            </div>

            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
              className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col justify-center"
            >
              <div className="space-y-5">
                <div className="space-y-3">
                  <span className="inline-flex rounded-pill bg-brand-soft/60 px-4 py-2 text-label-sm uppercase tracking-[0.16em] text-text-secondary">
                    Cuenta Eterna Vida
                  </span>

                  <div className="inline-flex rounded-pill border border-border-soft bg-surface-soft p-1.5">
                    <AuthSwitchLink href="/login" isActive={mode === "sign-in"}>
                      Ingresar
                    </AuthSwitchLink>
                    <AuthSwitchLink href="/register" isActive={mode === "sign-up"}>
                      Crear cuenta
                    </AuthSwitchLink>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-headline-md font-semibold text-text-primary sm:text-headline-lg">
                      {content.title}
                    </h1>
                    <p className="max-w-[34ch] text-body-md text-text-secondary">
                      {content.description}
                    </p>
                  </div>
                </div>

                {children}

                <p className="text-body-sm text-text-muted">
                  Por ahora el acceso funciona solo con correo y contraseña. No se muestran proveedores externos ni login social.
                </p>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function AuthSwitchLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-pill px-5 py-2.5 text-label-md transition duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft",
        isActive
          ? "bg-surface-canvas text-text-primary shadow-sm"
          : "text-text-muted hover:text-text-primary",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export function PublicAuthSetupNotice() {
  return (
    <div className="rounded-[28px] border border-status-warning/20 bg-white p-6 shadow-sm">
      <div className="space-y-3 rounded-2xl border border-status-warning/15 bg-[#fff8ea] p-4 text-body-sm text-text-secondary">
        <p className="font-semibold text-text-primary">Clerk todavía no está configurado en este entorno.</p>
        <p>
          Agrega <code className="rounded bg-white px-1.5 py-0.5 text-label-sm">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> y <code className="rounded bg-white px-1.5 py-0.5 text-label-sm">CLERK_SECRET_KEY</code> en tu archivo de entorno para habilitar login y registro.
        </p>
      </div>
    </div>
  );
}
