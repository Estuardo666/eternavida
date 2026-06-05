import { z } from "zod";

export const toggleWishlistInputSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistInputSchema>;

export const wishlistProductParamsSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
});

export type WishlistProductParams = z.infer<typeof wishlistProductParamsSchema>;
