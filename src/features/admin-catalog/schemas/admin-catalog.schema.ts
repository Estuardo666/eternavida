import { z } from "zod";

const hexColorSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value),
    "Badge color must be a valid hex color",
  );

const optionalSlugSchema = z
  .string()
  .trim()
  .default("")
  .refine(
    (value) => value.length === 0 || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Slug must use lowercase letters, numbers, and hyphens only",
  );

const optionalHrefSchema = z
  .string()
  .trim()
  .default("")
  .refine((value) => value.length === 0 || value.startsWith("/"), "Href must start with '/'");

const mediaAssetIdSchema = z.string().trim().default("");

const currencyAmountSchema = z
  .coerce
  .number()
  .finite("Price must be a valid number")
  .min(0, "Price cannot be negative")
  .refine((value) => Number.isInteger(value * 100), "Price must have at most 2 decimal places");

const optionalCurrencyAmountSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    return value;
  },
  currencyAmountSchema.nullable(),
);

const stockSchema = z.coerce.number().int("Stock must be an integer").min(0, "Stock cannot be negative");

const adminProductVariantSchema = z.object({
  id: z.string().trim().default(""),
  name: z.string().trim().min(1, "Variant name is required"),
  price: currencyAmountSchema.default(0),
  discountPrice: optionalCurrencyAmountSchema.default(null),
  stock: stockSchema.default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  mediaAssetId: z.string().trim().default(""),
});

const adminProductIngredientSchema = z.object({
  id: z.string().trim().default(""),
  name: z.string().trim().min(1, "Ingredient name is required"),
  description: z.string().trim().default(""),
  mediaAssetId: z.string().trim().default(""),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const adminProductBenefitSchema = z.object({
  id: z.string().trim().default(""),
  text: z.string().trim().min(1, "Benefit text is required"),
  iconKey: z.string().trim().min(1, "Icon is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const adminProductGalleryImageSchema = z.object({
  id: z.string().trim().default(""),
  mediaAssetId: z.string().trim().min(1, "Image is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const adminProductUsageStepSchema = z.object({
  id: z.string().trim().default(""),
  stepNumber: z.coerce.number().int().min(1),
  text: z.string().trim().min(1, "Step text is required"),
  mediaAssetId: z.string().trim().default(""),
});

const adminProductTrustBadgeSchema = z.object({
  id: z.string().trim().default(""),
  text: z.string().trim().min(1, "Badge text is required"),
  iconKey: z.string().trim().min(1, "Icon is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const adminCategoryFormSchema = z.object({
  slug: optionalSlugSchema,
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  href: optionalHrefSchema,
  isActive: z.boolean(),
  mediaAssetId: mediaAssetIdSchema,
});

export const adminProductFormSchema = z.object({
  slug: optionalSlugSchema,
  name: z.string().trim().min(1, "Name is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  brandId: z.string().trim().min(1, "Brand is required"),
  description: z.string().trim().min(1, "Description is required"),
  href: optionalHrefSchema,
  badge: z.string().trim().default(""),
  badgeColor: hexColorSchema.default(""),
  price: currencyAmountSchema.default(0),
  discountPrice: optionalCurrencyAmountSchema.default(null),
  stock: stockSchema.default(0),
  isActive: z.boolean(),
  categoryId: z.string().trim().default(""),
  categoryIds: z.array(z.string().trim().min(1, "Category is required")).default([]),
  mediaAssetId: mediaAssetIdSchema,
  productColor: hexColorSchema.default(""),
  nutritionalInfoImageId: mediaAssetIdSchema,
  variants: z.array(adminProductVariantSchema).default([]),
  ingredients: z.array(adminProductIngredientSchema).default([]),
  benefits: z.array(adminProductBenefitSchema).default([]),
  preTitle: z.string().trim().default(""),
  shortDescription: z.string().trim().default(""),
  longDescription: z.string().trim().default(""),
  slogan: z.string().trim().default(""),
  galleryImages: z.array(adminProductGalleryImageSchema).default([]),
  usageSteps: z.array(adminProductUsageStepSchema).default([]),
  trustBadges: z.array(adminProductTrustBadgeSchema).default([]),
  pickupLocationIds: z.array(z.string().trim()).default([]),
}).superRefine((value, context) => {
  if (value.discountPrice !== null && value.discountPrice > value.price) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountPrice"],
      message: "Discount price cannot be greater than price",
    });
  }

  const normalizedCategoryIds = new Set(value.categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean));
  if (value.categoryId.trim()) {
    normalizedCategoryIds.add(value.categoryId.trim());
  }

  if (normalizedCategoryIds.size === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["categoryIds"],
      message: "Select at least one category",
    });
  }
});

export const adminCatalogBulkActionSchema = z.object({
  ids: z.array(z.string().trim().min(1, "Record id is required")).min(1, "Select at least one record."),
  action: z.enum(["activate", "deactivate", "delete"]),
});

export const adminProductSyncRequestSchema = z.object({
  mode: z.enum(["mock", "live"]).default("mock"),
});

export const adminProductBadgePresetFormSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  color: hexColorSchema,
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int("Sort order must be an integer").min(0, "Sort order cannot be negative").default(0),
});

export const adminBrandFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  mediaAssetId: mediaAssetIdSchema,
});

export const adminPickupLocationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().trim().min(1, "Address is required"),
  directionsUrl: z.string().trim().default(""),
  logoMediaId: z.string().trim().default(""),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int("Sort order must be an integer").min(0, "Sort order cannot be negative").default(0),
});

export type AdminCategoryFormInput = z.infer<typeof adminCategoryFormSchema>;
export type AdminProductFormInput = z.infer<typeof adminProductFormSchema>;
export type AdminCatalogBulkActionInput = z.infer<typeof adminCatalogBulkActionSchema>;
export type AdminProductSyncRequestInput = z.infer<typeof adminProductSyncRequestSchema>;
export type AdminProductBadgePresetFormInput = z.infer<typeof adminProductBadgePresetFormSchema>;
export type AdminBrandFormInput = z.infer<typeof adminBrandFormSchema>;
export type AdminPickupLocationFormInput = z.infer<typeof adminPickupLocationFormSchema>;
