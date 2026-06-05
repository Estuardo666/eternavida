import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "neutral";
type AdminButtonSize = "default" | "compact" | "icon";

interface AdminButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:opacity-50 disabled:pointer-events-none select-none";

const variantClasses: Record<AdminButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white shadow-xs hover:bg-brand-primaryHover active:bg-brand-primaryHover/90 focus-visible:ring-border-brand",
  secondary:
    "border border-border-default bg-surface-canvas text-text-primary hover:bg-surface-subtle hover:border-border-strong hover:text-text-brand focus-visible:ring-border-brand",
  danger:
    "border border-status-error/30 bg-status-error/5 text-status-error hover:bg-status-error/10 hover:border-status-error/50 focus-visible:ring-status-error",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-subtle focus-visible:ring-border-brand",
  neutral:
    "border border-border-soft bg-surface-canvas text-text-primary hover:bg-surface-subtle hover:border-border-default focus-visible:ring-border-brand",
};

const sizeClasses: Record<AdminButtonSize, string> = {
  default: "min-h-10 rounded-lg px-4 py-2 text-label-md gap-2",
  compact: "min-h-8 rounded-md px-3 py-1.5 text-label-sm gap-1.5",
  icon: "h-9 w-9 rounded-lg p-0",
};

export function AdminButton({
  variant = "secondary",
  size = "default",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={cx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-75"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
