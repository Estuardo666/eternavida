import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type AdminAlertVariant = "success" | "warning" | "error" | "info";

interface AdminAlertProps {
  variant: AdminAlertVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<AdminAlertVariant, string> = {
  success: "border-status-success/30 bg-status-success/5 text-status-success",
  warning: "border-status-warning/30 bg-status-warning/5 text-status-warning",
  error: "border-status-error/30 bg-status-error/5 text-status-error",
  info: "border-status-info/30 bg-status-info/5 text-status-info",
};

export function AdminAlert({ variant, children, className }: AdminAlertProps) {
  return (
    <div
      role="alert"
      className={cx(
        "flex items-start gap-3 rounded-lg border p-4 text-body-sm",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
