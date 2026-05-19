"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  ADMIN_COMPACT_FIELD_CLASS_NAME,
  ADMIN_COMPACT_READONLY_FIELD_CLASS_NAME,
} from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
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
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="space-y-2">
          <AdminBreadcrumbs
            items={[
              { label: "Mi cuenta", href: "/cuenta/perfil" },
              { label: "Privacidad" },
            ]}
          />
          <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
          <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Privacidad</h1>
        </div>
      </section>

      {/* Cookie preferences */}
      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
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
            className={ADMIN_BUTTON_PRIMARY_CLASS_NAME}
          >
            Guardar preferencias
          </button>
          {prefsSaved ? (
            <span className="text-body-sm text-emerald-700">Preferencias guardadas.</span>
          ) : null}
        </div>
      </section>

      {/* Password */}
      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
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
                  className={cx(ADMIN_COMPACT_FIELD_CLASS_NAME, "pr-10")}
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
                    ADMIN_COMPACT_FIELD_CLASS_NAME,
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
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
            >
              {passwordSaveState === "saving" ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </section>
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
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border-soft bg-surface-subtle px-4 py-3.5">
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
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          checked ? "bg-brand" : "bg-border-soft",
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
