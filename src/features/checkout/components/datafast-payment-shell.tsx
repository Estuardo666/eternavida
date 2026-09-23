"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import { motionTokens } from "@/motion/tokens";
import { DatafastWidget } from "@/features/checkout/components/datafast-widget";

interface DatafastPaymentShellProps {
  orderNumber: string;
  formattedAmount: string;
  checkoutId: string;
  widgetScriptUrl: string;
  brands: string;
  shopperResultUrl: string;
}

/**
 * Envoltorio con estilo Eterna Vida (fondo degradado, tipografia y ritmo de
 * entrada de checkout-confirmation) para el widget COPYandPAY de Datafast.
 */
export function DatafastPaymentShell({
  orderNumber,
  formattedAmount,
  checkoutId,
  widgetScriptUrl,
  brands,
  shopperResultUrl,
}: DatafastPaymentShellProps) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-surface-canvas px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_420px_at_50%_-120px,rgba(11,93,30,0.08),transparent_62%),linear-gradient(180deg,#FAF8F3_0%,#FFFFFF_36%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-md">
        <motion.header
          className="mb-6 text-center"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: motionTokens.distance.md }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft }}
        >
          <p className="text-caption text-text-muted">Pedido {orderNumber}</p>
          <h1 className="mt-1 text-headline-sm font-semibold text-text-primary">
            Completa tu pago
          </h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            Total a pagar:{" "}
            <span className="font-semibold text-text-primary">{formattedAmount}</span>
          </p>
        </motion.header>

        <motion.div
          className="rounded-xl border border-border-soft bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_-16px_rgba(17,24,39,0.14)] sm:p-7"
          initial={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: motionTokens.distance.sm, scale: 0.992 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.12,
          }}
        >
          <DatafastWidget
            checkoutId={checkoutId}
            widgetScriptUrl={widgetScriptUrl}
            brands={brands}
            shopperResultUrl={shopperResultUrl}
          />
        </motion.div>

        <motion.div
          className="mt-5 flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: motionTokens.duration.base, delay: 0.32 }}
        >
          <Image
            src="/media/datafast-logo-actual.jpg"
            alt="Datafast"
            width={120}
            height={32}
            loading="eager"
            className="h-6 w-auto opacity-80"
          />
          <p className="flex items-center justify-center gap-2 text-caption text-text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Pago procesado de forma segura por Datafast. No almacenamos los datos de tu tarjeta.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
