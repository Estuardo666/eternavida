"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { PublicSignInForm } from "@/features/auth/components/public-sign-in-form";
import { PublicSignUpForm } from "@/features/auth/components/public-sign-up-form";
import { motionTokens } from "@/motion/tokens";
import { cx } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

interface PublicUnifiedAuthProps {
  initialMode: AuthMode;
}

const modeContent: Record<AuthMode, { heading: string; subtitle: string }> = {
  "sign-in": {
    heading: "Bienvenido de vuelta",
    subtitle: "Ingresa para continuar con tu experiencia en Dermatologika.",
  },
  "sign-up": {
    heading: "Crea tu cuenta",
    subtitle: "Regístrate para acceder a tu carrito, historial y más.",
  },
};

export function PublicUnifiedAuth({ initialMode }: PublicUnifiedAuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const reduceMotion = useReducedMotion() ?? false;

  function handleToggle(newMode: AuthMode) {
    if (newMode === mode) return;
    setMode(newMode);
  }

  const current = modeContent[mode];

  return (
    <div className="flex min-h-screen items-stretch bg-surface-subtle">
      {/* ── Left: photo panel ─────────────────────────────────── */}
      <div className="hidden p-5 lg:flex lg:w-[44%] xl:w-[46%]">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft }}
          className="relative w-full overflow-hidden rounded-[32px]"
        >
          {/* Background photo */}
          <Image
            src="/media/IMG_9445.jpeg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="46vw"
          />

          {/* Subtle dark overlay for legibility */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(175deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0.22)_100%)]" />

          {/* Back link */}
          <div className="relative z-10 p-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-label-sm text-white/90 backdrop-blur-sm transition hover:bg-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Volver a la tienda
            </Link>
          </div>


        </motion.div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────── */}
      {/*
       * flex-col + items-center anchors the content at a fixed vertical
       * offset from the top. Logo / heading / toggle never move — only the
       * form area below the toggle grows or shrinks downward.
       */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto bg-[linear-gradient(160deg,rgba(114,178,85,0.07)_0%,rgba(230,243,209,0.12)_30%,rgba(252,251,248,0.6)_65%,rgba(255,255,255,0.95)_100%)] px-6 pb-16 pt-[max(4rem,calc(50vh-18rem))]">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft }}
          className="w-full max-w-[400px]"
        >
          {/* Top nav — mobile only */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Image
              src="/logotipo.png"
              alt="Dermatologika"
              width={160}
              height={50}
              className="h-auto w-32 object-contain"
              priority
            />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-canvas px-3.5 py-1.5 text-label-sm text-text-secondary transition hover:border-border-strong hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Tienda
            </Link>
          </div>

          {/* Desktop logo */}
          <div className="mb-7 hidden justify-center lg:flex">
            <Image
              src="/logotipo.png"
              alt="Dermatologika"
              width={240}
              height={74}
              className="h-auto w-52 object-contain"
              priority
            />
          </div>

          {/* Heading — pure crossfade, fixed min-height keeps toggle/form from shifting */}
          <div className="relative mb-6 min-h-[5.25rem] text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.soft }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <h1 className="text-[1.65rem] font-semibold leading-[1.18] tracking-[-0.02em] text-text-primary">
                  {current.heading}
                </h1>
                <p className="mt-1.5 text-body-sm text-text-secondary">{current.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mode toggle — layoutId pill slides physically between tabs */}
          <div
            className="relative mb-7 flex h-12 rounded-full border border-border-soft bg-surface-subtle p-1"
            role="tablist"
            aria-label="Modo de acceso"
          >
            {(["sign-in", "sign-up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => handleToggle(m)}
                className="group relative flex-1 rounded-full py-2 text-center"
              >
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 rounded-full bg-brand-primary shadow-[0_1px_8px_rgba(114,178,85,0.4)]"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 36 }
                    }
                  />
                )}
                {/* Darkened hover tint on inactive tab */}
                {mode !== m && (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-black/0 transition-colors duration-150 group-hover:bg-black/[0.06]" />
                )}
                <span
                  className={cx(
                    "relative z-10 text-body-sm transition-colors duration-200",
                    mode === m
                      ? "font-semibold text-white"
                      : "text-text-muted group-hover:text-text-secondary",
                  )}
                >
                  {m === "sign-in" ? "Ingresar" : "Registrarse"}
                </span>
              </button>
            ))}
          </div>

          {/*
           * Form area — smooth height animation via `layout` on the wrapper.
           * `mode="popLayout"` pops exiting element out of flow immediately so
           * the wrapper can start interpolating to the new height in parallel
           * instead of waiting for the exit animation to finish first.
           */}
          <motion.div
            layout="size"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { layout: { duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft } }
            }
            className="overflow-hidden"
          >
            <Suspense fallback={<div className="h-16 animate-pulse rounded-full bg-surface-subtle" />}>
              <AnimatePresence mode="popLayout" initial={false}>
                {mode === "sign-in" ? (
                  <motion.div
                    key="sign-in-form"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }}
                    transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
                  >
                    <PublicSignInForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sign-up-form"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
                    transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
                  >
                    <PublicSignUpForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}