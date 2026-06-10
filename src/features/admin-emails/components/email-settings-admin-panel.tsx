"use client";

import { useState, type FormEvent } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";

type SubmissionState = "idle" | "saving" | "success" | "error";
type TestState = "idle" | "sending" | "success" | "error";

const TEMPLATE_OPTIONS = [
  { value: "test_email", label: "Correo de prueba" },
  { value: "order_confirmation", label: "Confirmación de pedido" },
  { value: "order_status_update", label: "Cambio de estado de pedido" },
  { value: "order_admin_notification", label: "Notificación admin de pedido" },
  { value: "contact_lead_notification", label: "Notificación de lead" },
  { value: "welcome_user", label: "Bienvenida" },
] as const;

interface EmailSettingsFormState {
  adminEmails: string[];
  testMode: boolean;
  testEmails: string[];
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

interface Props {
  initialSettings: EmailSettingsFormState;
}

type TestResult = {
  success?: boolean;
  logId?: string;
  resendId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
};

function normalizeEmails(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

function getResendErrorHelp(message: string): string | null {
  if (message.includes("only send testing emails to your own email address")) {
    return "Resend está en modo de pruebas. Solo puedes enviar a tu propia dirección de Resend hasta verificar un dominio y usar un remitente de ese dominio.";
  }

  return null;
}

function AutofillSafeEmailInput(props: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  function unlock() {
    if (!isUnlocked) {
      setIsUnlocked(true);
    }
  }

  return (
    <input
      id={props.id}
      name={props.name}
      type="text"
      inputMode="email"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      onFocus={unlock}
      onPointerDown={unlock}
      onKeyDown={unlock}
      className={ADMIN_COMPACT_FIELD_CLASS_NAME}
      placeholder={props.placeholder}
      readOnly={!isUnlocked}
      autoComplete="new-password"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-form-type="other"
    />
  );
}

function EmailListEditor(props: {
  label: string;
  description: string;
  values: string[];
  onChange: (values: string[]) => void;
  addLabel: string;
  inputNamePrefix: string;
}) {
  const values = props.values.length > 0 ? props.values : [""];

  function updateValue(index: number, nextValue: string) {
    props.onChange(values.map((value, currentIndex) => (currentIndex === index ? nextValue : value)));
  }

  function addValue() {
    props.onChange([...values, ""]);
  }

  function removeValue(index: number) {
    props.onChange(values.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className={ADMIN_INSET_CARD_CLASS_NAME}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-label-md font-semibold text-text-primary">{props.label}</h3>
          <p className="mt-1 text-body-sm text-text-secondary">{props.description}</p>
        </div>
        <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={addValue}>
          {props.addLabel}
        </button>
      </div>

      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={`${props.label}-${index}`} className="flex items-center gap-3">
            <AutofillSafeEmailInput
              id={`${props.inputNamePrefix}-${index}`}
              name={`${props.inputNamePrefix}-${index}`}
              value={value}
              onChange={(nextValue) => updateValue(index, nextValue)}
              placeholder="correo@dominio.com"
            />
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => removeValue(index)}
              disabled={values.length === 1 && value.trim().length === 0}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmailSettingsAdminPanel({ initialSettings }: Props) {
  const [form, setForm] = useState<EmailSettingsFormState>(initialSettings);
  const [submitState, setSubmitState] = useState<SubmissionState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState(initialSettings.adminEmails[0] ?? initialSettings.fromEmail);
  const [templateKey, setTemplateKey] = useState<string>("test_email");
  const [testState, setTestState] = useState<TestState>("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  function updateField<K extends keyof EmailSettingsFormState>(
    key: K,
    value: EmailSettingsFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitState("idle");
    setSubmitError(null);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const adminEmails = normalizeEmails(form.adminEmails);
    const testEmails = normalizeEmails(form.testEmails);

    if (adminEmails.length === 0) {
      setSubmitState("error");
      setSubmitError("Agrega al menos un correo administrativo para recibir notificaciones.");
      return;
    }

    setSubmitState("saving");
    setSubmitError(null);

    try {
      const response = await fetch("/api/admin/email-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminEmails,
          testMode: form.testMode,
          testEmails,
          fromName: form.fromName.trim(),
          fromEmail: form.fromEmail.trim(),
          replyTo: form.replyTo.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: {
          adminEmails: string[];
          testMode: boolean;
          testEmails: string[];
          fromName: string;
          fromEmail: string;
          replyTo: string | null;
        };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudo guardar la configuración.");
      }

      setForm({
        adminEmails: payload.data.adminEmails,
        testMode: payload.data.testMode,
        testEmails: payload.data.testEmails,
        fromName: payload.data.fromName,
        fromEmail: payload.data.fromEmail,
        replyTo: payload.data.replyTo ?? "",
      });
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setSubmitError(getErrorMessage(error));
    }
  }

  async function handleSendTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTestState("sending");
    setTestError(null);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testTo.trim(),
          templateKey,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: TestResult;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "No se pudo enviar la prueba.");
      }

      setTestResult(payload.data ?? null);
      setTestState(payload.data?.skipped ? "error" : "success");
      if (payload.data?.skipped) {
        setTestError(payload.data.reason ?? "El envío fue saltado antes de llegar a Resend.");
      }
    } catch (error) {
      setTestState("error");
      setTestError(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Configuración de correos" },
          ]}
        />
        <div className="mt-4 space-y-2">
          <h1 className="text-section-md font-semibold text-text-primary">Configuración de correos</h1>
          <p className="text-body-sm text-text-secondary">
            Definí destinatarios administrativos, modo de prueba y remitentes del sistema transaccional.
          </p>
        </div>
      </div>

      {form.testMode ? (
        <div className="rounded-2xl border border-[#d9d0a3] bg-[#faf7e8] px-5 py-4 text-body-sm text-[#7a6830]">
          Dominio no verificado o modo seguro activo. Solo se enviarán correos a emails administrativos o de prueba.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form className="space-y-5" onSubmit={handleSave} autoComplete="off">
          <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-label-md font-semibold text-text-primary">Parámetros generales</h2>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Estos valores controlan el remitente y el comportamiento de seguridad de los envíos.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-full border border-[#cfdbcb] bg-[#f8fbf7] px-4 py-2 text-label-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={form.testMode}
                  onChange={(event) => updateField("testMode", event.target.checked)}
                  className="h-4 w-4 accent-[#163c31]"
                />
                Modo test
              </label>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email-settings-from-name" className="mb-1 block text-label-sm text-text-secondary">
                  Nombre del remitente
                </label>
                <input
                  id="email-settings-from-name"
                  name="sender-display-name"
                  value={form.fromName}
                  onChange={(event) => updateField("fromName", event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Eterna Vida"
                  autoComplete="off"
                  autoCapitalize="words"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <div>
                <label htmlFor="email-settings-from-email" className="mb-1 block text-label-sm text-text-secondary">
                  Correo remitente
                </label>
                <AutofillSafeEmailInput
                  id="email-settings-from-email"
                  name="sender-address"
                  value={form.fromEmail}
                  onChange={(value) => updateField("fromEmail", value)}
                  placeholder="onboarding@resend.dev"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email-settings-reply-to" className="mb-1 block text-label-sm text-text-secondary">
                  Reply-to
                </label>
                <AutofillSafeEmailInput
                  id="email-settings-reply-to"
                  name="reply-to-address"
                  value={form.replyTo}
                  onChange={(value) => updateField("replyTo", value)}
                  placeholder="soporte@eternavida.com.ec"
                />
              </div>
            </div>
          </div>

          <EmailListEditor
            label="Correos administrativos"
            description="Reciben avisos de nuevos pedidos y nuevos leads. Se usan también como allowlist en modo test."
            values={form.adminEmails}
            onChange={(values) => updateField("adminEmails", values)}
            addLabel="+ Agregar admin"
            inputNamePrefix="admin-recipient"
          />

          <EmailListEditor
            label="Correos de prueba"
            description="Destinatarios adicionales permitidos cuando el modo test está activo."
            values={form.testEmails}
            onChange={(values) => updateField("testEmails", values)}
            addLabel="+ Agregar prueba"
            inputNamePrefix="test-recipient"
          />

          {submitError ? (
            <p className="rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} disabled={submitState === "saving"}>
              {submitState === "saving" ? "Guardando..." : "Guardar configuración"}
            </button>
            <button
              type="button"
              className={ADMIN_BUTTON_SECONDARY_CLASS_NAME}
              onClick={() => {
                setForm(initialSettings);
                setSubmitState("idle");
                setSubmitError(null);
              }}
            >
              Restablecer cambios
            </button>
            {submitState === "success" ? (
              <span className="text-body-sm text-[#2e6d45]">Configuración guardada.</span>
            ) : null}
          </div>
        </form>

        <div className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
          <h2 className="text-label-md font-semibold text-text-primary">Enviar correo de prueba</h2>
          <p className="mt-1 text-body-sm text-text-secondary">
            Ejecutá un envío manual para validar credenciales, allowlist y render de plantilla.
          </p>
          {form.testMode ? (
            <p className="mt-2 rounded-2xl border border-[#d9d0a3] bg-[#faf7e8] px-4 py-3 text-body-sm text-[#7a6830]">
              En Modo test, el destinatario debe existir en Correos administrativos o Correos de prueba. Si Resend sigue en modo sandbox, además solo enviará a la dirección dueña de la cuenta hasta verificar un dominio.
            </p>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSendTest} autoComplete="off">
            <div>
              <label htmlFor="email-settings-template" className="mb-1 block text-label-sm text-text-secondary">
                Plantilla
              </label>
              <select
                id="email-settings-template"
                name="test-template"
                value={templateKey}
                onChange={(event) => setTemplateKey(event.target.value)}
                className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                autoComplete="off"
              >
                {TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email-settings-test-to" className="mb-1 block text-label-sm text-text-secondary">
                Enviar a
              </label>
              <AutofillSafeEmailInput
                id="email-settings-test-to"
                name="test-recipient-address"
                value={testTo}
                onChange={setTestTo}
                placeholder="correo@dominio.com"
              />
            </div>

            {testError ? (
              <p className="rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
                {testError}
              </p>
            ) : null}

            {testResult?.error ? (
              <p className="rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
                {testResult.error}
                {getResendErrorHelp(testResult.error) ? ` ${getResendErrorHelp(testResult.error)}` : ""}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button type="submit" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} disabled={testState === "sending"}>
                {testState === "sending" ? "Enviando..." : "Enviar prueba"}
              </button>
              {testState === "success" ? (
                <span className="text-body-sm text-[#2e6d45]">Prueba ejecutada.</span>
              ) : null}
            </div>
          </form>

          {testResult ? (
            <div className={`${ADMIN_INSET_CARD_CLASS_NAME} mt-5 space-y-2`}>
              <h3 className="text-label-md font-semibold text-text-primary">Resultado</h3>
              <dl className="space-y-2 text-body-sm text-text-secondary">
                <div className="flex items-center justify-between gap-4">
                  <dt>Log ID</dt>
                  <dd className="font-mono text-text-primary">{testResult.logId ?? "-"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Resend ID</dt>
                  <dd className="font-mono text-text-primary">{testResult.resendId ?? "-"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Saltado</dt>
                  <dd className="text-text-primary">{testResult.skipped ? "Sí" : "No"}</dd>
                </div>
              </dl>
              {testResult.error ? (
                <p className="text-body-sm text-status-error">{testResult.error}</p>
              ) : null}
              {testResult.reason ? (
                <p className="text-body-sm text-status-error">{testResult.reason}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}