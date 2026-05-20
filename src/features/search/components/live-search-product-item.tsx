import type { LiveSearchProductResult } from "@/features/search/types";
import { cx } from "@/lib/utils";

interface LiveSearchProductItemProps {
  id: string;
  product: LiveSearchProductResult;
  isActive: boolean;
  onInteract: () => void;
  onSelect: () => void;
}

const productPriceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export function LiveSearchProductItem({
  id,
  product,
  isActive,
  onInteract,
  onSelect,
}: LiveSearchProductItemProps) {
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
  const displayPrice = hasDiscount && product.discountPrice !== null ? product.discountPrice : product.price;

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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-soft bg-surface-subtle text-label-sm font-semibold text-text-primary">
        {product.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- live search suggestions render remote asset URLs
          <img
            src={product.mediaUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          product.name.slice(0, 1).toUpperCase()
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md text-text-primary">{product.name}</p>
        <div className="mt-1 flex items-center gap-2 text-body-sm text-text-secondary">
          <span className="truncate">{product.brand}</span>
          <span aria-hidden="true" className="text-text-muted">•</span>
          <span className="flex items-center gap-1.5">
            {hasDiscount && product.discountPrice !== null ? (
              <span className="text-text-muted line-through">
                {productPriceFormatter.format(product.price)}
              </span>
            ) : null}
            <span className="text-text-primary">{productPriceFormatter.format(displayPrice)}</span>
          </span>
        </div>
      </div>
    </button>
  );
}