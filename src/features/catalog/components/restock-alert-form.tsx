"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RestockAlertFormProps {
  productId: string;
  productName: string;
}

export function RestockAlertForm({ productId, productName }: RestockAlertFormProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || status === "submitting") return;

      setStatus("submitting");
      setErrorMessage("");

      try {
        const res = await fetch("/api/restock-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), productId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || "Error al suscribirse");
        }

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Error al suscribirse");
      }
    },
    [email, productId, status],
  );

  if (status === "success") {
    return (
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 h-6 w-6 text-emerald-600" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-body-sm font-medium text-emerald-800">
          ¡Te notificaremos cuando {productName} esté disponible!
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-body-sm text-text-secondary">
        Este producto está temporalmente agotado. Déjanos tu email y te avisamos cuando vuelva a estar disponible.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          className="flex-1 rounded-lg border border-border-soft bg-white px-3.5 py-2.5 text-body-md text-text-primary placeholder:text-text-muted transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        <motion.button
          type="submit"
          disabled={status === "submitting"}
          whileTap={reduceMotion ? {} : { scale: 0.975 }}
          className="rounded-lg bg-[#C58A1D] px-4 py-2.5 text-body-sm font-bold text-[#0B5D1E] transition hover:bg-[#B47C18] disabled:opacity-50"
        >
          {status === "submitting" ? "..." : "Avísame"}
        </motion.button>
      </div>
      {status === "error" ? (
        <p className="text-body-xs text-status-error">{errorMessage}</p>
      ) : null}
    </form>
  );
}
