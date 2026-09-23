"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";

import { motionTokens } from "@/motion/tokens";

type StatusTone = "error" | "review";

interface DatafastStatusCardProps {
  tone: StatusTone;
  title: string;
  message: string;
  orderNumber?: string | undefined;
  /** Muestra el botón de reintento aunque el tono sea "review" (pago pendiente). */
  showRetry?: boolean | undefined;
}

const TONE_STYLES: Record<StatusTone, { ring: string; fill: string; icon: string }> = {
  error: { ring: "#E7B4AC", fill: "#FBEAE7", icon: "#C0362C" },
  review: { ring: "#E3C98A", fill: "#FBF3E1", icon: "#9A7418" },
};

/**
 * Pantalla de resultado de Datafast (rechazo / revision / pendiente). Reusa el
 * lenguaje visual de la confirmacion de pedido: icono que dibuja su trazo,
 * texto escalonado y fondo con degradado suave.
 */
export function DatafastStatusCard({
  tone,
  title,
  message,
  orderNumber,
  showRetry,
}: DatafastStatusCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const Icon = tone === "review" ? Clock : AlertCircle;
  const styles = TONE_STYLES[tone];

  const buttonMotionProps = reduceMotion
    ? {}
    : {
        whileHover: {
          scale: 1.012,
          y: -1,
          transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.soft },
        },
        whileTap: {
          scale: motionTokens.scale.press,
          transition: { duration: motionTokens.duration.instant, ease: motionTokens.ease.standard },
        },
      };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-surface-canvas px-4 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_420px_at_50%_-120px,rgba(197,138,29,0.10),transparent_62%),linear-gradient(180deg,#FAF8F3_0%,#FFFFFF_36%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: motionTokens.duration.moderate,
            ease: motionTokens.ease.emphasis,
          }}
          aria-hidden="true"
        >
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="38" cy="38" r="34" fill={styles.fill} />
            <motion.circle
              cx="38"
              cy="38"
              r="34"
              stroke={styles.ring}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: motionTokens.duration.slow,
                ease: motionTokens.ease.standard,
                delay: 0.12,
              }}
            />
          </svg>
          <Icon
            className="mx-auto -mt-[54px] h-7 w-7"
            style={{ color: styles.icon }}
            aria-hidden="true"
          />
        </motion.div>

        <motion.h1
          className="mt-5 text-body-lg font-semibold text-text-primary sm:text-headline-sm"
          initial={{ opacity: 0, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.3,
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="mt-2 text-body-sm text-text-secondary"
          initial={{ opacity: 0, y: motionTokens.distance.xs }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.4,
          }}
        >
          {message}
        </motion.p>

        {orderNumber && (
          <motion.p
            className="mt-1 text-caption text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.duration.base, delay: 0.46 }}
          >
            Pedido {orderNumber}
          </motion.p>
        )}

        <motion.div
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.54,
          }}
        >
          {(tone === "error" || showRetry) && orderNumber && (
            <motion.div {...buttonMotionProps}>
              <Link
                href={`/checkout/pago?order=${encodeURIComponent(orderNumber)}`}
                className="inline-flex h-11 items-center rounded-lg bg-brand-primary px-5 text-body-sm font-medium text-white transition-colors duration-fast hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Reintentar el pago
              </Link>
            </motion.div>
          )}
          <motion.div {...buttonMotionProps}>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg border border-border bg-white px-5 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-brand hover:bg-brand-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Volver a la tienda
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
