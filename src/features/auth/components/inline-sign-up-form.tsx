"use client";

import { useEffect, useState } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { normalizeClerkErrorMessage } from "@/features/auth/lib/normalize-clerk-error";

const inlineInput =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3.5 text-body-sm text-text-primary placeholder:text-text-muted transition hover:border-brand-primary/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:bg-surface-subtle disabled:text-text-muted";

interface InlineSignUpFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  backLabel?: string;
}

export function InlineSignUpForm({
  onBack,
  onSuccess,
  backLabel = "Volver",
}: InlineSignUpFormProps) {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useUser();
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

  useEffect(() => {
    if (isSignedIn && onSuccess) {
      onSuccess();
    }
  }, [isSignedIn, onSuccess]);

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
      const attempt = await signUp.password({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      });
      if (attempt.error) throw attempt.error;
      if (signUp.status === "complete") {
        const fin = await signUp.finalize();
        if (fin.error) throw fin.error;
        onSuccess?.();
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
      onSuccess?.();
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
            <input
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inlineInput}
              autoFocus
            />
            <input
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inlineInput}
            />
          </div>
          <input
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inlineInput}
          />
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inlineInput}
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
            Ingresa el código que enviamos a{" "}
            <span className="font-medium text-text-primary">{email}</span>.
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
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-caption text-text-muted hover:text-text-secondary"
      >
        {backLabel}
      </button>
    </div>
  );
}
