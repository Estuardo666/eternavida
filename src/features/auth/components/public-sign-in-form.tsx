"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSignIn, useUser } from "@clerk/nextjs";
import { ArrowLeft, ChevronRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { normalizeClerkErrorMessage } from "@/features/auth/lib/normalize-clerk-error";
import { motionTokens } from "@/motion/tokens";
import { cx } from "@/lib/utils";

type SignInStep = "email" | "password";
type SignInFormState = "idle" | "submitting" | "error";

const pillInput =
  "h-10 w-full rounded-full border border-border-soft bg-surface-canvas px-5 text-body-sm text-text-primary placeholder:text-body-sm placeholder:text-text-muted transition hover:border-brand-primary/40 hover:bg-[rgba(11,93,30,0.04)] focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted";

const pillButton =
  "h-10 w-full rounded-full font-medium text-body-sm transition-all hover:brightness-[0.88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-50";

export function PublicSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Handle both our own ?redirectTo= and Clerk's ?redirect_url= added by auth.protect()
  const redirectTarget = useMemo(() => {
    const custom = searchParams.get("redirectTo");
    if (custom) return custom;
    const clerkRedirect = searchParams.get("redirect_url");
    if (clerkRedirect) {
      try {
        // redirect_url is a full absolute URL — extract just the pathname + search
        const url = new URL(clerkRedirect);
        return url.pathname + url.search;
      } catch {
        return "/";
      }
    }
    return "/";
  }, [searchParams]);
  const { signIn, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn } = useUser();
  const isAuthReady = fetchStatus === "idle" && signIn !== null;
  const reduceMotion = useReducedMotion() ?? false;

  const [step, setStep] = useState<SignInStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<SignInFormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    startTransition(() => {
      router.replace(redirectTarget);
    });
  }, [isLoaded, isSignedIn, redirectTarget, router]);

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const normalized = email.trim();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setFormState("error");
      setErrorMessage("Ingresa un correo electrónico válido.");
      return;
    }
    setFormState("idle");
    setStep("password");
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      setFormState("error");
      setErrorMessage("Ingresa tu contraseña para continuar.");
      return;
    }
    if (!isAuthReady || !signIn) {
      setFormState("error");
      setErrorMessage("El acceso seguro todavía se está inicializando. Inténtalo de nuevo en un momento.");
      return;
    }

    setFormState("submitting");
    setErrorMessage(null);

    try {
      const passwordResult = await signIn.password({
        identifier: email.trim(),
        password,
      });

      if (passwordResult.error) throw passwordResult.error;

      if (signIn.status !== "complete") {
        setFormState("error");
        setErrorMessage("Tu cuenta requiere un paso adicional que esta versión todavía no maneja.");
        return;
      }

      const finalizeResult = await signIn.finalize();
      if (finalizeResult.error) throw finalizeResult.error;

      startTransition(() => {
        router.replace(redirectTarget);
      });
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        normalizeClerkErrorMessage(
          error,
          "No fue posible iniciar sesión. Verifica tus datos e inténtalo nuevamente.",
        ),
      );
    }
  }

  function handleGoBack() {
    setStep("email");
    setPassword("");
    setErrorMessage(null);
    setFormState("idle");
  }

  const isSubmitting = formState === "submitting";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* ── Step 1: email ──────────────────────────────────────── */}
      {step === "email" ? (
        <motion.form
          key="step-email"
          onSubmit={handleContinue}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
          className="space-y-3"
          noValidate
        >
          <div>
            <label htmlFor="si-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="si-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Correo electrónico"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className={pillInput}
            />
          </div>

          <AnimatePresence initial={false}>
            {errorMessage ? (
              <motion.p
                key="email-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-2 text-body-sm text-status-error"
              >
                {errorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="submit"
            {...(!reduceMotion ? { whileTap: { scale: 0.98 } } : {})}
            className={cx(pillButton, "bg-brand-primary text-white hover:bg-brand-primary/90")}
          >
            <span className="flex items-center justify-center gap-2">
              Continuar
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </motion.button>
        </motion.form>
      ) : (
        /* ── Step 2: password ────────────────────────────────── */
        <motion.form
          key="step-password"
          onSubmit={handleSignIn}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
          className="space-y-3"
          noValidate
        >
          {/* Email identifier badge */}
          <div className="flex items-center gap-2 rounded-full border border-border-soft bg-surface-canvas px-4 py-2.5">
            <span className="flex-1 truncate text-body-sm text-text-primary">{email}</span>
            <button
              type="button"
              onClick={handleGoBack}
              className="flex shrink-0 items-center gap-1 text-label-sm text-brand-primary transition hover:text-brand-primary/70 focus-visible:outline-none"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Cambiar
            </button>
          </div>

          {/* Password field */}
          <div className="relative">
            <label htmlFor="si-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="si-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Contraseña"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={isSubmitting}
              className={cx(pillInput, "pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-secondary focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {errorMessage ? (
              <motion.p
                key="password-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-2 text-body-sm text-status-error"
              >
                {errorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* Remember me */}
          <label className="flex cursor-pointer items-center gap-2.5 px-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border-soft accent-brand-primary"
              disabled={isSubmitting}
            />
            <span className="text-body-sm text-text-secondary">Recordar mi sesión</span>
          </label>

          <motion.button
            type="submit"
            disabled={!password || !isAuthReady || isSubmitting}
            {...(!reduceMotion ? { whileTap: { scale: 0.98 } } : {})}
            className={cx(pillButton, "bg-brand-primary text-white hover:bg-brand-primary/90")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Validando acceso...
              </span>
            ) : (
              "Ingresar"
            )}
          </motion.button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
