import { FolderOpen } from "lucide-react";

import type { LiveSearchCategoryResult } from "@/features/search/types";
import { cx } from "@/lib/utils";

interface LiveSearchCategoryItemProps {
  id: string;
  category: LiveSearchCategoryResult;
  isActive: boolean;
  onInteract: () => void;
  onSelect: () => void;
}

export function LiveSearchCategoryItem({
  id,
  category,
  isActive,
  onInteract,
  onSelect,
}: LiveSearchCategoryItemProps) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={isActive}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onInteract}
      onFocus={onInteract}
      onClick={onSelect}
      className={cx(
        "flex w-full items-center gap-3 rounded-[22px] border border-transparent px-3.5 py-3 text-left transition-[background-color,border-color] duration-[180ms] ease-soft hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
        isActive && "border-border-default bg-surface-soft",
      )}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-surface-subtle text-text-secondary">
        <FolderOpen className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="truncate text-label-md text-text-primary">{category.name}</p>
        <p className="mt-1 text-body-sm text-text-muted">Categoria</p>
      </div>
    </button>
  );
}