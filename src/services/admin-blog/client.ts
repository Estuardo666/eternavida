"use client";

import type { AdminBlogPostFormData, AdminBlogCategoryFormData } from "@/types/admin-blog";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}

export async function createBlogPostClient(input: AdminBlogPostFormData) {
  const response = await fetch("/api/admin/blog/posts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<{ success: boolean; data?: { post: unknown }; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to create blog post.");
  }

  return body.data;
}

export async function updateBlogPostClient(id: string, input: AdminBlogPostFormData) {
  const response = await fetch(`/api/admin/blog/posts/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<{ success: boolean; data?: { post: unknown }; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to update blog post.");
  }

  return body.data;
}

export async function deleteBlogPostClient(id: string) {
  const response = await fetch(`/api/admin/blog/posts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<{ success: boolean; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to delete blog post.");
  }
}

export async function createBlogCategoryClient(input: AdminBlogCategoryFormData) {
  const response = await fetch("/api/admin/blog/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<{ success: boolean; data?: { category: unknown }; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to create blog category.");
  }

  return body.data;
}

export async function updateBlogCategoryClient(id: string, input: AdminBlogCategoryFormData) {
  const response = await fetch(`/api/admin/blog/categories/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const body = await parseJsonResponse<{ success: boolean; data?: { category: unknown }; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to update blog category.");
  }

  return body.data;
}

export async function deleteBlogCategoryClient(id: string) {
  const response = await fetch(`/api/admin/blog/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const body = await parseJsonResponse<{ success: boolean; error?: { message: string } }>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message ?? "Failed to delete blog category.");
  }
}
