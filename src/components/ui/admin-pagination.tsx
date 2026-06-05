import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AdminPagination({ currentPage, totalPages, onPageChange, className }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: Array<number | "ellipsis"> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Paginacion" className={cx("flex items-center gap-1", className)}>
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        ariaLabel="Pagina anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PaginationButton>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-muted text-body-sm">
            ...
          </span>
        ) : (
          <PaginationButton
            key={page}
            onClick={() => onPageChange(page)}
            active={page === currentPage}
            ariaLabel={`Pagina ${page}`}
            ariaCurrent={page === currentPage ? "page" : undefined}
          >
            {page}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        ariaLabel="Pagina siguiente"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
  ariaLabel,
  ariaCurrent,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
  ariaCurrent?: "page" | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cx(
        "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-label-sm transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface-canvas",
        "disabled:opacity-40 disabled:pointer-events-none",
        active
          ? "bg-brand-primary text-white"
          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}
