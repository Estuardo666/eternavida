import Link from "next/link";

import { cx } from "@/lib/utils";

interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbsProps {
  items: AdminBreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumbs({ items, className }: AdminBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx("overflow-x-auto pb-1", className)}>
      <ol className="flex min-w-max items-center gap-1.5 whitespace-nowrap">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1.5">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="rounded-md px-1 py-0.5 text-label-sm text-text-muted transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface-canvas"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cx("text-label-sm", isCurrent ? "text-text-primary font-medium" : "text-text-muted")}>
                  {item.label}
                </span>
              )}

              {!isCurrent ? (
                <span aria-hidden="true" className="text-text-muted/50 text-[10px]">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
