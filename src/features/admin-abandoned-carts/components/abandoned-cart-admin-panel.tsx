"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

type TabType = "carts" | "settings" | "stats";

interface AbandonedCartStep {
  delayHours: number;
  subject: string;
  template: string;
}

interface Settings {
  id: string;
  isEnabled: boolean;
  steps: AbandonedCartStep[];
  maxRecoverySteps: number;
  includeDiscount: boolean;
  discountPercent: number | null;
  couponPrefix: string | null;
}

interface Stats {
  active: number;
  recovered: number;
  expired: number;
  totalRecovered: number;
}

interface CartItem {
  id: string;
  clerkUserId: string | null;
  guestEmail: string | null;
  cartData: Array<{ name: string; brand: string; quantity: number; price: number; discountPrice: number | null }>;
  status: string;
  lastActivityAt: string;
  recoveryStep: number;
  recoveredAt: string | null;
  createdAt: string;
}

export function AbandonedCartAdminPanel() {
  const [tab, setTab] = useState<TabType>("carts");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [carts, setCarts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (currentTab: TabType) => {
    setLoading(true);
    try {
      if (currentTab === "settings") {
        const res = await fetch("/api/admin/abandoned-carts?tab=settings", { credentials: "include" });
        if (res.ok) setSettings((await res.json()).data);
      } else if (currentTab === "stats") {
        const res = await fetch("/api/admin/abandoned-carts?tab=stats", { credentials: "include" });
        if (res.ok) setStats((await res.json()).data);
      } else {
        const res = await fetch("/api/admin/abandoned-carts?tab=carts", { credentials: "include" });
        if (res.ok) setCarts((await res.json()).data.items);
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
      const res = await fetch("/api/admin/abandoned-carts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettings((await res.json()).data);
      }
    } catch {
      // handle error
    }
  };

  const statusColors: Record<string, string> = {
    active: "border-amber-200 bg-amber-50 text-amber-700",
    recovered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    expired: "border-neutral-200 bg-neutral-50 text-neutral-700",
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Retención</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Carritos Abandonados</h1>
          </div>
          <div className="flex gap-2">
            {(["carts", "stats", "settings"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${tab === t ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}
              >
                {t === "carts" ? "Carritos" : t === "stats" ? "Estadísticas" : "Configuración"}
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
        ) : tab === "stats" && stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Activos", value: stats.active, color: "text-amber-600" },
              { label: "Recuperados", value: stats.recovered, color: "text-emerald-600" },
              { label: "Expirados", value: stats.expired, color: "text-neutral-500" },
              { label: "Conversiones", value: stats.totalRecovered, color: "text-blue-600" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border-soft bg-white p-4 text-center">
                <p className={`text-[2rem] font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-body-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
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

            <div className="flex items-center justify-between">
              <label className="text-body-md font-medium text-text-primary">Incluir descuento</label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, includeDiscount: !settings.includeDiscount })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.includeDiscount ? "bg-brand-primary" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.includeDiscount ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {settings.includeDiscount ? (
              <div>
                <label className="mb-1 block text-body-sm text-text-secondary">Porcentaje de descuento</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.discountPercent ?? ""}
                  onChange={(e) => setSettings({ ...settings, discountPercent: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Máximo pasos de recuperación</label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.maxRecoverySteps}
                onChange={(e) => setSettings({ ...settings, maxRecoverySteps: Number(e.target.value) })}
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
        ) : tab === "carts" ? (
          carts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
              <p className="text-body-md text-text-secondary">No hay carritos abandonados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {carts.map((cart) => (
                <div key={cart.id} className="rounded-xl border border-border-soft bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-body-md font-medium text-text-primary">
                        {cart.guestEmail || `Usuario ${cart.clerkUserId?.slice(0, 8)}`}
                      </p>
                      <p className="text-body-xs text-text-muted">
                        {cart.cartData.length} producto{cart.cartData.length !== 1 ? "s" : ""} — Paso {cart.recoveryStep}
                      </p>
                      <p className="text-body-xs text-text-muted">
                        Última actividad: {new Date(cart.lastActivityAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${statusColors[cart.status] ?? ""}`}>
                      {cart.status}
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
