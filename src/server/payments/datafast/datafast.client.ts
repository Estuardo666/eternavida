import "server-only";
import {
  DatafastError,
  assertDatafastConfigured,
  datafastConfig,
} from "./datafast.config";
import { formatAmount } from "./datafast.tax";
import type {
  DatafastCheckoutInput,
  DatafastCheckoutResponse,
  DatafastPaymentResult,
} from "./datafast.types";

/** Datafast rechaza "&" y valida longitudes estrictas por campo. */
function sanitize(value: string | null | undefined, maxLength: number): string {
  return (value ?? "")
    .replace(/&/g, "y")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Rellena hasta la longitud minima exigida por el gateway (ej. nombres >= 3). */
function padTo(value: string, minLength: number, filler: string): string {
  if (value.length >= minLength) return value;
  return (value + filler.repeat(minLength)).slice(0, minLength);
}

const RESOURCE_PATH_PATTERN = /^\/v1\/checkouts\/[A-Za-z0-9._-]+\/payment$/;

export function parseResourcePath(resourcePath: string): { checkoutId: string } {
  if (!RESOURCE_PATH_PATTERN.test(resourcePath)) {
    throw new DatafastError("resourcePath invalido.");
  }
  const checkoutId = resourcePath.split("/")[3] ?? "";
  return { checkoutId };
}

async function datafastFetch(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), datafastConfig.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${datafastConfig.bearerToken}`,
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new DatafastError(
        `Respuesta no valida de Datafast (HTTP ${response.status}): ${text.slice(0, 200)}`,
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof DatafastError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DatafastError("Datafast no respondio a tiempo.");
    }
    throw new DatafastError(
      error instanceof Error ? error.message : "Error de red al contactar Datafast.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function createCheckout(
  input: DatafastCheckoutInput,
): Promise<DatafastCheckoutResponse> {
  assertDatafastConfigured();

  const params = new URLSearchParams();
  params.set("entityId", datafastConfig.entityId);
  params.set("amount", formatAmount(input.amount));
  params.set("currency", "USD");
  params.set("paymentType", "DB");
  params.set("merchantTransactionId", padTo(sanitize(input.merchantTransactionId, 255), 8, "0"));

  params.set("customer.givenName", padTo(sanitize(input.customer.givenName, 48), 3, "."));
  if (input.customer.middleName) {
    params.set("customer.middleName", padTo(sanitize(input.customer.middleName, 50), 2, "."));
  }
  params.set("customer.surname", padTo(sanitize(input.customer.surname, 48), 3, "."));
  params.set("customer.email", sanitize(input.customer.email, 128));
  params.set("customer.phone", padTo(sanitize(input.customer.phone, 25), 7, "0"));
  params.set("customer.ip", sanitize(input.customer.ip, 255));
  params.set("customer.merchantCustomerId", sanitize(input.customer.merchantCustomerId, 16));
  params.set(
    "customer.identificationDocId",
    padTo(sanitize(input.customer.identificationDocId, 10).replace(/\D/g, ""), 10, "0"),
  );

  params.set("billing.street1", sanitize(input.billing.street1, 100) || "S/N");
  params.set("billing.country", input.billing.country);
  params.set("shipping.street1", sanitize(input.shipping.street1, 100) || "S/N");
  params.set("shipping.country", input.shipping.country);

  input.items.forEach((item, index) => {
    params.set(`cart.items[${index}].name`, sanitize(item.name, 255) || "Producto");
    params.set(
      `cart.items[${index}].description`,
      sanitize(item.description || item.name, 255) || "Producto",
    );
    params.set(`cart.items[${index}].price`, formatAmount(item.price));
    params.set(`cart.items[${index}].quantity`, String(item.quantity));
  });

  params.set("customParameters[SHOPPER_VAL_BASE0]", formatAmount(input.tax.base0));
  params.set("customParameters[SHOPPER_VAL_BASEIMP]", formatAmount(input.tax.baseImp));
  params.set("customParameters[SHOPPER_VAL_IVA]", formatAmount(input.tax.iva));
  params.set("customParameters[SHOPPER_MID]", datafastConfig.mid);
  params.set("customParameters[SHOPPER_TID]", datafastConfig.tid);
  params.set("customParameters[SHOPPER_ECI]", datafastConfig.eci);
  params.set("customParameters[SHOPPER_PSERV]", datafastConfig.pserv);
  params.set("customParameters[SHOPPER_VERSION]", "2");

  if (datafastConfig.riskUserData2) {
    params.set("risk.parameters[USER_DATA2]", sanitize(datafastConfig.riskUserData2, 30));
  }
  if (datafastConfig.testMode) {
    params.set("testMode", datafastConfig.testMode);
  }

  const payload = await datafastFetch(`${datafastConfig.baseUrl}/v1/checkouts`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const result = (payload.result ?? {}) as { code?: string; description?: string };
  const id = typeof payload.id === "string" ? payload.id : "";

  if (!id) {
    throw new DatafastError(
      result.description ?? "Datafast no devolvio un checkoutId.",
      result.code,
    );
  }

  return {
    id,
    ndc: typeof payload.ndc === "string" ? payload.ndc : undefined,
    result: {
      code: result.code ?? "",
      description: result.description ?? "",
    },
  };
}

export async function getPaymentStatus(resourcePath: string): Promise<DatafastPaymentResult> {
  assertDatafastConfigured();
  parseResourcePath(resourcePath);

  const url = `${datafastConfig.baseUrl}${resourcePath}?entityId=${encodeURIComponent(
    datafastConfig.entityId,
  )}`;
  const payload = await datafastFetch(url, { method: "GET" });
  const result = (payload.result ?? {}) as { code?: string; description?: string };

  return {
    id: typeof payload.id === "string" ? payload.id : undefined,
    paymentType: typeof payload.paymentType === "string" ? payload.paymentType : undefined,
    amount: typeof payload.amount === "string" ? payload.amount : undefined,
    currency: typeof payload.currency === "string" ? payload.currency : undefined,
    merchantTransactionId:
      typeof payload.merchantTransactionId === "string" ? payload.merchantTransactionId : undefined,
    result: {
      code: result.code ?? "",
      description: result.description ?? "",
    },
    card: payload.card as DatafastPaymentResult["card"],
    paymentBrand: typeof payload.paymentBrand === "string" ? payload.paymentBrand : undefined,
    resultDetails: payload.resultDetails as Record<string, string> | undefined,
    timestamp: typeof payload.timestamp === "string" ? payload.timestamp : undefined,
    raw: payload,
  };
}
