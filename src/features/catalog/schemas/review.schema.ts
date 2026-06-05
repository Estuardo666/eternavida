import { z } from "zod";
import { REVIEW_STATUSES } from "@/types/review";

export const createReviewInputSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .trim()
    .max(200, "Title must not exceed 200 characters")
    .optional()
    .nullable()
    .transform((v) => v || null),
  body: z
    .string()
    .trim()
    .max(5000, "Review body must not exceed 5000 characters")
    .optional()
    .nullable()
    .transform((v) => v || null),
  imageUrls: z
    .array(z.string().url("Each image URL must be a valid URL"))
    .max(5, "Maximum 5 images per review")
    .optional()
    .default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const updateReviewInputSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
  title: z
    .string()
    .trim()
    .max(200, "Title must not exceed 200 characters")
    .optional()
    .nullable()
    .transform((v) => v || null),
  body: z
    .string()
    .trim()
    .max(5000, "Review body must not exceed 5000 characters")
    .optional()
    .nullable()
    .transform((v) => v || null),
});

export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;

export const adminUpdateReviewSchema = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
  adminResponse: z
    .string()
    .trim()
    .max(2000, "Admin response must not exceed 2000 characters")
    .optional()
    .nullable()
    .transform((v) => v || null),
});

export type AdminUpdateReviewInput = z.infer<typeof adminUpdateReviewSchema>;

export const listReviewsQuerySchema = z.object({
  status: z.enum(REVIEW_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;

export const listProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type ListProductReviewsQuery = z.infer<typeof listProductReviewsQuerySchema>;

export const reviewRouteParamsSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export type ReviewRouteParams = z.infer<typeof reviewRouteParamsSchema>;

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1, "slug is required"),
});

export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;
