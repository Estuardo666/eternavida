import type {
  CheckoutPricingPreview,
  CheckoutPricingPreviewRequest,
  CheckoutPricingPreviewRouteResponse,
} from "@/types/checkout-pricing";

/** Error del preview que conserva el codigo y los productos faltantes. */
export class CheckoutPricePreviewError extends Error {
  readonly code: string;
  readonly missingProductIds: string[];

  constructor(message: string, code: string, missingProductIds: string[]) {
    super(message);
    this.name = "CheckoutPricePreviewError";
    this.code = code;
    this.missingProductIds = missingProductIds;
  }
}

export async function getCheckoutPricePreview(
  input: CheckoutPricingPreviewRequest,
): Promise<CheckoutPricingPreview> {
  const response = await fetch("/api/checkout/price-preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  let payload: CheckoutPricingPreviewRouteResponse | null = null;
  try {
    payload = (await response.json()) as CheckoutPricingPreviewRouteResponse;
  } catch {
    throw new Error("Failed to parse checkout pricing preview response.");
  }

  if (!response.ok || !payload.success || !payload.data?.preview) {
    throw new CheckoutPricePreviewError(
      payload.error?.message ?? "No se pudo calcular el total del checkout.",
      payload.error?.code ?? "UNKNOWN",
      payload.error?.details?.missingProductIds ?? [],
    );
  }

  return payload.data.preview;
}