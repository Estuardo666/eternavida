import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DatafastStatusCard } from "@/features/checkout/components/datafast-status-card";
import { datafastService } from "@/server/payments/datafast/datafast.service";
import type { ConfirmPaymentResult } from "@/server/payments/datafast/datafast.service";

export const metadata: Metadata = {
  title: "Resultado del pago | Eterna Vida",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ order?: string; resourcePath?: string }>;
}

export default async function DatafastResultPage({ searchParams }: PageProps) {
  const { order: orderNumber, resourcePath } = await searchParams;

  if (!orderNumber || !resourcePath) {
    return (
      <DatafastStatusCard
        tone="error"
        title="Resultado incompleto"
        message="Faltan datos para verificar el pago."
        orderNumber={orderNumber}
      />
    );
  }

  let result: ConfirmPaymentResult;
  try {
    result = await datafastService.confirmPayment(orderNumber, resourcePath);
  } catch (error) {
    console.error("[checkout/pago/resultado]", error);
    return (
      <DatafastStatusCard
        tone="error"
        title="No pudimos verificar tu pago"
        message={error instanceof Error ? error.message : "Intenta nuevamente en unos minutos."}
        orderNumber={orderNumber}
      />
    );
  }

  if (result.outcome === "approved") {
    redirect(`/confirmation?order=${encodeURIComponent(result.orderNumber)}`);
  }

  if (result.outcome === "review") {
    return (
      <DatafastStatusCard
        tone="review"
        title="Pago en revision"
        message={`Tu pago quedo en revision manual (${result.code}). Te avisaremos por correo apenas se confirme.`}
        orderNumber={orderNumber}
      />
    );
  }

  if (result.outcome === "pending") {
    return (
      <DatafastStatusCard
        tone="review"
        title="Pago en proceso"
        message={`La transaccion todavia no se completa (${result.code}). Si ya autorizaste el cobro, te confirmaremos por correo; si no, puedes reintentar el pago.`}
        orderNumber={orderNumber}
        showRetry
      />
    );
  }

  return (
    <DatafastStatusCard
      tone="error"
      title="Pago rechazado"
      message={`${result.description || "El banco rechazo la transaccion."} (codigo ${result.code})`}
      orderNumber={orderNumber}
    />
  );
}
