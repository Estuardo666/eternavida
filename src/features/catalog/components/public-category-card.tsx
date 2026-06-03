import { MediaAssetFrame } from "@/components/media/media-asset-frame";
import { PublicLinkButton } from "@/components/ui/public-link-button";
import type { PublicCatalogCategorySummary } from "@/types/public-catalog";

interface PublicCategoryCardProps {
  category: PublicCatalogCategorySummary;
}

export function PublicCategoryCard({ category }: PublicCategoryCardProps) {
  return (
    <article className="group flex h-full flex-col gap-5 rounded-[28px] border border-border-soft bg-surface-canvas p-5 shadow-xs transition hover:border-border-brand hover:bg-surface-subtle hover:shadow-sm sm:p-6">
      <MediaAssetFrame
        asset={category.media}
        label={`Imagen de categoria para ${category.name}`}
        className="[&_span]:hidden [&_p]:hidden"
        minHeightClassName="min-h-[220px] sm:min-h-[260px]"
      />

      <div className="space-y-3">
        <h2 className="text-[1.55rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-[1.75rem]">
          {category.name}
        </h2>
        <p className="text-body-sm text-text-secondary">{category.description}</p>
        <PublicLinkButton
          action={{ label: "Explorar", href: category.href }}
          variant="secondary"
          className="w-full sm:w-auto"
        />
      </div>
    </article>
  );
}
