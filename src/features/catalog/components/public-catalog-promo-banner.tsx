import Image from "next/image";

/**
 * Promo banner components for the public catalog.
 *
 * These render placeholder UI until the backend supports uploading banner content
 * per category. When the backend is ready, both components will accept content data
 * and render real images, text, and CTAs.
 */

interface PublicCatalogPageBannerProps {
  className?: string;
}

/**
 * Full-width banner displayed above the product grid on category pages.
 * Corresponds to "Banner promo categoría 1" in the wireframe.
 */
export function PublicCatalogPageBanner({ className }: PublicCatalogPageBannerProps) {
  return (
    <div
      className={[
        "relative min-h-[100px] overflow-hidden rounded-[20px] border border-border-brand sm:min-h-[120px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src="/promocat.png"
        alt="Banner promocional de categoría"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 95vw, 80vw"
        priority
      />
    </div>
  );
}

interface PublicCatalogInlineBannerCardProps {
  variant: "category" | "store";
  className?: string;
}

/**
 * Card-sized banner rendered as the first slot inside the product grid.
 * Corresponds to "Banner promo categoría 2" in the wireframe.
 *
 * variant "category" — filled green background (used on category detail pages).
 * variant "store"    — outlined only (used on the main store page).
 */
export function PublicCatalogInlineBannerCard({
  variant,
  className,
}: PublicCatalogInlineBannerCardProps) {
  const base =
    "relative h-full min-h-[220px] overflow-hidden rounded-[20px] border sm:min-h-[260px]";

  const variantClass =
    variant === "category"
      ? "border-border-brand"
      : "border-border-soft";

  return (
    <div
      className={[base, variantClass, className].filter(Boolean).join(" ")}
    >
      <Image
        src="/bannerpromo.jpg"
        alt="Banner promocional"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 45vw, 300px"
      />
    </div>
  );
}
