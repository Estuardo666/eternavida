import type { SelectHTMLAttributes } from "react";

import { ChevronDown } from "lucide-react";

import { cx } from "@/lib/utils";

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const selectClasses =
  "w-full appearance-none rounded-lg border bg-surface-canvas px-3 py-2 pr-8 text-body-sm text-text-primary transition-all duration-150 ease-out hover:border-border-strong focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface-subtle disabled:cursor-not-allowed disabled:opacity-50 border-border-default";

const errorClasses = "border-status-error focus-visible:ring-status-error focus-visible:border-status-error";

export function AdminSelect({ error, className, children, ...props }: AdminSelectProps) {
  return (
    <div className="relative">
      <select
        className={cx(selectClasses, error && errorClasses, className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
}
