export type WishlistItem = {
  id: string;
  clerkUserId: string;
  productId: string;
  createdAt: Date;
};

export type WishlistItemWithProduct = WishlistItem & {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: unknown;
    discountPrice: unknown | null;
    stock: number;
    href: string;
    mediaAssetId: string | null;
  };
};
