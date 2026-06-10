"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

interface Settings {
  id: string;
  isEnabled: boolean;
  emailSubject: string;
  maxAlertsPerProduct: number;
  expiresAfterDays: number;
}

interface AlertItem {
  id: string;
  email: string;
  productId: string;
  product: { name: string; slug: string };
  notifiedAt: string | null;
  createdAt: string;
}

export function RestockAlertAdminPanel() {
  const [tab, setTab] = useState<"alerts" | "settings">("alerts");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (currentTab: "alerts" | "settings") => {
    setLoading(true);
    try {
      if (currentTab === "settings") {
        const res = await fetch("/api/admin/restock-alerts?tab=settings", { credentials: "include" });
        if (res.ok) setSettings((await res.json()).data);
      } else {
        const res = await fetch("/api/admin/restock-alerts", { credentials: "include" });
        if (res.ok) setAlerts((await res.json()).data.items);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(tab);
  }, [tab, fetchData]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/restock-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (res.ok) setSettings((await res.json()).data);
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Inventario</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Alertas de Restock</h1>
          </div>
          <div className="flex gap-2">
            {(["alerts", "settings"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${tab === t ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}
              >
                {t === "alerts" ? "Alertas" : "Configuración"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-body-sm text-text-muted">Cargando...</p>
          </div>
        ) : tab === "settings" && settings ? (
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-body-md font-medium text-text-primary">Sistema habilitado</label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, isEnabled: !settings.isEnabled })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.isEnabled ? "bg-brand-primary" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.isEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Asunto del email</label>
              <input
                type="text"
                value={settings.emailSubject}
                onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              />
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Máximo alertas por producto</label>
              <input
                type="number"
                min={1}
                value={settings.maxAlertsPerProduct}
                onChange={(e) => setSettings({ ...settings, maxAlertsPerProduct: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              />
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Expirar después de (días)</label>
              <input
                type="number"
                min={1}
                value={settings.expiresAfterDays}
                onChange={(e) => setSettings({ ...settings, expiresAfterDays: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-body-md font-medium text-white hover:bg-brand-primaryHover"
            >
              Guardar configuración
            </button>
          </div>
        ) : tab === "alerts" ? (
          alerts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
              <p className="text-body-md text-text-secondary">No hay alertas de restock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-border-soft bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-md font-medium text-text-primary">{alert.product.name}</p>
                      <p className="text-body-xs text-text-muted">{alert.email}</p>
                    </div>
                    <div className="text-right">
                      {alert.notifiedAt ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-700">
                          Notificado
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.62rem] font-medium text-amber-700">
                          Pendiente
                        </span>
                      )}
                      <p className="mt-1 text-body-xs text-text-muted">
                        {new Date(alert.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </section>
    </div>
  );
}
