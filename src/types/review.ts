export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type Review = {
  id: string;
  productId: string;
  clerkUserId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  adminResponse: string | null;
  adminRespondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewCreateInput = {
  productId: string;
  clerkUserId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerifiedPurchase: boolean;
};

export type ReviewUpdateInput = {
  rating?: number;
  title?: string | null;
  body?: string | null;
};

export type ReviewAdminUpdateInput = {
  status?: ReviewStatus;
  adminResponse?: string | null;
};

export type ReviewListFilters = {
  productId?: string;
  clerkUserId?: string;
  status?: ReviewStatus;
  skip: number;
  take: number;
};

export type ReviewAggregate = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  verifiedCount: number;
};

export type ReviewListItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  clerkUserId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  adminResponse: string | null;
  createdAt: string;
};

export type ReviewPublicItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  authorName: string;
  createdAt: string;
  adminResponse: string | null;
  adminRespondedAt: string | null;
};
