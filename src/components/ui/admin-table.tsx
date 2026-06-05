import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cx } from "@/lib/utils";

interface AdminTableProps {
  children: ReactNode;
  className?: string;
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  );
}

interface AdminTableHeadProps {
  children: ReactNode;
  className?: string;
}

export function AdminTableHead({ children, className }: AdminTableHeadProps) {
  return <thead className={cx("border-b border-border-soft", className)}>{children}</thead>;
}

interface AdminTableRowProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function AdminTableRow({ children, className, active }: AdminTableRowProps) {
  return (
    <tr
      className={cx(
        "border-b border-border-soft/60 transition-colors duration-100",
        active
          ? "bg-brand-soft/30"
          : "hover:bg-surface-subtle/60",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface AdminTableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export function AdminTableHeader({ children, className, ...props }: AdminTableHeaderProps) {
  return (
    <th
      className={cx(
        "px-4 py-3 text-left text-label-sm font-medium text-text-secondary whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface AdminTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export function AdminTableCell({ children, className, ...props }: AdminTableCellProps) {
  return (
    <td className={cx("px-4 py-3 text-text-primary", className)} {...props}>
      {children}
    </td>
  );
}
