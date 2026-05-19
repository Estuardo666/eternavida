"use client";

import type {
  ShippingMethodFormData,
  ShippingMethodItem,
  ShippingMethodListRouteResponse,
  ShippingMethodRouteResponse,
} from "@/types/admin-shipping-methods";
import type { AdminDeleteRouteResponse } from "@/types/admin-catalog";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function createShippingMethodClient(input: ShippingMethodFormData): Promise<ShippingMethodItem> {
  const response = await fetch("/api/admin/shipping-methods", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = await parseJsonResponse<ShippingMethodRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudo crear el método de envío.");
  }
  return body.data.method;
}

export async function updateShippingMethodClient(
  id: string,
  input: ShippingMethodFormData,
): Promise<ShippingMethodItem> {
  const response = await fetch(`/api/admin/shipping-methods/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = await parseJsonResponse<ShippingMethodRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudo actualizar el método de envío.");
  }
  return body.data.method;
}

export async function deleteShippingMethodClient(id: string): Promise<void> {
  const response = await fetch(`/api/admin/shipping-methods/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "No se pudo eliminar el método de envío.");
  }
}

export async function getShippingMethodsClient(): Promise<ShippingMethodItem[]> {
  const response = await fetch("/api/admin/shipping-methods", {
    credentials: "include",
  });
  const body = await parseJsonResponse<ShippingMethodListRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "No se pudieron cargar los métodos de envío.");
  }
  return body.data.methods;
}
