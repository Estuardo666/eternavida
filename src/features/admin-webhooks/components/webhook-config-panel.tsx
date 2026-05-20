"use client";

import { useEffect, useState } from "react";

import { ADMIN_COMPACT_FIELD_CLASS_NAME } from "@/components/admin/form-styles";
import {
  ADMIN_BUTTON_PRIMARY_CLASS_NAME,
  ADMIN_BUTTON_SECONDARY_CLASS_NAME,
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_INSET_CARD_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}

type WebhookConfigRecord = {
  id: string;
  enabled: boolean;
  webhookUrl: string | null;
  retryAttempts: number;
  timeoutMs: number;
  hasSecretToken: boolean;
  createdAt: string;
  updatedAt: string;
};

export function WebhookConfigPanel() {
  const [config, setConfig] = useState<WebhookConfigRecord | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [secretToken, setSecretToken] = useState("");
  const [retryAttempts, setRetryAttempts] = useState("3");
  const [timeoutMs, setTimeoutMs] = useState("10000");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadConfig() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/webhook-config");
      const payload = (await response.json()) as { success?: boolean; error?: string; data?: WebhookConfigRecord };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudo cargar la configuracion.");
      }

      setConfig(payload.data);
      setEnabled(payload.data.enabled);
      setWebhookUrl(payload.data.webhookUrl ?? "");
      setRetryAttempts(String(payload.data.retryAttempts));
      setTimeoutMs(String(payload.data.timeoutMs));
      setSecretToken("");
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadConfig();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/webhook-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          webhookUrl,
          secretToken,
          retryAttempts,
          timeoutMs,
        }),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; data?: WebhookConfigRecord };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudo guardar la configuracion.");
      }

      setConfig(payload.data);
      setSecretToken("");
      setFeedback("Configuracion guardada.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendTest() {
    setIsSendingTest(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/webhook-config", { method: "POST" });
      const payload = (await response.json()) as { success?: boolean; error?: string; data?: { eventId: string } };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "No se pudo enviar el evento de prueba.");
      }

      setFeedback(`Evento de prueba enviado. Id: ${payload.data.eventId}`);
    } catch (sendError) {
      setError(getErrorMessage(sendError));
    } finally {
      setIsSendingTest(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <AdminBreadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Integraciones" },
            { label: "Configuracion de webhooks" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-section-md font-semibold text-text-primary">Configuracion de webhooks</h1>
          <p className="mt-1 max-w-3xl text-body-sm text-text-secondary">
            Define la URL de la API externa, el token de firma y la politica de reintentos para los eventos de pedidos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
          {error ? (
            <p className="mb-4 rounded-2xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-body-sm text-status-error">
              {error}
            </p>
          ) : null}
          {feedback ? (
            <p className="mb-4 rounded-2xl border border-[#c8dcbf] bg-[#eef8ea] px-4 py-3 text-body-sm text-[#2f6d44]">
              {feedback}
            </p>
          ) : null}

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-[#c8d9c4] p-8 text-center text-text-secondary">
              Cargando configuracion...
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-[#d8e3d4] px-4 py-3">
                <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
                <span className="text-body-sm font-medium text-text-primary">Habilitar webhook</span>
              </label>

              <label className="space-y-1">
                <span className="text-caption text-text-muted">URL del webhook</span>
                <input
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="https://api-externa.com/webhooks/orders"
                />
              </label>

              <label className="space-y-1">
                <span className="text-caption text-text-muted">
                  Secret token {config?.hasSecretToken ? "(hay uno guardado)" : ""}
                </span>
                <input
                  type="password"
                  value={secretToken}
                  onChange={(event) => setSecretToken(event.target.value)}
                  className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                  placeholder="Nuevo token para firma HMAC-SHA256"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-caption text-text-muted">Intentos de reintento</span>
                  <input
                    value={retryAttempts}
                    onChange={(event) => setRetryAttempts(event.target.value)}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    inputMode="numeric"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-caption text-text-muted">Timeout (ms)</span>
                  <input
                    value={timeoutMs}
                    onChange={(event) => setTimeoutMs(event.target.value)}
                    className={ADMIN_COMPACT_FIELD_CLASS_NAME}
                    inputMode="numeric"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS_NAME} onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button type="button" className={ADMIN_BUTTON_SECONDARY_CLASS_NAME} onClick={() => void handleSendTest()} disabled={isSendingTest}>
                  {isSendingTest ? "Enviando..." : "Enviar evento de prueba"}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <h2 className="text-label-md font-semibold text-text-primary">Headers enviados</h2>
            <div className="mt-4 space-y-2 text-body-sm text-text-secondary">
              <div className={ADMIN_INSET_CARD_CLASS_NAME}>X-Webhook-Signature: sha256=&lt;hex&gt;</div>
              <div className={ADMIN_INSET_CARD_CLASS_NAME}>X-Webhook-Event: order.updated</div>
              <div className={ADMIN_INSET_CARD_CLASS_NAME}>X-Webhook-Id: cuid</div>
            </div>
          </section>

          <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
            <h2 className="text-label-md font-semibold text-text-primary">Payload</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#d8e3d4] bg-[#f8fbf7] p-4 text-caption text-text-secondary">{`{
  "event": "order.status_changed",
  "timestamp": "2026-05-20T12:00:00.000Z",
  "payload": {
    "order": {
      "orderNumber": "DRM-ABC123",
      "status": "processing",
      "paymentStatus": "paid",
      "items": [
        { "name": "Producto", "quantity": 2, "price": "25.00" }
      ]
    },
    "changes": {
      "oldStatus": "confirmed",
      "newStatus": "processing"
    }
  }
}`}</pre>
          </section>
        </aside>
      </div>
    </div>
  );
}
