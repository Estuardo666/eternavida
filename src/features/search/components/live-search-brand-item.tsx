import type { LiveSearchBrandResult } from "@/features/search/types";
import { cx } from "@/lib/utils";

interface LiveSearchBrandItemProps {
  id: string;
  brand: LiveSearchBrandResult;
  isActive: boolean;
  onInteract: () => void;
  onSelect: () => void;
}

export function LiveSearchBrandItem({
  id,
  brand,
  isActive,
  onInteract,
  onSelect,
}: LiveSearchBrandItemProps) {
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
        "flex w-full items-center gap-3 rounded-[22px] border border-transparent px-3.5 py-3 text-left transition-[background-color,border-color] duration-[180ms] ease-soft hover:border-brand-primary/30 hover:bg-brand-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
        isActive && "border-brand-primary/35 bg-brand-primary/[0.1]",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-soft bg-surface-subtle text-label-sm font-semibold text-text-primary">
        {brand.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- live search suggestions render remote asset URLs
          <img
            src={brand.mediaUrl}
            alt={brand.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          brand.name.slice(0, 1).toUpperCase()
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-label-md text-text-primary">{brand.name}</p>
      </div>
    </button>
  );
}
