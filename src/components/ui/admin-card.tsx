import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type AdminCardVariant = "default" | "hero" | "inset" | "sticky" | "flat";

interface AdminCardProps {
  variant?: AdminCardVariant;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<AdminCardVariant, string> = {
  default:
    "rounded-xl border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6",
  hero:
    "rounded-xl border border-border-soft bg-surface-canvas p-5 shadow-sm sm:p-7",
  inset:
    "rounded-lg border border-border-soft/60 bg-surface-subtle p-4",
  sticky: "rounded-xl border border-border-soft bg-surface-canvas p-5 shadow-xs sm:p-6 xl:sticky xl:top-6 xl:self-start",
  flat: "rounded-xl bg-surface-canvas p-5 sm:p-6",
};

export function AdminCard({ variant = "default", className, children }: AdminCardProps) {
  return <div className={cx(variantClasses[variant], className)}>{children}</div>;
}
