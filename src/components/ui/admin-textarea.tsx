import type { TextareaHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const baseClasses =
  "w-full rounded-lg border border-border-default bg-surface-canvas px-3 py-2 text-body-sm text-text-primary transition-all duration-150 ease-out placeholder:text-text-muted hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-subtle focus-visible:ring-border-brand focus-visible:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[5rem]";

const errorClasses = "border-status-error focus-visible:ring-status-error focus-visible:border-status-error";

export function AdminTextarea({ error, className, ...props }: AdminTextareaProps) {
  return <textarea className={cx(baseClasses, error && errorClasses, className)} {...props} />;
}
