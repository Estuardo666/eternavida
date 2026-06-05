import "server-only";
import { reviewRepository } from "@/server/reviews/review.repository";
import type { CreateReviewInput } from "@/features/catalog/schemas/review.schema";
import type { ReviewPublicItem } from "@/types/review";

export async function createReviewService(
  input: CreateReviewInput,
  clerkUserId: string,
) {
  const existing = await reviewRepository.findByProductAndUser(
    input.productId,
    clerkUserId,
  );
  if (existing) {
    throw new Error("Ya has reseñado este producto");
  }

  const isVerified = await reviewRepository.hasVerifiedPurchase(
    clerkUserId,
    input.productId,
  );

  const review = await reviewRepository.create({
    productId: input.productId,
    clerkUserId,
    rating: input.rating,
    title: input.title,
    body: input.body,
    isVerifiedPurchase: isVerified,
    imageUrls: input.imageUrls,
  });

  return review;
}

export async function getProductReviewsService(
  productId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [reviews, total, aggregate] = await Promise.all([
    reviewRepository.listByProduct(productId, {
      status: "approved",
      skip,
      take: limit,
    }),
    reviewRepository.countByProduct(productId, "approved"),
    reviewRepository.getAggregate(productId),
  ]);

  const items: ReviewPublicItem[] = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isVerifiedPurchase: r.isVerifiedPurchase,
    authorName: "Usuario",
    createdAt: r.createdAt.toISOString(),
    adminResponse: r.adminResponse,
    adminRespondedAt: r.adminRespondedAt?.toISOString() ?? null,
    imageUrls: r.imageUrls ?? [],
  }));

  return {
    items,
    aggregate,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
