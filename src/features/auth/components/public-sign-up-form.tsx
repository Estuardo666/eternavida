"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSignUp, useUser } from "@clerk/nextjs";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, RefreshCcw } from "lucide-react";

import { normalizeClerkErrorMessage } from "@/features/auth/lib/normalize-clerk-error";
import { motionTokens } from "@/motion/tokens";
import { cx } from "@/lib/utils";

type SignUpStep = "details" | "verification";
type SignUpFormState = "idle" | "submitting" | "verifying" | "error";

const pillInput =
  "h-10 w-full rounded-full border border-border-soft bg-surface-canvas px-5 text-body-sm text-text-primary placeholder:text-body-sm placeholder:text-text-muted transition hover:border-brand-primary/40 hover:bg-[rgba(114,178,85,0.04)] focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted";

const pillButton =
  "h-10 w-full rounded-full font-medium text-body-sm transition-all hover:brightness-[0.88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-50";

export function PublicSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirectTo") || "/", [searchParams]);
  const { signUp, fetchStatus } = useSignUp();
  const { isLoaded, isSignedIn } = useUser();
  const isAuthReady = fetchStatus === "idle" && signUp !== null;
  const reduceMotion = useReducedMotion() ?? false;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [step, setStep] = useState<SignUpStep>("details");
  const [formState, setFormState] = useState<SignUpFormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    startTransition(() => {
      router.replace(redirectTarget);
    });
  }, [isLoaded, isSignedIn, redirectTarget, router]);

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!acceptsTerms) {
      setFormState("error");
      setErrorMessage("Debes aceptar los términos para crear tu cuenta.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setFormState("error");
      setErrorMessage("Completa todos los campos para continuar.");
      return;
    }
    if (password.length < 8) {
      setFormState("error");
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!isAuthReady || !signUp) {
      setFormState("error");
      setErrorMessage("El registro seguro todavía se está inicializando. Inténtalo nuevamente en un momento.");
      return;
    }

    setFormState("submitting");

    try {
      const signUpAttempt = await signUp.password({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      });

      if (signUpAttempt.error) throw signUpAttempt.error;

      if (signUp.status === "complete") {
        const finalizeResult = await signUp.finalize();
        if (finalizeResult.error) throw finalizeResult.error;
        startTransition(() => {
          router.replace(redirectTarget);
        });
        return;
      }

      const sendCodeResult = await signUp.verifications.sendEmailCode();
      if (sendCodeResult.error) throw sendCodeResult.error;

      setStep("verification");
      setFormState("verifying");
      setInfoMessage(`Enviamos un código a ${email.trim()}. Ingrésalo para activar tu cuenta.`);
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        normalizeClerkErrorMessage(
          error,
          "No fue posible crear tu cuenta. Revisa los datos e inténtalo nuevamente.",
        ),
      );
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!verificationCode.trim()) {
      setFormState("error");
      setErrorMessage("Ingresa el código de verificación que recibiste por correo.");
      return;
    }
    if (!isAuthReady || !signUp) {
      setFormState("error");
      setErrorMessage("Todavía no podemos verificar el código. Inténtalo de nuevo en un momento.");
      return;
    }

    setFormState("submitting");

    try {
      const verificationAttempt = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (verificationAttempt.error) throw verificationAttempt.error;

      if (signUp.status !== "complete") {
        setFormState("error");
        setErrorMessage("No pudimos completar la verificación. Solicita un nuevo código e inténtalo de nuevo.");
        return;
      }

      const finalizeResult = await signUp.finalize();
      if (finalizeResult.error) throw finalizeResult.error;

      startTransition(() => {
        router.replace(redirectTarget);
      });
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        normalizeClerkErrorMessage(
          error,
          "El código no fue aceptado. Revisa el correo y vuelve a intentarlo.",
        ),
      );
    }
  }

  async function handleResendCode() {
    if (!isAuthReady || !signUp) return;

    setFormState("submitting");
    setErrorMessage(null);

    try {
      const resendResult = await signUp.verifications.sendEmailCode();
      if (resendResult.error) throw resendResult.error;

      setFormState("verifying");
      setInfoMessage(`Reenviamos un nuevo código a ${email.trim()}.`);
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        normalizeClerkErrorMessage(
          error,
          "No fue posible reenviar el código. Espera unos segundos e inténtalo de nuevo.",
        ),
      );
    }
  }

  const isSubmitting = formState === "submitting";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* ── Step 1: details ───────────────────────────────────── */}
      {step === "details" ? (
        <motion.form
          key="sign-up-details"
          onSubmit={handleCreateAccount}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
          className="space-y-3"
          noValidate
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-first-name" className="sr-only">
                Nombre
              </label>
              <input
                id="su-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Nombre"
                required
                disabled={isSubmitting}
                className={pillInput}
              />
            </div>
            <div>
              <label htmlFor="su-last-name" className="sr-only">
                Apellido
              </label>
              <input
                id="su-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Apellido"
                required
                disabled={isSubmitting}
                className={pillInput}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="su-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="su-email"
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
              disabled={isSubmitting}
              className={pillInput}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="su-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="su-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Contraseña (mínimo 8 caracteres)"
              required
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

          {/* Terms */}
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-soft bg-surface-canvas px-4 py-3">
            <input
              type="checkbox"
              checked={acceptsTerms}
              onChange={(e) => {
                setAcceptsTerms(e.target.checked);
                setErrorMessage(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-soft accent-brand-primary"
              disabled={isSubmitting}
            />
            <span className="text-body-sm text-text-secondary">
              Acepto los términos y condiciones para usar mi cuenta Dermatologika.
            </span>
          </label>

          <AnimatePresence initial={false}>
            {errorMessage ? (
              <motion.p
                key="su-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-2 text-body-sm text-status-error"
              >
                {errorMessage}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div id="clerk-captcha" />

          <motion.button
            type="submit"
            disabled={
              !firstName.trim() ||
              !lastName.trim() ||
              !email.trim() ||
              !password ||
              !acceptsTerms ||
              !isAuthReady ||
              isSubmitting
            }
            {...(!reduceMotion ? { whileTap: { scale: 0.98 } } : {})}
            className={cx(pillButton, "bg-brand-primary text-white hover:bg-brand-primary/90")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creando cuenta...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </motion.button>
        </motion.form>
      ) : (
        /* ── Step 2: OTP verification ──────────────────────────── */
        <motion.form
          key="sign-up-verification"
          onSubmit={handleVerifyCode}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.soft }}
          className="space-y-3"
          noValidate
        >
          {/* Info badge */}
          {infoMessage ? (
            <div className="rounded-2xl border border-border-soft bg-surface-canvas px-4 py-3">
              <p className="text-body-sm text-text-secondary">{infoMessage}</p>
            </div>
          ) : null}

          {/* Code input */}
          <div>
            <label htmlFor="su-otp-code" className="sr-only">
              Código de verificación
            </label>
            <input
              id="su-otp-code"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, ""));
                setErrorMessage(null);
              }}
              placeholder="Código de 6 dígitos"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={isSubmitting}
              className={cx(pillInput, "text-center tracking-[0.3em]")}
            />
          </div>

          <AnimatePresence initial={false}>
            {errorMessage ? (
              <motion.p
                key="otp-error"
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
            disabled={!verificationCode.trim() || !isAuthReady || isSubmitting}
            {...(!reduceMotion ? { whileTap: { scale: 0.98 } } : {})}
            className={cx(pillButton, "bg-brand-primary text-white hover:bg-brand-primary/90")}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Validando código...
              </span>
            ) : (
              "Confirmar código"
            )}
          </motion.button>

          {/* Secondary actions */}
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting || !isAuthReady}
              className="flex items-center gap-1.5 text-body-sm text-text-secondary transition hover:text-text-primary disabled:opacity-50 focus-visible:outline-none"
            >
              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reenviar código
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setFormState("idle");
                setErrorMessage(null);
                setInfoMessage(null);
                setVerificationCode("");
              }}
              className="flex items-center gap-1.5 text-body-sm text-text-secondary transition hover:text-text-primary focus-visible:outline-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Cambiar datos
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
