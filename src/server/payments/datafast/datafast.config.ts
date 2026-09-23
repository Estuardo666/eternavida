import "server-only";
import { env } from "@/config/env";

export const DATAFAST_PROVIDER = "datafast";

export const datafastConfig = {
  baseUrl: env.DATAFAST_BASE_URL.replace(/\/+$/, ""),
  entityId: env.DATAFAST_ENTITY_ID ?? "",
  bearerToken: env.DATAFAST_BEARER_TOKEN ?? "",
  mid: env.DATAFAST_MID,
  tid: env.DATAFAST_TID,
  eci: env.DATAFAST_ECI,
  pserv: env.DATAFAST_PSERV,
  testMode: env.DATAFAST_TEST_MODE.trim(),
  riskUserData2: env.DATAFAST_RISK_USER_DATA2?.trim() ?? "",
  requestTimeoutMs: 20_000,
} as const;

export const DATAFAST_WIDGET_SCRIPT_URL = `${datafastConfig.baseUrl}/v1/paymentWidgets.js`;

export const DATAFAST_BRANDS = "VISA MASTER DINERS DISCOVER AMEX";

export function isDatafastConfigured(): boolean {
  return Boolean(datafastConfig.entityId && datafastConfig.bearerToken);
}

export class DatafastError extends Error {
  readonly code?: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "DatafastError";
    this.code = code;
  }
}

export function assertDatafastConfigured(): void {
  if (!isDatafastConfigured()) {
    throw new DatafastError(
      "Datafast no esta configurado. Define DATAFAST_ENTITY_ID y DATAFAST_BEARER_TOKEN.",
    );
  }
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec").replace(/\/+$/, "");
}
