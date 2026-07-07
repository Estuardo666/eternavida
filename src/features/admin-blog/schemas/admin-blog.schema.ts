import { z } from "zod";

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

export const adminBlogPostFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300, "Title too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().trim().default(""),
  content: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().nullable().default(null),
  authorName: z.string().trim().default("Eterna Vida"),
  categoryId: z.string().trim().nullable().default(null),
  featuredImageId: z.string().trim().default(""),
  seoTitle: z.string().trim().default(""),
  seoDescription: z.string().trim().default(""),
  ogImageId: z.string().trim().default(""),
  canonicalUrl: z.string().trim().default(""),
  isActive: z.boolean().default(true),
  tagNames: z.array(z.string().trim().min(1)).default([]),
});

export const adminBlogCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().default(""),
  isActive: z.boolean().default(true),
});

export type AdminBlogPostFormInput = z.infer<typeof adminBlogPostFormSchema>;
export type AdminBlogCategoryFormInput = z.infer<typeof adminBlogCategoryFormSchema>;
