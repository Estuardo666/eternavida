"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { InlineSignUpForm } from "@/features/auth/components/inline-sign-up-form";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, ShoppingBag, User } from "lucide-react";

import { motionTokens } from "@/motion/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationData {
  orderNumber: string;
  total: number;
  itemCount: number;
  customerName: string;
  email: string;
  isGuest: boolean;
  shippingMethod: string;
  paymentMethodName: string;
  requiresPaymentConfirmation: boolean;
  products: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    quantity: number;
  }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "eterna_vida_last_order";

const GUEST_BENEFITS = [
  "Seguimiento de tus pedidos en tiempo real",
  "Historial de compras y recompras rápidas",
  "Acceso a promociones y descuentos exclusivos para miembros",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CheckoutConfirmation() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [order, setOrder] = useState<ConfirmationData | null>(null);
  const [ready, setReady] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  function clearStoredOrder() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // sessionStorage unavailable
    }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        router.replace("/");
        return;
      }
      const parsed = JSON.parse(raw) as Partial<ConfirmationData>;
      const data: ConfirmationData = {
        orderNumber: parsed.orderNumber ?? "DRM-00000",
        total: parsed.total ?? 0,
        itemCount: parsed.itemCount ?? 0,
        customerName: parsed.customerName ?? "Cliente",
        email: parsed.email ?? "",
        isGuest: parsed.isGuest ?? true,
        shippingMethod: parsed.shippingMethod ?? "standard",
        paymentMethodName: parsed.paymentMethodName ?? "Pago por confirmar",
        requiresPaymentConfirmation: parsed.requiresPaymentConfirmation ?? true,
        products: Array.isArray(parsed.products) ? parsed.products : [],
      };
      setOrder(data);
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!ready || !order) {
    return <div className="min-h-screen bg-surface-canvas" aria-hidden="true" />;
  }

  const showGuestPanel = order.isGuest && isLoaded && !isSignedIn;

  const formattedTotal = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(order.total);

  const shippingLabel =
    order.shippingMethod === "pickup" ? "Retiro en tienda" : "Envío estándar";
  const heroTitle = order.requiresPaymentConfirmation
    ? `¡Pedido recibido, ${order.customerName}!`
    : `¡Pedido confirmado, ${order.customerName}!`;
  const heroSubtitle = order.requiresPaymentConfirmation
    ? `Tu pedido está pendiente de pago. Enviaremos un email de confirmación a ${order.email}.`
    : `Recibirás un email de confirmación en ${order.email}`;
  const totalLabel = order.requiresPaymentConfirmation ? "Total a pagar" : "Total pagado";
  const fulfillmentMessage = order.requiresPaymentConfirmation
    ? "Confirmaremos tu pago por email en cuanto recibamos tu comprobante."
    : "El seguimiento de tu envío llegará en las próximas 24 horas.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-canvas px-4 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_420px_at_50%_-120px,rgba(197,138,29,0.12),transparent_62%),linear-gradient(180deg,#FAF8F3_0%,#FFFFFF_36%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-lg space-y-5">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.moderate,
            ease: motionTokens.ease.soft,
          }}
          className="flex flex-col items-center pb-2 text-center"
        >
          <Image
            src="/media/logotipo general.png"
            alt="Eterna Vida"
            width={180}
            height={44}
            className="mb-6 h-auto w-[150px] sm:w-[180px]"
            priority
          />

          {/* Animated checkmark SVG */}
          <motion.div
            className="mb-7"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: motionTokens.duration.moderate,
              ease: motionTokens.ease.emphasis,
            }}
            aria-hidden="true"
          >
            <svg
              width="88"
              height="88"
              viewBox="0 0 88 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Static fill */}
              <circle cx="44" cy="44" r="40" fill="#E8F2EA" />

              {/* Stroke ring draws in */}
              <motion.circle
                cx="44"
                cy="44"
                r="40"
                stroke="#0B5D1E"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: motionTokens.duration.slow,
                  ease: motionTokens.ease.standard,
                  delay: 0.15,
                }}
              />

              {/* Check path draws in */}
              <motion.path
                d="M28 44.5L39.5 57L62 33"
                stroke="#2E8B57"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: motionTokens.duration.moderate,
                  ease: motionTokens.ease.emphasis,
                  delay: 0.38,
                }}
              />
            </svg>
          </motion.div>

          <motion.h1
            className="text-headline-md font-semibold text-text-primary"
            initial={{ opacity: 0, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
              delay: 0.52,
            }}
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            className="mt-2 text-body-md text-text-muted"
            initial={{ opacity: 0, y: motionTokens.distance.xs }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
              delay: 0.64,
            }}
          >
            {order.requiresPaymentConfirmation ? (
              heroSubtitle
            ) : (
              <>
                Recibirás un email de confirmación en{" "}
                <span className="font-medium text-text-secondary">{order.email}</span>
              </>
            )}
          </motion.p>
        </motion.div>

        {/* ── Order summary ─────────────────────────────────────────────────── */}
        <motion.div
          className="space-y-4 rounded-xl border border-border-soft bg-surface-subtle p-5"
          initial={{ opacity: 0, y: motionTokens.distance.sm, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.74,
          }}
        >
          {(order.products?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <h2 className="text-label-md font-semibold text-text-primary">Productos</h2>
              <div className="space-y-2">
                {order.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg border border-border-soft/80 bg-white/70 p-2"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-surface-soft">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-caption text-text-muted">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-text-primary">{product.name}</p>
                    </div>
                    <p className="text-label-sm text-text-secondary">x{product.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border-soft" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Número de pedido</span>
            <span className="tabular-nums text-label-md font-semibold text-text-primary">
              {order.orderNumber}
            </span>
          </div>

          <div className="h-px bg-border-soft" />

          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Productos</span>
            <span className="text-label-md text-text-secondary">
              {order.itemCount} {order.itemCount === 1 ? "artículo" : "artículos"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-label-md text-text-muted">Envío</span>
            <span className="text-label-md text-text-secondary">{shippingLabel}</span>
          </div>

          <div className="h-px bg-border-soft" />

          <div className="flex items-center justify-between">
            <span className="text-label-md font-semibold text-text-primary">{totalLabel}</span>
            <span className="tabular-nums text-label-lg font-semibold text-text-primary">
              {formattedTotal}
            </span>
          </div>

          <p className="text-body-sm text-text-muted">
            {fulfillmentMessage}
          </p>
        </motion.div>

        {/* ── CTA buttons ───────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: motionTokens.distance.sm }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
            delay: 0.84,
          }}
        >
          <Link
            href="/productos"
            onClick={clearStoredOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-subtle px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Seguir comprando
          </Link>

          <Link
            href="/cuenta/perfil"
            onClick={clearStoredOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Ver mi cuenta
          </Link>
        </motion.div>

        {/* ── Guest registration panel ──────────────────────────────────────── */}
        <AnimatePresence>
          {showGuestPanel && (
            <motion.div
              key="guest-panel"
              initial={{ opacity: 0, y: motionTokens.distance.md }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: motionTokens.distance.xs }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.soft,
              }}
              className="rounded-xl border border-border-brand bg-surface-brandTint p-5"
            >
              <h2 className="text-section-md font-semibold text-text-primary">
                ¿Quieres crear tu cuenta?
              </h2>
              <p className="mt-1 text-body-sm text-text-muted">
                Regístrate gratis y disfruta de:
              </p>

              <ul className="mt-3 space-y-2">
                {GUEST_BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-body-sm text-text-secondary"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-brand-primary"
                      aria-hidden="true"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>

              <AnimatePresence mode="wait">
                {!showSignUp ? (
                  <motion.button
                    key="cta-register"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: motionTokens.duration.fast }}
                    type="button"
                    onClick={() => setShowSignUp(true)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  >
                    Crear cuenta gratis
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="signup-form"
                    initial={{ opacity: 0, y: motionTokens.distance.sm }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: motionTokens.distance.xs }}
                    transition={{
                      duration: motionTokens.duration.base,
                      ease: motionTokens.ease.soft,
                    }}
                    className="mt-5 space-y-3"
                  >
                    <InlineSignUpForm
                      onBack={() => setShowSignUp(false)}
                      onSuccess={() => router.replace("/cuenta/perfil")}
                      backLabel="Cancelar"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
