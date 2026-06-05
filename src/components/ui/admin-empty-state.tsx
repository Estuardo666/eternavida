import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminEmptyState({ icon, title, description, action, className }: AdminEmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border-soft bg-surface-subtle text-text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-label-lg text-text-primary">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-body-sm text-text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
