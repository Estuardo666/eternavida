"use client";

import { useEffect, useState, type FormEvent } from "react";

import { motion } from "framer-motion";

import { cx } from "@/lib/utils";

const PREFS_COOKIE = "derma-privacy-prefs";

interface PrivacyPrefs {
  analytics: boolean;
  marketing: boolean;
}

function readPrivacyPrefs(): PrivacyPrefs {
  if (typeof document === "undefined") return { analytics: true, marketing: true };
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${PREFS_COOKIE}=`));
  if (!match) return { analytics: true, marketing: true };
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as PrivacyPrefs;
  } catch {
    return { analytics: true, marketing: true };
  }
}

function writePrivacyPrefs(prefs: PrivacyPrefs) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(JSON.stringify(prefs))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

type SaveState = "idle" | "saving" | "success" | "error";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3.5 text-body-sm text-text-primary placeholder:text-text-muted transition hover:border-brand-primary/40 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none disabled:bg-surface-subtle disabled:text-text-muted";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-subtle px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

export default function CuentaPrivacidadPage() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>({ analytics: true, marketing: true });
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setPrefs(readPrivacyPrefs());
  }, []);

  function handleToggle(key: keyof PrivacyPrefs) {
    setPrefs((p) => {
      const next = { ...p, [key]: !p[key] };
      return next;
    });
    setPrefsSaved(false);
  }

  function handleSavePrefs() {
    writePrivacyPrefs(prefs);
    setPrefsSaved(true);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaveState("saving");
    setPasswordError(null);

    try {
      const res = await fetch("/api/client/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const json = await res.json() as { success: boolean; error?: { message: string } };

      if (!json.success) throw new Error(json.error?.message ?? "Error al cambiar contraseña.");

      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaveState("success");
    } catch (error) {
      setPasswordSaveState("error");
      setPasswordError(error instanceof Error ? error.message : "Error al cambiar contraseña.");
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Privacidad</h1>
      </motion.div>

      {/* Cookie preferences */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
        className="rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-6"
      >
        <div className="space-y-1">
          <h2 className="text-section-lg text-text-primary">Cookies y seguimiento</h2>
          <p className="text-body-sm text-text-secondary">
            Gestiona las cookies que utilizamos para mejorar tu experiencia.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <ToggleRow
            id="cookies-necessary"
            label="Cookies necesarias"
            description="Imprescindibles para el funcionamiento del sitio. No se pueden desactivar."
            checked={true}
            disabled
            onChange={() => undefined}
          />

          <ToggleRow
            id="cookies-analytics"
            label="Cookies analíticas"
            description="Nos ayudan a entender cómo se utiliza el sitio para mejorarlo."
            checked={prefs.analytics}
            onChange={() => handleToggle("analytics")}
          />

          <ToggleRow
            id="cookies-marketing"
            label="Cookies de marketing"
            description="Permiten mostrarte contenido personalizado y ofertas relevantes."
            checked={prefs.marketing}
            onChange={() => handleToggle("marketing")}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSavePrefs}
            className={BTN_PRIMARY}
          >
            Guardar preferencias
          </button>
          {prefsSaved ? (
            <span className="text-body-sm text-emerald-700">Preferencias guardadas.</span>
          ) : null}
        </div>
      </motion.section>

      {/* Password */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.22 }}
        className="rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-6"
      >
        <div className="space-y-1">
          <h2 className="text-section-lg text-text-primary">Cambiar contraseña</h2>
          <p className="text-body-sm text-text-secondary">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="block text-label-md text-text-primary">Nueva contraseña</span>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordSaveState("idle"); }}
                  className={cx(FIELD_CLASS, "pr-10")}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-secondary"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={showNewPassword} />
                </button>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="block text-label-md text-text-primary">Confirmar contraseña</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSaveState("idle"); }}
                  className={cx(
                    FIELD_CLASS,
                    "pr-10",
                    confirmPassword && newPassword !== confirmPassword ? "border-status-error" : "",
                  )}
                  placeholder="Repetir contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text-secondary"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword ? (
                <span className="text-caption text-status-error">Las contraseñas no coinciden.</span>
              ) : null}
            </label>
          </div>

          {passwordError ? <p className="text-body-sm text-status-error">{passwordError}</p> : null}
          {passwordSaveState === "success" ? (
            <p className="text-body-sm text-emerald-700">Contraseña actualizada correctamente.</p>
          ) : null}

          <div>
            <button
              type="submit"
              disabled={passwordSaveState === "saving" || !newPassword}
              className={BTN_SECONDARY}
            >
              {passwordSaveState === "saving" ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function ToggleRow({ id, label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border-soft/80 bg-white/70 px-4 py-3.5">
      <div className="space-y-0.5">
        <p className="text-label-md text-text-primary">{label}</p>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={cx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          checked ? "bg-brand-primary" : "bg-border-soft",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
