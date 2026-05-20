export interface LiveSearchProductResult {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  mediaUrl: string | null;
  href: string;
}

export interface LiveSearchCategoryResult {
  id: string;
  slug: string;
  name: string;
  href: string;
}

export interface LiveSearchResults {
  products: LiveSearchProductResult[];
  categories: LiveSearchCategoryResult[];
}