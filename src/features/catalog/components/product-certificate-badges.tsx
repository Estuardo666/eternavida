import type { PublicProductCertificateBadgeSummary } from "@/types/public-catalog";
import { getBenefitIcon } from "@/lib/product-benefit-icons";
import { cfImageLoader } from "@/lib/cf-image-loader";

interface ProductCertificateBadgesProps {
  badges: PublicProductCertificateBadgeSummary[];
}

export function ProductCertificateBadges({ badges }: ProductCertificateBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      {badges.map((badge) => {
        const iconDef = badge.iconKey ? getBenefitIcon(badge.iconKey) : null;

        return (
          <div
            key={badge.id}
            className="group flex flex-col items-center gap-2"
            title={badge.label}
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border-soft bg-surface-canvas transition-shadow hover:shadow-md">
              {badge.media?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cfImageLoader({ src: badge.media.url, width: 112, quality: 80 })}
                  alt={badge.label}
                  className="h-full w-full object-contain p-1.5"
                  loading="lazy"
                  decoding="async"
                />
              ) : iconDef ? (
                <svg
                  viewBox={iconDef.viewBox}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-brand-primary"
                >
                  {iconDef.paths.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </svg>
              ) : (
                <span className="text-[0.625rem] font-medium uppercase tracking-wide text-text-secondary">
                  {badge.label.slice(0, 3)}
                </span>
              )}
            </div>
            <span className="max-w-[72px] text-center text-[0.6875rem] leading-tight text-text-secondary">
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
