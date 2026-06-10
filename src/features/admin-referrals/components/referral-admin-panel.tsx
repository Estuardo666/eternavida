"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ADMIN_HERO_SURFACE_CLASS_NAME,
  ADMIN_PANEL_SURFACE_CLASS_NAME,
} from "@/components/admin/surface-styles";

interface ReferralProgram {
  id: string;
  isEnabled: boolean;
  referrerRewardType: string;
  referrerRewardValue: number;
  referredRewardType: string;
  referredRewardValue: number;
  couponDurationDays: number | null;
  maxReferralsPerUser: number | null;
}

interface Stats {
  total: number;
  pending: number;
  registered: number;
  purchased: number;
  rewarded: number;
}

interface ReferralItem {
  id: string;
  referralCode: { code: string; clerkUserId: string };
  referredEmail: string;
  status: string;
  referrerCoupon: string | null;
  referredCoupon: string | null;
  rewardedAt: string | null;
  createdAt: string;
}

export function ReferralAdminPanel() {
  const [tab, setTab] = useState<"referrals" | "stats" | "program">("referrals");
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (currentTab: string) => {
    setLoading(true);
    try {
      if (currentTab === "program") {
        const res = await fetch("/api/admin/referrals?tab=program", { credentials: "include" });
        if (res.ok) setProgram((await res.json()).data);
      } else if (currentTab === "stats") {
        const res = await fetch("/api/admin/referrals?tab=stats", { credentials: "include" });
        if (res.ok) setStats((await res.json()).data);
      } else {
        const res = await fetch("/api/admin/referrals?tab=referrals", { credentials: "include" });
        if (res.ok) setReferrals((await res.json()).data.items);
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

  const handleSaveProgram = async () => {
    if (!program) return;
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(program),
      });
      if (res.ok) setProgram((await res.json()).data);
    } catch {
      // handle error
    }
  };

  const statusColors: Record<string, string> = {
    pending: "border-neutral-200 bg-neutral-50 text-neutral-600",
    registered: "border-blue-200 bg-blue-50 text-blue-700",
    purchased: "border-amber-200 bg-amber-50 text-amber-700",
    rewarded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="space-y-4">
      <section className={ADMIN_HERO_SURFACE_CLASS_NAME}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-[0.14em] text-text-muted">Crecimiento</p>
            <h1 className="text-section-lg text-text-primary sm:text-headline-sm">Referidos</h1>
          </div>
          <div className="flex gap-2">
            {(["referrals", "stats", "program"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-caption uppercase tracking-[0.14em] transition ${tab === t ? "border-border-brand bg-surface-brandTint text-text-brand" : "border-border-soft bg-surface-subtle text-text-muted hover:text-text-primary"}`}
              >
                {t === "referrals" ? "Referidos" : t === "stats" ? "Stats" : "Programa"}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Total", value: stats.total, color: "text-text-primary" },
              { label: "Pendientes", value: stats.pending, color: "text-neutral-500" },
              { label: "Registrados", value: stats.registered, color: "text-blue-600" },
              { label: "Compraron", value: stats.purchased, color: "text-amber-600" },
              { label: "Recompensados", value: stats.rewarded, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border-soft bg-white p-4 text-center">
                <p className={`text-[2rem] font-bold ${s.color}`}>{s.value}</p>
                <p className="text-body-sm text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        ) : tab === "program" && program ? (
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-body-md font-medium text-text-primary">Programa habilitado</label>
              <button
                type="button"
                onClick={() => setProgram({ ...program, isEnabled: !program.isEnabled })}
                className={`relative h-6 w-11 rounded-full transition-colors ${program.isEnabled ? "bg-brand-primary" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${program.isEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-body-sm text-text-secondary">Tipo recompensa referidor</label>
                <select
                  value={program.referrerRewardType}
                  onChange={(e) => setProgram({ ...program, referrerRewardType: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
                >
                  <option value="percent_discount">% Descuento</option>
                  <option value="fixed_amount">Monto fijo</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-body-sm text-text-secondary">Valor recompensa referidor</label>
                <input
                  type="number"
                  min={0}
                  value={program.referrerRewardValue}
                  onChange={(e) => setProgram({ ...program, referrerRewardValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
                />
              </div>
              <div>
                <label className="mb-1 block text-body-sm text-text-secondary">Tipo recompensa referido</label>
                <select
                  value={program.referredRewardType}
                  onChange={(e) => setProgram({ ...program, referredRewardType: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
                >
                  <option value="percent_discount">% Descuento</option>
                  <option value="fixed_amount">Monto fijo</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-body-sm text-text-secondary">Valor recompensa referido</label>
                <input
                  type="number"
                  min={0}
                  value={program.referredRewardValue}
                  onChange={(e) => setProgram({ ...program, referredRewardValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-text-secondary">Duración cupón (días, vacío = sin expiración)</label>
              <input
                type="number"
                min={1}
                value={program.couponDurationDays ?? ""}
                onChange={(e) => setProgram({ ...program, couponDurationDays: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-border-soft px-3 py-2 text-body-md"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveProgram}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-body-md font-medium text-white hover:bg-brand-primaryHover"
            >
              Guardar configuración
            </button>
          </div>
        ) : tab === "referrals" ? (
          referrals.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
              <p className="text-body-md text-text-secondary">No hay referidos registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="rounded-xl border border-border-soft bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-md font-medium text-text-primary">{ref.referredEmail}</p>
                      <p className="text-body-xs text-text-muted">Código: {ref.referralCode.code}</p>
                      {ref.referrerCoupon && (
                        <p className="text-body-xs text-emerald-600">Cupón referidor: {ref.referrerCoupon}</p>
                      )}
                      {ref.referredCoupon && (
                        <p className="text-body-xs text-blue-600">Cupón referido: {ref.referredCoupon}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${statusColors[ref.status] ?? ""}`}>
                        {ref.status}
                      </span>
                      <p className="mt-1 text-body-xs text-text-muted">
                        {new Date(ref.createdAt).toLocaleDateString("es-MX")}
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
