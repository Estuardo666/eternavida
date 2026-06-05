import type { InputHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

type AdminInputVariant = "default" | "prominent" | "readonly";

interface AdminInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: AdminInputVariant;
  error?: boolean;
}

const baseClasses =
  "w-full rounded-lg border bg-surface-canvas px-3 py-2 text-body-sm text-text-primary transition-all duration-150 ease-out placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<AdminInputVariant, string> = {
  default:
    "border-border-default hover:border-border-strong focus-visible:ring-border-brand focus-visible:border-brand-primary",
  prominent:
    "border-border-default text-body-lg font-semibold sm:py-3 sm:text-section-sm hover:border-border-strong focus-visible:ring-border-brand focus-visible:border-brand-primary",
  readonly:
    "border-border-soft bg-surface-subtle text-text-secondary cursor-default",
};

const errorClasses = "border-status-error focus-visible:ring-status-error focus-visible:border-status-error";

export function AdminInput({ variant = "default", error, className, ...props }: AdminInputProps) {
  return (
    <input
      className={cx(baseClasses, variantClasses[variant], error && errorClasses, className)}
      readOnly={variant === "readonly"}
      {...props}
    />
  );
}
