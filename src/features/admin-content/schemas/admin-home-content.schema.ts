import { z } from "zod";

import { MEDIA_ASSET_KINDS } from "@/types/media";

const storageKeySchema = z
  .string()
  .trim()
  .min(1, "storageKey is required")
  .refine((value) => !value.startsWith("/"), "storageKey cannot start with '/'")
  .refine(
    (value) => value.split("/").every((segment) => segment.length > 0 && segment !== ".."),
    "storageKey must be a safe bucket path",
  );

const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(""));
const optionalStringSchema = z.string().trim().optional().or(z.literal(""));
const optionalPositiveIntegerSchema = z.coerce.number().int().positive().optional().nullable();

const trustHighlightItemSchema = z.object({
  id: z.string().min(1, "Trust highlight id is required"),
  title: z.string().min(1, "Trust highlight title is required"),
  description: z.string().min(1, "Trust highlight description is required"),
});

const orderedEntityIdsSchema = z
  .array(z.string().trim().min(1, "Entity id is required"))
  .min(1, "At least one selection is required")
  .superRefine((value, context) => {
    const seenIds = new Set<string>();

    value.forEach((item, index) => {
      if (seenIds.has(item)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate selections are not allowed",
          path: [index],
        });
        return;
      }

      seenIds.add(item);
    });
  });

function parseJsonField<T>(value: string, schema: z.ZodType<T>, label: string): T {
  try {
    return schema.parse(JSON.parse(value));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detail = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
      throw new Error(`${label} is invalid: ${detail}`);
    }

    throw new Error(`${label} must be valid JSON.`);
  }
}

export const adminHomeContentFormSchema = z.object({
  heroEyebrow: z.string().trim().min(1),
  heroTitle: z.string().trim().min(1),
  heroSubtitle: z.string().trim().min(1),
  heroSupportingBadge: z.string().trim().min(1),
  heroPrimaryCtaText: z.string().trim().min(1),
  heroPrimaryCtaHref: z.string().trim().min(1),
  heroSecondaryCtaText: z.string().trim().default(""),
  heroSecondaryCtaHref: z.string().trim().default(""),
  heroMediaId: z.string().trim().default(""),
  heroMediaAltText: z.string().trim().default(""),
  heroSecondaryMediaId: z.string().trim().default(""),
  heroSecondaryMediaAltText: z.string().trim().default(""),
  heroTertiaryMediaId: z.string().trim().default(""),
  heroTertiaryMediaAltText: z.string().trim().default(""),
  featuredCategoriesEyebrow: z.string().trim().min(1),
  featuredCategoriesTitle: z.string().trim().min(1),
  featuredCategoriesDescription: z.string().trim().min(1),
  featuredCategoryIds: orderedEntityIdsSchema,
  featuredProductsEyebrow: z.string().trim().min(1),
  featuredProductsTitle: z.string().trim().min(1),
  featuredProductsDescription: z.string().trim().min(1),
  featuredProductIds: orderedEntityIdsSchema,
  trustHighlightsEyebrow: z.string().trim().min(1),
  trustHighlightsTitle: z.string().trim().min(1),
  trustHighlightsDescription: z.string().trim().min(1),
  trustHighlightsItemsJson: z.string().trim().min(1),
  ctaEyebrow: z.string().trim().min(1),
  ctaTitle: z.string().trim().min(1),
  ctaDescription: z.string().trim().min(1),
  ctaPrimaryCtaText: z.string().trim().min(1),
  ctaPrimaryCtaHref: z.string().trim().min(1),
  ctaSecondaryCtaText: z.string().trim().default(""),
  ctaSecondaryCtaHref: z.string().trim().default(""),
});

export const upsertMediaAssetSchema = z.object({
  storageKey: storageKeySchema,
  publicUrl: optionalUrlSchema,
  kind: z.enum(MEDIA_ASSET_KINDS),
  mimeType: optionalStringSchema,
  altText: optionalStringSchema,
  posterUrl: optionalUrlSchema,
  width: optionalPositiveIntegerSchema,
  height: optionalPositiveIntegerSchema,
  durationSeconds: optionalPositiveIntegerSchema,
});

export const uploadMediaAssetSchema = z.object({
  storageKey: storageKeySchema,
  kind: z.enum(MEDIA_ASSET_KINDS),
  altText: optionalStringSchema,
  posterUrl: optionalUrlSchema,
  width: optionalPositiveIntegerSchema,
  height: optionalPositiveIntegerSchema,
  durationSeconds: optionalPositiveIntegerSchema,
});

export type AdminHomeContentFormInput = z.infer<typeof adminHomeContentFormSchema>;
export type UpsertMediaAssetFormInput = z.infer<typeof upsertMediaAssetSchema>;
export type UploadMediaAssetFormInput = z.infer<typeof uploadMediaAssetSchema>;

export function parseTrustHighlightsItemsJson(value: string) {
  return parseJsonField(
    value,
    trustHighlightItemSchema.array(),
    "trustHighlightsItemsJson",
  );
}
