"use client";

type ClerkError = {
  errors?: Array<{ message?: string; longMessage?: string }>;
  message?: string;
};

export function normalizeClerkErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!error || typeof error !== "object") return fallback;

  const clerkError = error as ClerkError;

  if (Array.isArray(clerkError.errors) && clerkError.errors.length > 0) {
    const first = clerkError.errors[0];
    return first?.longMessage ?? first?.message ?? fallback;
  }

  if (typeof clerkError.message === "string" && clerkError.message.length > 0) {
    return clerkError.message;
  }

  return fallback;
}
