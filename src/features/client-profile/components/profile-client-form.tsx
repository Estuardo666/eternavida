"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { cx } from "@/lib/utils";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-border-soft bg-white px-3.5 text-body-sm text-text-primary placeholder:text-text-muted transition hover:border-brand-primary/40 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none disabled:bg-surface-subtle disabled:text-text-muted";

const FIELD_READONLY_CLASS =
  "h-10 w-full rounded-lg border border-border-soft bg-surface-subtle px-3.5 text-body-sm text-text-muted cursor-default select-none";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-label-md font-semibold text-white transition-colors hover:bg-brand-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-subtle px-5 py-3 text-label-md font-medium text-text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50";

const CARD_CLASS = "rounded-xl border border-border-soft bg-surface-subtle p-5 sm:p-6";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export interface ClientProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
}

interface ProfileClientFormProps {
  initialProfile: ClientProfileData;
}

type SaveState = "idle" | "saving" | "success" | "error";

export function ProfileClientForm({ initialProfile }: ProfileClientFormProps) {
  const router = useRouter();

  const [profile, setProfile] = useState(initialProfile);
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [username, setUsername] = useState(initialProfile.username);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSaveState, setAvatarSaveState] = useState<SaveState>("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [infoSaveState, setInfoSaveState] = useState<SaveState>("idle");
  const [infoError, setInfoError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const infoDirty =
    firstName !== profile.firstName ||
    lastName !== profile.lastName ||
    username !== profile.username;

  function handleAvatarFileChange(file: File | null) {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(null);
    setAvatarSaveState("idle");
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setAvatarSaveState("saving");
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const res = await fetch("/api/client/profile/avatar", { method: "POST", body: formData });
      const json = await res.json() as { success: boolean; data?: { imageUrl: string }; error?: { message: string } };

      if (!json.success) throw new Error(json.error?.message ?? "Error al subir imagen.");

      setProfile((p) => ({ ...p, imageUrl: json.data!.imageUrl }));
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarSaveState("success");
      router.refresh();
    } catch (error) {
      setAvatarSaveState("error");
      setAvatarError(error instanceof Error ? error.message : "Error al subir imagen.");
    }
  }

  async function handleInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInfoSaveState("saving");
    setInfoError(null);

    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username }),
      });
      const json = await res.json() as { success: boolean; data?: ClientProfileData; error?: { message: string } };

      if (!json.success) throw new Error(json.error?.message ?? "Error al guardar.");

      setProfile(json.data!);
      setFirstName(json.data!.firstName);
      setLastName(json.data!.lastName);
      setUsername(json.data!.username);
      setInfoSaveState("success");
      router.refresh();
    } catch (error) {
      setInfoSaveState("error");
      setInfoError(error instanceof Error ? error.message : "Error al guardar.");
    }
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

  const displayImageUrl = avatarPreview ?? profile.imageUrl;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="space-y-1"
      >
        <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Cuenta</p>
        <h1 className="text-headline-sm text-text-primary">Mi perfil</h1>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          {/* Avatar */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.1 }}
            className={CARD_CLASS}
          >
            <h2 className="text-section-lg text-text-primary">Foto de perfil</h2>

            <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                {displayImageUrl ? (
                  <Image
                    src={displayImageUrl}
                    alt="Foto de perfil"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-2xl border-2 border-border-brand object-cover"
                    unoptimized={Boolean(avatarPreview)}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-border-soft bg-surface-subtle text-headline-sm text-text-primary">
                    {profile.email.slice(0, 1).toUpperCase()}
                  </div>
                )}
                {avatarPreview ? (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-caption text-amber-700 ring-2 ring-white">
                    Pendiente
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-border-soft/60 bg-white/70 px-3.5 py-2.5">
                  <p className="text-body-sm text-text-secondary">
                    {avatarFile ? `Listo para subir: ${avatarFile.name}` : "Formatos: JPG, PNG, WebP. Máximo 4 MB."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className={BTN_SECONDARY}
                  >
                    <UploadIcon className="h-4 w-4" />
                    {avatarFile ? "Cambiar imagen" : "Subir foto"}
                  </button>

                  {avatarFile ? (
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={avatarSaveState === "saving"}
                      className={BTN_PRIMARY}
                    >
                      {avatarSaveState === "saving" ? "Subiendo..." : "Guardar foto"}
                    </button>
                  ) : null}
                </div>

                {avatarError ? <p className="text-body-sm text-status-error">{avatarError}</p> : null}
                {avatarSaveState === "success" && !avatarFile ? (
                  <p className="text-body-sm text-emerald-700">Foto actualizada correctamente.</p>
                ) : null}

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleAvatarFileChange(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </motion.section>

          {/* Personal info */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.18 }}
            className={CARD_CLASS}
          >
            <h2 className="text-section-lg text-text-primary">Información personal</h2>

            <form id="profile-info-form" onSubmit={handleInfoSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="block text-label-md text-text-primary">Nombre</span>
                  <input
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setInfoSaveState("idle"); }}
                    className={FIELD_CLASS}
                    placeholder="Nombre"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="block text-label-md text-text-primary">Apellido</span>
                  <input
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setInfoSaveState("idle"); }}
                    className={FIELD_CLASS}
                    placeholder="Apellido"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="block text-label-md text-text-primary">Usuario</span>
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setInfoSaveState("idle"); }}
                  className={FIELD_CLASS}
                  placeholder="nombre_usuario"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block text-label-md text-text-primary">Correo electrónico</span>
                <input value={profile.email} readOnly className={FIELD_READONLY_CLASS} />
                <p className="text-caption text-text-muted">
                  Para cambiar el correo, contacta a atención al cliente.
                </p>
              </label>

              {infoError ? <p className="text-body-sm text-status-error">{infoError}</p> : null}
              {infoSaveState === "success" ? (
                <p className="text-body-sm text-emerald-700">Datos actualizados correctamente.</p>
              ) : null}
            </form>
          </motion.section>

          {/* Password */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: EASE, delay: 0.26 }}
            className={CARD_CLASS}
          >
            <h2 className="text-section-lg text-text-primary">Cambiar contraseña</h2>

            <form id="profile-password-form" onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
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
            </form>
          </motion.section>
        </div>

        {/* Sidebar summary */}
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: EASE, delay: 0.32 }}
          className="space-y-4 xl:sticky xl:top-6 xl:self-start"
        >
          <section className={CARD_CLASS}>
            <h2 className="text-section-lg text-text-primary">Resumen</h2>

            <div className="mt-4 space-y-3 text-body-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="whitespace-nowrap text-text-secondary">Email</span>
                <span className="break-all text-right text-label-sm leading-snug text-text-primary">{profile.email}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="whitespace-nowrap text-text-secondary">Nombre</span>
                <span className="text-right text-label-sm leading-snug text-text-primary">
                  {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="whitespace-nowrap text-text-secondary">Usuario</span>
                <span className="text-right text-label-sm leading-snug text-text-primary">{profile.username || "—"}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border-soft pt-5">
              <button
                type="submit"
                form="profile-info-form"
                disabled={infoSaveState === "saving" || !infoDirty}
                className={cx("w-full", BTN_PRIMARY)}
              >
                {infoSaveState === "saving" ? "Guardando..." : "Guardar información"}
              </button>

              <button
                type="submit"
                form="profile-password-form"
                disabled={passwordSaveState === "saving" || !newPassword}
                className={cx("w-full", BTN_SECONDARY)}
              >
                {passwordSaveState === "saving" ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </div>
          </section>
        </motion.aside>
      </div>
    </div>
  );
}

function UploadIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path d="M12 16V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
