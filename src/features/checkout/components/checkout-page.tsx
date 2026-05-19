"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Store,
  UserCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";
import { useUser, useSignIn, useSignUp, SignOutButton } from "@clerk/nextjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { normalizeClerkErrorMessage } from "@/features/auth/lib/normalize-clerk-error";

import { resolveCheckoutShippingBaseCost, type CheckoutShippingMethod } from "@/config/checkout";
import { motionTokens } from "@/motion/tokens";
import { useCart } from "@/features/cart/context/cart-context";
import { useCheckoutPricingPreview } from "@/features/checkout/hooks/use-checkout-pricing-preview";
import { cx } from "@/lib/utils";
import { CheckoutOrderSummary } from "./checkout-order-summary";

// ─── Button state ────────────────────────────────────────────────────────────

type ButtonState = "idle" | "submitting" | "done";

// ─── Ecuador provinces and major cities ─────────────────────────────────────

interface Province {
  id: string;
  name: string;
  cities: string[];
}

const ecuadorProvinces: Province[] = [
  { id: "pic", name: "Pichincha", cities: ["Quito", "Machachi", "Latacunga"] },
  { id: "gua", name: "Guayas", cities: ["Guayaquil", "Samborondón", "Durán"] },
  { id: "azo", name: "Azuay", cities: ["Cuenca", "Gualaceo", "Sigsig"] },
  { id: "mam", name: "Manabí", cities: ["Manta", "Portoviejo", "Junín"] },
  { id: "sua", name: "Sucumbíos", cities: ["Nueva Loja", "El Coca", "Lago Agrio"] },
  { id: "tur", name: "Tungurahua", cities: ["Ambato", "Latacunga", "Pelileo"] },
  { id: "pas", name: "Pastaza", cities: ["Puyo", "Shell"] },
  { id: "mor", name: "Morona Santiago", cities: ["Macas", "Limón"] },
  { id: "zam", name: "Zamora Chinchipe", cities: ["Zamora", "Vilcabamba"] },
  { id: "loj", name: "Loja", cities: ["Loja", "Catamayo"] },
  { id: "los", name: "Los Ríos", cities: ["Babahoyo", "Quevedo"] },
  { id: "san", name: "Santo Domingo", cities: ["Santo Domingo", "La Concordia"] },
  { id: "car", name: "Carchi", cities: ["Tulcán", "Ipiales"] },
  { id: "imb", name: "Imbabura", cities: ["Ibarra", "Otavalo", "Cotacachi"] },
  { id: "ori", name: "Orellana", cities: ["Puerto Francisco de Orellana", "Coca"] },
  { id: "gal", name: "Galápagos", cities: ["Puerto Baquerizo", "Puerto Ayora"] },
  { id: "set", name: "Santa Elena", cities: ["Santa Elena", "Salinas", "La Libertad"] },
];

// ─── Price formatter ──────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-30"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  optional?: boolean;
  className?: string;
}

function Field({
  label,
  id,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  autoComplete,
  optional = false,
  className,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="block text-label-sm font-medium text-text-secondary">
          {label}
          {required && (
            <span className="ml-0.5 text-status-error" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {optional && (
          <span className="text-caption text-text-muted">Opcional</span>
        )}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-body-sm font-medium text-text-primary placeholder:font-normal placeholder:text-text-muted transition-[border-color,box-shadow,background-color] duration-fast hover:border-border-brand hover:bg-brand-soft/20 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 border-t border-border-soft/40 pt-6 first:border-t-0 first:pt-0">
      <h2 className="mb-4 text-body-lg font-semibold text-text-primary">{title}</h2>
      {children}
    </div>
  );
}

// ─── Breadcrumb step ──────────────────────────────────────────────────────────

function BreadcrumbStep({
  label,
  isActive,
  isFuture,
}: {
  label: string;
  isActive?: boolean;
  isFuture?: boolean;
}) {
  return (
    <span
      className={cx(
        "text-label-sm",
        isActive && "font-semibold text-text-primary",
        isFuture && "text-text-muted",
        !isActive && !isFuture && "text-text-secondary",
      )}
      aria-current={isActive ? "step" : undefined}
    >
      {label}
    </span>
  );
}

// ─── Shared inline field style ────────────────────────────────────────────────

const inlineInput =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3.5 text-body-sm text-text-primary placeholder:text-text-muted transition hover:border-brand-primary/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:bg-surface-subtle disabled:text-text-muted";

// ─── Inline sign-in ───────────────────────────────────────────────────────────

function CheckoutInlineSignIn({ onBack }: { onBack: () => void }) {
  const { signIn, fetchStatus } = useSignIn();
  const isAuthReady = fetchStatus === "idle" && signIn !== null;
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setError(null);
    setStep("password");
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password || !isAuthReady || !signIn) return;
    setBusy(true);
    setError(null);
    try {
      const result = await signIn.password({ identifier: email.trim(), password });
      if (result.error) throw result.error;
      if (signIn.status !== "complete") throw new Error("Requiere pasos adicionales.");
      await signIn.finalize();
      // useUser will update; gate transitions automatically
    } catch (err) {
      setError(normalizeClerkErrorMessage(err, "No se pudo iniciar sesión. Verifica tus datos."));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 px-4 pb-4 pt-1">
      {step === "email" ? (
        <form onSubmit={handleEmail} className="space-y-2.5" noValidate>
          <input
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inlineInput}
            autoFocus
          />
          {error && <p className="text-caption text-status-error">{error}</p>}
          <button
            type="submit"
            className="h-10 w-full rounded-lg bg-brand-primary text-body-sm font-medium text-white transition hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Continuar
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-2.5" noValidate>
          <button
            type="button"
            onClick={() => { setStep("email"); setError(null); }}
            className="flex items-center gap-1 text-caption text-text-muted hover:text-text-secondary"
          >
            <ArrowLeft className="h-3 w-3" /> {email}
          </button>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inlineInput}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-caption text-status-error">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary text-body-sm font-medium text-white transition hover:bg-brand-primaryHover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
          </button>
        </form>
      )}
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-caption text-text-muted hover:text-text-secondary"
      >
        Volver
      </button>
    </div>
  );
}

// ─── Inline sign-up ───────────────────────────────────────────────────────────

function CheckoutInlineSignUp({ onBack }: { onBack: () => void }) {
  const { signUp, fetchStatus } = useSignUp();
  const isAuthReady = fetchStatus === "idle" && signUp !== null;
  const [step, setStep] = useState<"details" | "verify">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 8) {
      setError("Completa todos los campos. La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!isAuthReady || !signUp) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signUp.password({ firstName: firstName.trim(), lastName: lastName.trim(), emailAddress: email.trim(), password });
      if (attempt.error) throw attempt.error;
      if (signUp.status === "complete") {
        const fin = await signUp.finalize();
        if (fin.error) throw fin.error;
        return;
      }
      const sendResult = await signUp.verifications.sendEmailCode();
      if (sendResult.error) throw sendResult.error;
      setStep("verify");
    } catch (err) {
      setError(normalizeClerkErrorMessage(err, "No se pudo crear la cuenta."));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthReady || !signUp || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (verifyResult.error) throw verifyResult.error;
      if (signUp.status !== "complete") throw new Error("Verificación incompleta.");
      const fin = await signUp.finalize();
      if (fin.error) throw fin.error;
      // useUser will update; gate transitions automatically
    } catch (err) {
      setError(normalizeClerkErrorMessage(err, "Código incorrecto. Intenta de nuevo."));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 px-4 pb-4 pt-1">
      {step === "details" ? (
        <form onSubmit={handleCreate} className="space-y-2.5" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inlineInput} autoFocus />
            <input placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inlineInput} />
          </div>
          <input type="email" autoComplete="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className={inlineInput} />
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inlineInput}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary" tabIndex={-1}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-caption text-status-error">{error}</p>}
          <div id="clerk-captcha" />
          <button
            type="submit"
            disabled={busy}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary text-body-sm font-medium text-white transition hover:bg-brand-primaryHover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-2.5" noValidate>
          <p className="text-body-sm text-text-secondary">
            Ingresa el código que enviamos a <span className="font-medium text-text-primary">{email}</span>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inlineInput}
            autoFocus
          />
          {error && <p className="text-caption text-status-error">{error}</p>}
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-primary text-body-sm font-medium text-white transition hover:bg-brand-primaryHover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Verificar y continuar"}
          </button>
        </form>
      )}
      <button type="button" onClick={onBack} className="w-full text-center text-caption text-text-muted hover:text-text-secondary">
        Volver
      </button>
    </div>
  );
}

// ─── CheckoutIdentityGate ─────────────────────────────────────────────────────

type GatePanel = "idle" | "sign-in" | "sign-up" | "guest";

interface UserReadyData { email: string; firstName?: string | undefined; lastName?: string | undefined }

function CheckoutIdentityGate({ onUserReady }: { onUserReady: (data: UserReadyData) => void }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [panel, setPanel] = useState<GatePanel>("idle");

  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      onUserReady({
        email: user.primaryEmailAddress.emailAddress,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  if (!isLoaded) return null;

  // ── Signed in ─────────────────────────────────────────────────────────────
  if (isSignedIn) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-body-sm text-emerald-800">
          Sesión iniciada como{" "}
          <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
        </p>
        <SignOutButton>
          <button
            type="button"
            className="ml-auto shrink-0 text-caption text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-none"
          >
            ¿No eres tú?
          </button>
        </SignOutButton>
      </div>
    );
  }

  // ── Guest confirmed ────────────────────────────────────────────────────────
  if (panel === "guest") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border-soft bg-surface-subtle px-4 py-3">
        <UserCheck className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
        <p className="text-body-md text-text-secondary">
          Comprando como <span className="font-medium text-text-primary">invitado</span>
        </p>
        <button
          type="button"
          onClick={() => setPanel("idle")}
          className="ml-auto text-caption text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
        >
          Cambiar
        </button>
      </div>
    );
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-border-soft bg-surface-subtle">
      {/* Header — always visible */}
      <div className="flex items-center justify-between gap-4 px-4 py-3.5">
        <div>
          <p className="text-body-md font-semibold text-text-primary">¿Tienes una cuenta?</p>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            Inicia sesión para agilizar tu compra y ver tu historial.
          </p>
        </div>
      </div>

      {/* Animated bottom section */}
      <AnimatePresence mode="wait" initial={false}>
        {panel === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.55, 0, 1, 0.45] } }}
            className="overflow-hidden border-t border-border-soft/60"
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setPanel("sign-in")}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-white px-4 text-body-sm font-medium text-text-primary transition hover:border-border-brand hover:bg-brand-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setPanel("sign-up")}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-white px-4 text-body-sm font-medium text-text-primary transition hover:border-border-brand hover:bg-brand-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Crear cuenta
              </button>
              <button
                type="button"
                onClick={() => setPanel("guest")}
                className="ml-auto text-body-sm text-text-muted transition hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Continuar como invitado
              </button>
            </div>
          </motion.div>
        )}

        {(panel === "sign-in" || panel === "sign-up") && (
          <motion.div
            key={panel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.55, 0, 1, 0.45] } }}
            className="overflow-hidden border-t border-border-soft/60"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="px-4 pt-3 text-body-sm font-medium text-text-primary">
                {panel === "sign-in" ? "Iniciar sesión" : "Crear cuenta"}
              </p>
              {panel === "sign-in"
                ? <CheckoutInlineSignIn onBack={() => setPanel("idle")} />
                : <CheckoutInlineSignUp onBack={() => setPanel("idle")} />
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CheckoutPageClient ───────────────────────────────────────────────────────

export function CheckoutPageClient() {
  const { items, subtotal, itemCount } = useCart();
  const reduceMotion = useReducedMotion() ?? false;

  const [mounted, setMounted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [shippingMethod, setShippingMethod] = useState<CheckoutShippingMethod>("standard");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const {
    preview: pricingPreview,
    isLoading: isPricingLoading,
    errorMessage: pricingError,
    draftCouponCode,
    setDraftCouponCode,
    applyCouponCode,
    appliedCouponCode,
    hasPendingCouponChanges,
  } = useCheckoutPricingPreview({
    items,
    shippingMethod,
  });
  const summaryDisplayTotal = pricingPreview?.totals.total
    ?? subtotal + resolveCheckoutShippingBaseCost(shippingMethod);

  useEffect(() => { setMounted(true); }, []);

  // ── Loading guard — prevents SSR/client hydration mismatch ───────────────

  if (!mounted) {
    return <div className="min-h-screen bg-surface-canvas" />;
  }

  // ── Empty cart state ──────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.moderate,
            ease: motionTokens.ease.soft,
          }}
          className="flex flex-col items-center"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft">
            <ShoppingBag className="h-8 w-8 text-text-muted" aria-hidden="true" />
          </div>
          <h1 className="text-headline-md font-semibold text-text-primary">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-body-md text-text-muted">
            Agrega productos antes de continuar con el checkout.
          </p>
          <Link
            href="/productos"
            className="mt-8 inline-flex items-center gap-2 rounded-pill bg-brand-primary px-7 py-3 text-label-md font-semibold text-white transition-colors duration-base hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Ver productos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Submit handler (no real submission) ───────────────────────────────────

  function handleSubmit() {
    if (buttonState !== "idle") return;
    setButtonState("submitting");
    setTimeout(() => {
      setButtonState("done");
      setTimeout(() => {
        setButtonState("idle");
      }, 2200);
    }, 1800);
  }

  // ── Button motion config ──────────────────────────────────────────────────

  const buttonMotionProps =
    buttonState === "idle" && !reduceMotion
      ? {
          whileHover: {
            scale: 1.012,
            y: -1,
            transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.soft },
          },
          whileTap: {
            scale: motionTokens.scale.press,
            transition: { duration: motionTokens.duration.instant, ease: motionTokens.ease.standard },
          },
        }
      : {};

  // ── Summary toggle animation ──────────────────────────────────────────────

  const summaryVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.exit },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft },
    },
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen overflow-x-clip bg-surface-canvas">
      {/* ── Mobile order summary toggle (hidden on lg) ─────────────────────── */}
      <div className="border-b border-border-soft bg-surface-subtle lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
          aria-expanded={summaryOpen}
          aria-controls="mobile-order-summary"
        >
          <span className="flex items-center gap-2 text-body-sm font-medium text-brand-primary">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {summaryOpen ? "Ocultar resumen" : "Mostrar resumen del pedido"}
          </span>
          <motion.span
            animate={{ rotate: summaryOpen ? 180 : 0 }}
            transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.standard }}
            className="ml-1 text-brand-primary"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.span>
          <span className="ml-auto text-label-md font-bold tabular-nums text-text-primary">
            {fmt.format(summaryDisplayTotal)}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div
              id="mobile-order-summary"
              key="mobile-summary"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={summaryVariants}
              className="overflow-hidden"
            >
              <div className="border-t border-border-soft px-4 py-5">
                <CheckoutOrderSummary
                  items={items}
                  subtotal={subtotal}
                  shippingMethod={shippingMethod}
                  preview={pricingPreview}
                  discountCode={draftCouponCode}
                  onDiscountCodeChange={setDraftCouponCode}
                  onApplyDiscountCode={applyCouponCode}
                  appliedCouponCode={appliedCouponCode}
                  isPricingLoading={isPricingLoading}
                  pricingError={pricingError}
                  hasPendingCouponChanges={hasPendingCouponChanges}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="lg:mx-auto lg:w-[55vw] lg:min-w-[760px] lg:max-w-[980px]">
        <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── LEFT — form ──────────────────────────────────────────────── */}
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.moderate, ease: motionTokens.ease.soft }}
          className="px-6 pb-20 pt-10 sm:px-10 lg:px-12 xl:px-16"
        >
          {/* Back to shopping — above logo */}
          <div className="mb-5">
            <Link
              href="/productos"
              className="inline-flex items-center gap-1.5 text-label-sm text-text-muted underline-offset-2 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Seguir comprando
            </Link>
          </div>

          {/* Brand header — logo + secure badge */}
          <div className="mb-8 flex items-center">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              aria-label="Dermatologika — Ir al inicio"
            >
              <Image
                src="/logotipo.png"
                alt="Dermatologika"
                width={240}
                height={80}
                className="h-auto w-56 object-contain"
                priority
              />
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Pasos del checkout" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href="/productos"
                  className="text-label-sm text-text-secondary underline-offset-2 hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  Carrito
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </li>
              <li>
                <BreadcrumbStep label="Información" isActive />
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </li>
              <li>
                <BreadcrumbStep label="Envío" isFuture />
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </li>
              <li>
                <BreadcrumbStep label="Pago" isFuture />
              </li>
            </ol>
          </nav>

          {/* ── Identity gate ────────────────────────────────────────────── */}
          <CheckoutIdentityGate onUserReady={({ email, firstName: fn, lastName: ln }) => {
            setEmail(email);
            if (fn) setFirstName(fn);
            if (ln) setLastName(ln);
          }} />

          {/* ── Contacto ─────────────────────────────────────────────────── */}
          <FormSection title="Contacto">
            <Field
              label="Correo electrónico"
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={setEmail}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </FormSection>

          {/* ── Información de entrega ──────────────────────────────────── */}
          <FormSection title="Información de entrega">
            {/* Name row */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Field
                label="Nombre"
                id="checkout-first-name"
                required
                value={firstName}
                onChange={setFirstName}
                placeholder="Nombre"
                autoComplete="given-name"
              />
              <Field
                label="Apellido"
                id="checkout-last-name"
                required
                value={lastName}
                onChange={setLastName}
                placeholder="Apellido"
                autoComplete="family-name"
              />
            </div>

            {/* Address */}
            <Field
              label="Dirección"
              id="checkout-address"
              required
              value={address}
              onChange={setAddress}
              placeholder="Calle y número exterior"
              autoComplete="address-line1"
              className="mb-3"
            />

            {/* Apartment */}
            <Field
              label="Apartamento, suite, etc."
              id="checkout-apartment"
              value={apartment}
              onChange={setApartment}
              placeholder="Apartamento, interior, depto…"
              autoComplete="address-line2"
              optional
              className="mb-4"
            />

            {/* Province / City row */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {/* Province dropdown */}
              <div>
                <label
                  htmlFor="checkout-province"
                  className="mb-1.5 block text-label-sm font-medium text-text-secondary"
                >
                  Provincia <span className="text-status-error" aria-hidden="true"> *</span>
                </label>
                <select
                  id="checkout-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-body-sm font-medium text-text-primary transition-[border-color,box-shadow,background-color] duration-fast hover:border-border-brand hover:bg-brand-soft/20 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="">Selecciona una provincia</option>
                  {ecuadorProvinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Ciudad"
                id="checkout-city"
                required
                value={city}
                onChange={setCity}
                placeholder="Ingresa tu ciudad"
                autoComplete="address-level2"
                className="col-span-1"
              />
            </div>



            {/* Phone + ID */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Teléfono"
                id="checkout-phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+593 99 000 0000"
                autoComplete="tel"
                optional
              />
              <Field
                label="Cédula o RUC"
                id="checkout-id-number"
                value={idNumber}
                onChange={setIdNumber}
                placeholder="0000000000"
                autoComplete="off"
                optional
              />
            </div>
          </FormSection>

          {/* ── Método de envío ──────────────────────────────────────────── */}
          <FormSection title="Método de envío">
            <div className="overflow-hidden rounded-xl border border-border-soft divide-y divide-border-soft">
              {/* Standard shipping */}
              <button
                type="button"
                onClick={() => setShippingMethod("standard")}
                className={cx(
                  "flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary",
                  shippingMethod === "standard" ? "bg-brand-soft/40" : "bg-white hover:bg-surface-subtle",
                )}
                aria-pressed={shippingMethod === "standard"}
              >
                <div
                  className={cx(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-fast",
                    shippingMethod === "standard" ? "border-brand-primary" : "border-border-strong",
                  )}
                >
                  {shippingMethod === "standard" && (
                    <div className="h-2 w-2 rounded-full bg-brand-primary" />
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">Envío a domicilio</p>
                    <p className="text-caption text-text-muted">1 a 2 días hábiles</p>
                  </div>
                </div>
                <span className="text-body-sm font-medium text-text-primary">$6.00</span>
              </button>

              {/* Pickup in store */}
              <button
                type="button"
                onClick={() => setShippingMethod("pickup")}
                className={cx(
                  "flex w-full items-center gap-3 px-4 py-4 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary",
                  shippingMethod === "pickup" ? "bg-brand-soft/40" : "bg-white hover:bg-surface-subtle",
                )}
                aria-pressed={shippingMethod === "pickup"}
              >
                <div
                  className={cx(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-fast",
                    shippingMethod === "pickup" ? "border-brand-primary" : "border-border-strong",
                  )}
                >
                  {shippingMethod === "pickup" && (
                    <div className="h-2 w-2 rounded-full bg-brand-primary" />
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <Store className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">
                      Retiro en Tienda Dermatológika
                    </p>
                    <p className="text-caption text-text-muted">Coordinamos por WhatsApp</p>
                  </div>
                </div>
                <span className="text-body-sm font-medium text-status-success">Gratis</span>
              </button>
            </div>
          </FormSection>

          {/* ── Pago (placeholder) ───────────────────────────────────────── */}
          <FormSection title="Pago">
            <div className="overflow-hidden rounded-xl border border-border-soft">
              <div className="flex items-center gap-3 bg-surface-subtle px-4 py-4">
                <Lock className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                <p className="text-body-sm text-text-muted">
                  Todos los pagos están cifrados y son seguros.
                  El método de pago se seleccionará al siguiente paso.
                </p>
              </div>
              {/* Placeholder card fields */}
              <div className="space-y-3 bg-surface-soft/60 px-4 py-4 opacity-50 pointer-events-none select-none" aria-hidden="true">
                <div className="h-10 rounded-md border border-border bg-white" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 rounded-md border border-border bg-white" />
                  <div className="h-10 rounded-md border border-border bg-white" />
                </div>
              </div>
            </div>
          </FormSection>

          {/* ── Submit button ─────────────────────────────────────────────── */}
          <div className="border-t border-border-soft/40 pt-6 mt-2">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={buttonState !== "idle"}
              {...buttonMotionProps}
              className={cx(
                "relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-pill px-8 py-3.5 text-label-md font-semibold text-white",
                "shadow-[0_2px_12px_rgba(114,178,85,0.30)] transition-[background-color,box-shadow,opacity] duration-base",
                buttonState === "done"
                  ? "bg-status-success shadow-[0_2px_12px_rgba(46,139,87,0.28)]"
                  : "bg-brand-primary hover:bg-brand-primaryHover",
                buttonState !== "idle" && "cursor-default opacity-95",
              )}
              aria-live="polite"
              aria-label={
                buttonState === "idle"
                  ? "Finalizar compra"
                  : buttonState === "submitting"
                  ? "Procesando pedido…"
                  : "Pedido recibido"
              }
            >
              <AnimatePresence mode="wait">
                {buttonState === "idle" && (
                  <motion.span
                    key="idle"
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{
                      duration: motionTokens.duration.fast,
                      ease: motionTokens.ease.soft,
                    }}
                  >
                    Finalizar compra
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                )}

                {buttonState === "submitting" && (
                  <motion.span
                    key="submitting"
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      duration: motionTokens.duration.fast,
                      ease: motionTokens.ease.soft,
                    }}
                  >
                    <Spinner />
                    Procesando…
                  </motion.span>
                )}

                {buttonState === "done" && (
                  <motion.span
                    key="done"
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, scale: 0.8, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{
                      duration: motionTokens.duration.base,
                      ease: motionTokens.ease.soft,
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    ¡Pedido recibido!
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>


          </div>

          {/* ── Trust badges ─────────────────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-border-soft/40 pt-6">
            <span className="flex items-center gap-1.5 text-caption text-text-muted">
              <ShieldCheck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              Pago 100% seguro
            </span>
            <span className="flex items-center gap-1.5 text-caption text-text-muted">
              <Truck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              Envío a todo Ecuador
            </span>
            <span className="flex items-center gap-1.5 text-caption text-text-muted">
              <Lock className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
              Datos cifrados
            </span>
          </div>
        </motion.div>

        {/* ── RIGHT — order summary (desktop only) ─────────────────────────── */}
        <aside
          aria-label="Resumen del pedido"
          className="relative hidden border-l border-border-soft bg-[#f4faee] lg:block lg:min-h-screen after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-[100vw] after:bg-[#f4faee] after:content-['']"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: motionTokens.duration.moderate,
              ease: motionTokens.ease.soft,
              delay: 0.08,
            }}
            className="sticky top-0 max-h-screen overflow-y-auto px-8 py-12 pr-10 xl:px-10 xl:pr-12"
          >
            <h2 className="mb-6 text-body-lg font-semibold text-text-primary">
              Tu pedido
              <span className="ml-2 text-body-sm font-normal text-text-muted">
                ({itemCount} {itemCount === 1 ? "producto" : "productos"})
              </span>
            </h2>
            <CheckoutOrderSummary
              items={items}
              subtotal={subtotal}
              shippingMethod={shippingMethod}
              preview={pricingPreview}
              discountCode={draftCouponCode}
              onDiscountCodeChange={setDraftCouponCode}
              onApplyDiscountCode={applyCouponCode}
              appliedCouponCode={appliedCouponCode}
              isPricingLoading={isPricingLoading}
              pricingError={pricingError}
              hasPendingCouponChanges={hasPendingCouponChanges}
            />
          </motion.div>
        </aside>
      </div>
      </div>
    </div>
  );
}
