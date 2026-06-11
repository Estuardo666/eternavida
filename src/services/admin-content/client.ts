"use client";

import type {
  AdminAboutContentEditorData,
  AdminAboutContentFormData,
  AdminAboutContentRouteResponse,
} from "@/types/admin-about-content";
import type {
  AdminHomeContentEditorData,
  AdminHomeContentFormData,
  AdminHomeContentRouteResponse,
  AdminMediaAssetRouteResponse,
  AdminMediaAssetSummary,
  UploadMediaAssetInput,
  UpsertMediaAssetInput,
} from "@/types/admin-home-content";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function saveHomeContent(
  input: AdminHomeContentFormData,
): Promise<AdminHomeContentEditorData> {
  const response = await fetch("/api/admin/content/home", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminHomeContentRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update Home content.");
  }

  return body.data;
}

export async function registerMediaAsset(
  input: UpsertMediaAssetInput,
): Promise<AdminMediaAssetSummary> {
  const response = await fetch("/api/admin/media-assets", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminMediaAssetRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to register media asset.");
  }

  return body.data.mediaAsset;
}

export async function uploadMediaAsset(
  file: File,
  input: UploadMediaAssetInput,
): Promise<AdminMediaAssetSummary> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("storageKey", input.storageKey);
  formData.set("kind", input.kind);

  if (input.altText) {
    formData.set("altText", input.altText);
  }

  if (input.posterUrl) {
    formData.set("posterUrl", input.posterUrl);
  }

  if (input.width != null) {
    formData.set("width", String(input.width));
  }

  if (input.height != null) {
    formData.set("height", String(input.height));
  }

  if (input.durationSeconds != null) {
    formData.set("durationSeconds", String(input.durationSeconds));
  }

  const response = await fetch("/api/admin/media-assets/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const body = await parseJsonResponse<AdminMediaAssetRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to upload media asset.");
  }

  return body.data.mediaAsset;
}

export async function saveAboutContent(
  input: AdminAboutContentFormData,
): Promise<AdminAboutContentEditorData> {
  const response = await fetch("/api/admin/content/acerca-de-nosotros", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<AdminAboutContentRouteResponse>(response);
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Failed to update About content.");
  }

  return body.data;
}
