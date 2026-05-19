"use client";

import type {
  PaymentMethodFormData,
  PaymentMethodItem,
  PaymentMethodListRouteResponse,
  PaymentMethodRouteResponse,
} from "@/types/admin-payment-methods";
import type { AdminDeleteRouteResponse } from "@/types/admin-catalog";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function createPaymentMethodClient(input: PaymentMethodFormData): Promise<PaymentMethodItem> {
  const response = await fetch("/api/admin/payment-methods", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = await parseJsonResponse<PaymentMethodRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudo crear el método de pago.");
  }
  return body.data.method;
}

export async function updatePaymentMethodClient(
  id: string,
  input: PaymentMethodFormData,
): Promise<PaymentMethodItem> {
  const response = await fetch(`/api/admin/payment-methods/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = await parseJsonResponse<PaymentMethodRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudo actualizar el método de pago.");
  }
  return body.data.method;
}

export async function deletePaymentMethodClient(id: string): Promise<void> {
  const response = await fetch(`/api/admin/payment-methods/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "No se pudo eliminar el método de pago.");
  }
}

export async function getPaymentMethodsClient(): Promise<PaymentMethodItem[]> {
  const response = await fetch("/api/admin/payment-methods", {
    credentials: "include",
  });
  const body = await parseJsonResponse<PaymentMethodListRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudieron cargar los métodos de pago.");
  }
  return body.data.methods;
}
