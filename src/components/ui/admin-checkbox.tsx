import type { InputHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

interface AdminCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

const checkboxClasses =
  "h-4 w-4 shrink-0 rounded border border-border-default bg-surface-canvas text-brand-primary accent-brand-primary transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas disabled:opacity-50 disabled:cursor-not-allowed";

export function AdminCheckbox({ label, className, id, ...props }: AdminCheckboxProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <label
      htmlFor={inputId}
      className={cx(
        "inline-flex items-center gap-2 cursor-pointer select-none text-body-sm text-text-primary",
        "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
        className,
      )}
    >
      <input type="checkbox" id={inputId} className={checkboxClasses} {...props} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
