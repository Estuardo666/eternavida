import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type AdminBadgeVariant = "solid" | "soft" | "outline";
type AdminBadgeColor = "default" | "success" | "warning" | "error" | "info" | "brand" | "featured";

interface AdminBadgeProps {
  variant?: AdminBadgeVariant;
  color?: AdminBadgeColor;
  children: ReactNode;
  className?: string;
}

const colorClasses: Record<AdminBadgeVariant, Record<AdminBadgeColor, string>> = {
  solid: {
    default: "bg-text-primary text-white",
    success: "bg-status-success text-white",
    warning: "bg-status-warning text-white",
    error: "bg-status-error text-white",
    info: "bg-status-info text-white",
    brand: "bg-brand-primary text-white",
    featured: "bg-[#C58A1D] text-white",
  },
  soft: {
    default: "bg-neutral-100 text-text-secondary",
    success: "bg-status-success/10 text-status-success",
    warning: "bg-status-warning/10 text-status-warning",
    error: "bg-status-error/10 text-status-error",
    info: "bg-status-info/10 text-status-info",
    brand: "bg-brand-soft text-brand-primary",
    featured: "bg-[#F8E6B8] text-[#A87112]",
  },
  outline: {
    default: "border border-border-default text-text-secondary",
    success: "border border-status-success/30 text-status-success",
    warning: "border border-status-warning/30 text-status-warning",
    error: "border border-status-error/30 text-status-error",
    info: "border border-status-info/30 text-status-info",
    brand: "border border-border-brand text-brand-primary",
    featured: "border border-[#C58A1D]/30 text-[#A87112]",
  },
};

export function AdminBadge({
  variant = "soft",
  color = "default",
  children,
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm leading-none whitespace-nowrap",
        colorClasses[variant][color],
        className,
      )}
    >
      {children}
    </span>
  );
}
