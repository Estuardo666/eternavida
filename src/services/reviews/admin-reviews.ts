import "server-only";
import { reviewRepository } from "@/server/reviews/review.repository";
import type { ReviewStatus } from "@/types/review";

export async function listAdminReviewsService(
  filters: { status?: ReviewStatus | undefined; page: number; limit: number },
) {
  const skip = (filters.page - 1) * filters.limit;

  const [reviews, total] = await Promise.all([
    reviewRepository.listAll({ status: filters.status, skip, take: filters.limit }),
    reviewRepository.countAll(filters.status),
  ]);

  const items = reviews.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.product.name,
    productSlug: r.product.slug,
    clerkUserId: r.clerkUserId,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isVerifiedPurchase: r.isVerifiedPurchase,
    status: r.status,
    adminResponse: r.adminResponse,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function adminUpdateReviewService(
  id: string,
  input: { status?: ReviewStatus | undefined; adminResponse?: string | null | undefined },
) {
  const existing = await reviewRepository.findById(id);
  if (!existing) {
    throw new Error("Review not found");
  }

  return await reviewRepository.update(id, {
    ...(input.status !== undefined && { status: input.status }),
    ...(input.adminResponse !== undefined && {
      adminResponse: input.adminResponse,
      adminRespondedAt: input.adminResponse ? new Date() : null,
    }),
  });
}

export async function adminDeleteReviewService(id: string) {
  const existing = await reviewRepository.findById(id);
  if (!existing) {
    throw new Error("Review not found");
  }

  return await reviewRepository.delete(id);
}
