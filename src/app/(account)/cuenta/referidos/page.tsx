"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ReferralData {
  code: string;
  referrals: Array<{ id: string; email: string; status: string; createdAt: string }>;
  stats: { total: number; pending: number; rewarded: number };
}

export default function ReferralAccountPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/referral", { credentials: "include" });
      if (res.ok) {
        setData((await res.json()).data);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-body-sm text-text-muted">Cargando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-section-lg text-text-primary">Programa de Referidos</h1>
        <p className="text-body-md text-text-secondary">No pudimos cargar tu información de referidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section-lg text-text-primary">Programa de Referidos</h1>
        <p className="text-body-md text-text-secondary">
          Comparte tu código con amigos y gana recompensas cuando se registren y compren.
        </p>
      </div>

      <div className="rounded-2xl border border-border-soft bg-white p-6">
        <p className="text-body-sm font-medium text-text-secondary mb-2">Tu código de referido</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl border-2 border-dashed border-brand-primary/30 bg-surface-brandTint px-4 py-3 text-center">
            <span className="text-[1.5rem] font-bold tracking-[0.1em] text-text-primary">{data.code}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-[#5bb446] px-4 py-3 text-body-sm font-medium text-white transition hover:bg-[#499038]"
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-soft bg-white p-4 text-center">
          <p className="text-[2rem] font-bold text-text-primary">{data.stats.total}</p>
          <p className="text-body-sm text-text-secondary">Total referidos</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-white p-4 text-center">
          <p className="text-[2rem] font-bold text-amber-600">{data.stats.pending}</p>
          <p className="text-body-sm text-text-secondary">Pendientes</p>
        </div>
        <div className="rounded-xl border border-border-soft bg-white p-4 text-center">
          <p className="text-[2rem] font-bold text-emerald-600">{data.stats.rewarded}</p>
          <p className="text-body-sm text-text-secondary">Recompensados</p>
        </div>
      </div>

      {data.referrals.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-body-lg font-semibold text-text-primary">Historial de referidos</h2>
          {data.referrals.map((ref) => (
            <div key={ref.id} className="rounded-xl border border-border-soft bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-md text-text-primary">{ref.email}</p>
                  <p className="text-body-xs text-text-muted">
                    {new Date(ref.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${
                  ref.status === "rewarded" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-neutral-200 bg-neutral-50 text-neutral-600"
                }`}>
                  {ref.status === "rewarded" ? "Recompensado" : ref.status === "purchased" ? "Compró" : ref.status === "registered" ? "Registrado" : "Pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
