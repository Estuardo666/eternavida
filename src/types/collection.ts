export type CollectionData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  excerpt: string | null;
  isActive: boolean;
  sortOrder: number;
  mediaAssetId: string | null;
  mediaUrl: string | null;
  mediaAlt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CollectionWithRelations = CollectionData & {
  products: Array<{
    productId: string;
    position: number;
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
  }>;
  categories: Array<{
    categoryId: string;
    position: number;
    category: {
      id: string;
      slug: string;
      name: string;
      href: string;
    };
  }>;
};

export type CollectionCreateInput = {
  slug: string;
  name: string;
  description?: string | null;
  excerpt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  mediaAssetId?: string | null;
  productIds?: string[];
  categoryIds?: string[];
};

export type CollectionUpdateInput = {
  slug?: string;
  name?: string;
  description?: string | null;
  excerpt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  mediaAssetId?: string | null;
  productIds?: string[];
  categoryIds?: string[];
};
