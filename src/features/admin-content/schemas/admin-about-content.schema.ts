import { z } from "zod";

const optionalStringSchema = z.string().trim().optional().or(z.literal(""));

const aboutDiffItemSchema = z.object({
  text: z.string().trim().min(1, "Diferenciador text is required"),
  mediaId: z.string().trim().default(""),
});

export const adminAboutContentFormSchema = z.object({
  // Section 1 – Hero
  heroPretitle: z.string().trim().min(1),
  heroTitle: z.string().trim().min(1),
  heroSubtitle: z.string().trim().min(1),
  heroCtaText: z.string().trim().min(1),
  heroCtaHref: z.string().trim().min(1),
  heroMediaId: optionalStringSchema,

  // Section 2 – Historia
  historyPretitle: z.string().trim().min(1),
  historyTitle: z.string().trim().min(1),
  historySubtitle: z.string().trim().min(1),
  historyCtaText: z.string().trim().min(1),
  historyCtaHref: z.string().trim().min(1),
  historySeoText: z.string().trim().min(1),
  historyMediaId: optionalStringSchema,

  // Section 3 – Misión
  missionPretitle: z.string().trim().min(1),
  missionTitle: z.string().trim().min(1),
  missionSeoText: z.string().trim().min(1),
  missionMediaId: optionalStringSchema,

  // Section 3 – Visión
  visionPretitle: z.string().trim().min(1),
  visionTitle: z.string().trim().min(1),
  visionSubtitle: z.string().trim().min(1),
  visionSeoText: z.string().trim().min(1),
  visionMediaId: optionalStringSchema,

  // Section 4 – Diferenciadores
  diffPretitle: z.string().trim().min(1),
  diffTitle: z.string().trim().min(1),
  diffSubtitle: z.string().trim().min(1),
  diffCtaText: z.string().trim().min(1),
  diffCtaHref: z.string().trim().min(1),
  diffSeoText: z.string().trim().min(1),
  diffItems: z.array(aboutDiffItemSchema).length(6, "Exactly 6 differentiator items required"),

  // Section 5 – Producción
  productionPretitle: z.string().trim().min(1),
  productionTitle: z.string().trim().min(1),
  productionSubtitle: z.string().trim().min(1),
  productionCtaText: z.string().trim().min(1),
  productionCtaHref: z.string().trim().min(1),
  productionSeoText: z.string().trim().min(1),
  productionMediaId: optionalStringSchema,

  // Section 6 – Impacto
  impactPretitle: z.string().trim().min(1),
  impactTitle: z.string().trim().min(1),
  impactSubtitle: z.string().trim().min(1),
  impactCtaText: z.string().trim().min(1),
  impactCtaHref: z.string().trim().min(1),
  impactSeoText: z.string().trim().min(1),
  impactMediaId: optionalStringSchema,

  // Section 7 – CTA
  ctaPretitle: z.string().trim().min(1),
  ctaTitle: z.string().trim().min(1),
  ctaSubtitle: z.string().trim().min(1),
  ctaCtaText: z.string().trim().min(1),
  ctaCtaHref: z.string().trim().min(1),
});

export type AdminAboutContentFormInput = z.infer<typeof adminAboutContentFormSchema>;
