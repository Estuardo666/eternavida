"use client";

import type {
  AdminCatalogBulkActionInput,
  AdminCatalogBulkRouteResponse,
  AdminCatalogEditorData,
  AdminCatalogRouteResponse,
  AdminCategoryFormData,
  AdminCategoryRouteResponse,
  AdminBrandFormData,
  AdminBrandRouteResponse,
  AdminDeleteRouteResponse,
  AdminPickupLocationFormData,
  AdminPickupLocationRouteResponse,
  AdminProductBadgePresetFormData,
  AdminProductBadgePresetRouteResponse,
  AdminProductFormData,
  AdminProductRouteResponse,
  AdminProductSyncRequest,
  AdminProductSyncRouteResponse,
} from "@/types/admin-catalog";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function fetchCatalogAdminData(): Promise<AdminCatalogEditorData> {
  const response = await fetch("/api/admin/catalog", {
    method: "GET",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminCatalogRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to load catalog admin data.");
  }

  return body.data;
}

export async function createCategoryClient(input: AdminCategoryFormData) {
  const response = await fetch("/api/admin/catalog/categories", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminCategoryRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to create category.");
  }

  return body.data.category;
}

export async function updateCategoryClient(id: string, input: AdminCategoryFormData) {
  const response = await fetch(`/api/admin/catalog/categories/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminCategoryRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update category.");
  }

  return body.data.category;
}

export async function deleteCategoryClient(id: string) {
  const response = await fetch(`/api/admin/catalog/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to delete category.");
  }

  return body.data.deletedId;
}

export async function createProductClient(input: AdminProductFormData) {
  const response = await fetch("/api/admin/catalog/products", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminProductRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to create product.");
  }

  return body.data.product;
}

export async function createBrandClient(input: AdminBrandFormData) {
  const response = await fetch("/api/admin/catalog/brands", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminBrandRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to create brand.");
  }

  return body.data.brand;
}

export async function updateBrandClient(id: string, input: AdminBrandFormData) {
  const response = await fetch(`/api/admin/catalog/brands/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminBrandRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update brand.");
  }

  return body.data.brand;
}

export async function deleteBrandClient(id: string) {
  const response = await fetch(`/api/admin/catalog/brands/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to delete brand.");
  }

  return body.data.deletedId;
}

export async function createPickupLocationClient(input: AdminPickupLocationFormData) {
  const response = await fetch("/api/admin/catalog/pickup-locations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminPickupLocationRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to create pickup location.");
  }

  return body.data.pickupLocation;
}

export async function updatePickupLocationClient(id: string, input: AdminPickupLocationFormData) {
  const response = await fetch(`/api/admin/catalog/pickup-locations/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminPickupLocationRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update pickup location.");
  }

  return body.data.pickupLocation;
}

export async function deletePickupLocationClient(id: string) {
  const response = await fetch(`/api/admin/catalog/pickup-locations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to delete pickup location.");
  }

  return body.data.deletedId;
}

export async function updateProductClient(id: string, input: AdminProductFormData) {
  const response = await fetch(`/api/admin/catalog/products/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminProductRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update product.");
  }

  return body.data.product;
}

export async function deleteProductClient(id: string) {
  const response = await fetch(`/api/admin/catalog/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to delete product.");
  }

  return body.data.deletedId;
}

export async function syncProductClient(id: string, input: AdminProductSyncRequest = { mode: "mock" }) {
  const response = await fetch(`/api/admin/catalog/products/${id}/sync`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminProductSyncRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to sync product.");
  }

  return body.data;
}

export async function createProductBadgePresetClient(input: AdminProductBadgePresetFormData) {
  const response = await fetch("/api/admin/catalog/badges", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminProductBadgePresetRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to create badge preset.");
  }

  return body.data.badgePreset;
}

export async function updateProductBadgePresetClient(id: string, input: AdminProductBadgePresetFormData) {
  const response = await fetch(`/api/admin/catalog/badges/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminProductBadgePresetRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update badge preset.");
  }

  return body.data.badgePreset;
}

export async function deleteProductBadgePresetClient(id: string) {
  const response = await fetch(`/api/admin/catalog/badges/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<AdminDeleteRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to delete badge preset.");
  }

  return body.data.deletedId;
}

export async function applyCategoryBulkActionClient(input: AdminCatalogBulkActionInput) {
  const response = await fetch("/api/admin/catalog/categories/bulk", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminCatalogBulkRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to apply bulk category action.");
  }

  return body.data;
}

export async function applyProductBulkActionClient(input: AdminCatalogBulkActionInput) {
  const response = await fetch("/api/admin/catalog/products/bulk", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminCatalogBulkRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to apply bulk product action.");
  }

  return body.data;
}
