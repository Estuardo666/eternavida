"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

interface SubItem {
  id: string;
  clerkUserId: string;
  frequency: string;
  quantity: number;
  status: string;
  nextOrderAt: string;
  totalCycles: number;
  product: { name: string; slug: string; brand: string };
  createdAt: string;
}

interface Settings {
  id: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  autoChargeEnabled: boolean;
  reminderEmailSubject: string | null;
  maxSubscriptionsPerUser: number;
}

interface Stats {
  active: number;
  paused: number;
  cancelled: number;
  total: number;
}

const FREQUENCY_LABELS: Record<string, string> = {
  days_15: "15 días",
  days_30: "30 días",
  days_45: "45 días",
  days_60: "60 días",
  days_90: "90 días",
};

export function SubscriptionAdminPanel() {
  const [tab, setTab] = useState<"subscriptions" | "stats" | "settings">("subscriptions");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (currentTab: string) => {
    setLoading(true);
    try {
      if (currentTab === "settings") {
        const res = await fetch("/api/admin/subscriptions?tab=settings", { credentials: "include" });
        if (res.ok) setSettings((await res.json()).data);
      } else if (currentTab === "stats") {
        const res = await fetch("/api/admin/subscriptions?tab=stats", { credentials: "include" });
        if (res.ok) setStats((await res.json()).data);
      } else {
        const res = await fetch("/api/admin/subscriptions", { credentials: "include" });
        if (res.ok) setSubs((await res.json()).data.items);
      }
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(tab); }, [tab, fetchData]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (res.ok) setSettings((await res.json()).data);
    } catch { /* handle error */ }
  };

  const statusColors: Record<string, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    paused: "border-amber-200 bg-amber-50 text-amber-700",
    cancelled: "border-neutral-200 bg-neutral-50 text-neutral-600",
    expired: "border-neutral-200 bg-neutral-50 text-neutral-600",
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Retención</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Suscripciones</h1>
          </div>
          <div className="flex gap-2">
            {(["subscriptions", "stats", "settings"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${tab === t ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}>
                {t === "subscriptions" ? "Suscripciones" : t === "stats" ? "Stats" : "Configuración"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={ADMIN_PANEL_SURFACE_CLASS_NAME}>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center"><p className="text-body-sm text-text-muted">Cargando...</p></div>
        ) : tab === "stats" && stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Activas", value: stats.active, color: "text-emerald-600" },
              { label: "Pausadas", value: stats.paused, color: "text-amber-600" },
              { label: "Canceladas", value: stats.cancelled, color: "text-neutral-500" },
              { label: "Total", value: stats.total, color: "text-text-primary" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border-soft bg-white p-4 text-center">
                <p className={`text-[2rem] font-bold ${s.color}`}>{s.value}</p>
                <p className="text-body-sm text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        ) : tab === "settings" && settings ? (
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-body-md font-medium text-text-primary">Recordatorios habilitados</label>
              <button type="button" onClick={() => setSettings({ ...settings, reminderEnabled: !settings.reminderEnabled })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.reminderEnabled ? "bg-brand-primary" : "bg-neutral-300"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.reminderEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Días antes para recordar</label>
              <input type="number" min={1} value={settings.reminderDaysBefore}
                onChange={(e) => setSettings({ ...settings, reminderDaysBefore: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md" />
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Máximo suscripciones por usuario</label>
              <input type="number" min={1} value={settings.maxSubscriptionsPerUser}
                onChange={(e) => setSettings({ ...settings, maxSubscriptionsPerUser: Number(e.target.value) })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md" />
            </div>
            <button type="button" onClick={handleSaveSettings}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-body-md font-medium text-white hover:bg-brand-primaryHover">
              Guardar configuración
            </button>
          </div>
        ) : tab === "subscriptions" ? (
          subs.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
              <p className="text-body-md text-text-secondary">No hay suscripciones.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subs.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-border-soft bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-md font-medium text-text-primary">{sub.product.name}</p>
                      <p className="text-body-xs text-text-muted">{sub.product.brand} — Cada {FREQUENCY_LABELS[sub.frequency] ?? sub.frequency} — Cant: {sub.quantity}</p>
                      <p className="text-body-xs text-text-muted">Próxima: {new Date(sub.nextOrderAt).toLocaleDateString("es-MX")} — Ciclos: {sub.totalCycles}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${statusColors[sub.status] ?? ""}`}>
                      {sub.status}
                    </span>
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
