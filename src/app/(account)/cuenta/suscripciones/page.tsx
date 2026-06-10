"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FREQUENCY_LABELS, type SubscriptionFrequency } from "@/types/subscription";

interface SubItem {
  id: string;
  productId: string;
  frequency: SubscriptionFrequency;
  quantity: number;
  status: string;
  nextOrderAt: string;
  totalCycles: number;
  product: { name: string; slug: string; brand: string; price: unknown; discountPrice: unknown | null };
}

const priceFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch("/api/subscriptions", { credentials: "include" });
      if (res.ok) setSubs((await res.json()).data.items);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleAction = async (id: string, action: "pause" | "resume" | "cancel") => {
    const status = action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled";
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: action === "cancel" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(action !== "cancel" && { body: JSON.stringify({ status }) }),
      });
      if (res.ok) fetchSubs();
    } catch { /* handle error */ }
  };

  if (loading) {
    return <div className="flex min-h-[300px] items-center justify-center"><p className="text-body-sm text-text-muted">Cargando...</p></div>;
  }

  if (subs.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-section-lg text-text-primary">Mis Suscripciones</h1>
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-border-soft bg-white p-8 text-center">
          <p className="text-body-md text-text-secondary">No tienes suscripciones activas.</p>
          <Link href="/productos" className="rounded-full bg-brand-primary px-5 py-2.5 text-body-md font-medium text-white hover:bg-brand-primaryHover">Ver productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-section-lg text-text-primary">Mis Suscripciones</h1>
      <div className="space-y-3">
        {subs.map((sub) => {
          const price = Number(sub.product.discountPrice ?? sub.product.price);
          return (
            <div key={sub.id} className="rounded-2xl border border-border-soft bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Link href={`/productos/${sub.product.slug}`} className="text-body-lg font-medium text-text-primary hover:underline">{sub.product.name}</Link>
                  <p className="text-body-sm text-text-secondary">{sub.product.brand}</p>
                  <p className="text-body-sm text-text-muted">Cada {FREQUENCY_LABELS[sub.frequency]} — Cantidad: {sub.quantity}</p>
                  <p className="text-body-sm text-text-muted">Próxima reposición: {new Date(sub.nextOrderAt).toLocaleDateString("es-MX")}</p>
                  <p className="text-body-sm font-medium text-text-primary">{priceFormatter.format(price * sub.quantity)} / ciclo</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-medium ${sub.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {sub.status === "active" ? "Activa" : "Pausada"}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {sub.status === "active" ? (
                  <button type="button" onClick={() => handleAction(sub.id, "pause")}
                    className="rounded-lg border border-border-soft px-3 py-1.5 text-body-xs font-medium text-text-secondary hover:bg-surface-soft">Pausar</button>
                ) : (
                  <button type="button" onClick={() => handleAction(sub.id, "resume")}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-body-xs font-medium text-emerald-700 hover:bg-emerald-100">Reanudar</button>
                )}
                <button type="button" onClick={() => handleAction(sub.id, "cancel")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-body-xs font-medium text-red-600 hover:bg-red-100">Cancelar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
