import type { Metadata } from "next";
import { headers } from "next/headers";

import { DatafastPaymentShell } from "@/features/checkout/components/datafast-payment-shell";
import { DatafastStatusCard } from "@/features/checkout/components/datafast-status-card";
import { resolveClientIp } from "@/server/payments/datafast/client-ip";
import { getSiteUrl } from "@/server/payments/datafast/datafast.config";
import { datafastService } from "@/server/payments/datafast/datafast.service";

export const metadata: Metadata = {
  title: "Pago con tarjeta | Eterna Vida",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fmt = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function DatafastPaymentPage({ searchParams }: PageProps) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    return (
      <DatafastStatusCard
        tone="error"
        title="No se pudo iniciar el pago"
        message="No se indico el pedido a pagar."
      />
    );
  }

  const requestHeaders = await headers();

  let checkout;
  try {
    checkout = await datafastService.startPayment(orderNumber, resolveClientIp(requestHeaders));
  } catch (error) {
    console.error("[checkout/pago]", error);
    return (
      <DatafastStatusCard
        tone="error"
        title="No se pudo iniciar el pago"
        message={
          error instanceof Error
            ? error.message
            : "No pudimos preparar el formulario de pago. Intenta nuevamente."
        }
        orderNumber={orderNumber}
      />
    );
  }

  const shopperResultUrl = `${getSiteUrl()}/checkout/pago/resultado?order=${encodeURIComponent(
    checkout.orderNumber,
  )}`;

  return (
    <DatafastPaymentShell
      orderNumber={checkout.orderNumber}
      formattedAmount={fmt.format(checkout.amount)}
      checkoutId={checkout.checkoutId}
      widgetScriptUrl={checkout.widgetScriptUrl}
      brands={checkout.brands}
      shopperResultUrl={shopperResultUrl}
    />
  );
}
