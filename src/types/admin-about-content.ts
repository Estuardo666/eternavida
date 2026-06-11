import type { MediaAssetKind } from "@/types/media";

export interface AdminAboutDiffItem {
  text: string;
  mediaId: string;
}

export interface AdminAboutContentFormData {
  // Section 1 – Hero
  heroPretitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaHref: string;
  heroMediaId: string;

  // Section 2 – Historia
  historyPretitle: string;
  historyTitle: string;
  historySubtitle: string;
  historyCtaText: string;
  historyCtaHref: string;
  historySeoText: string;
  historyMediaId: string;

  // Section 3 – Misión
  missionPretitle: string;
  missionTitle: string;
  missionSeoText: string;
  missionMediaId: string;

  // Section 3 – Visión
  visionPretitle: string;
  visionTitle: string;
  visionSubtitle: string;
  visionSeoText: string;
  visionMediaId: string;

  // Section 4 – Diferenciadores
  diffPretitle: string;
  diffTitle: string;
  diffSubtitle: string;
  diffCtaText: string;
  diffCtaHref: string;
  diffSeoText: string;
  diffItems: AdminAboutDiffItem[];

  // Section 5 – Producción
  productionPretitle: string;
  productionTitle: string;
  productionSubtitle: string;
  productionCtaText: string;
  productionCtaHref: string;
  productionSeoText: string;
  productionMediaId: string;

  // Section 6 – Impacto
  impactPretitle: string;
  impactTitle: string;
  impactSubtitle: string;
  impactCtaText: string;
  impactCtaHref: string;
  impactSeoText: string;
  impactMediaId: string;

  // Section 7 – CTA
  ctaPretitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaCtaText: string;
  ctaCtaHref: string;
}

export interface AdminAboutMediaAssetSummary {
  id: string;
  storageKey: string;
  publicUrl: string | null;
  kind: MediaAssetKind;
  altText: string;
}

export interface AdminAboutContentEditorData {
  content: AdminAboutContentFormData;
  mediaAssets: AdminAboutMediaAssetSummary[];
}

export interface AdminAboutContentRouteResponse {
  success: boolean;
  data?: AdminAboutContentEditorData;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
