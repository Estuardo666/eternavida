const SLUG_PATTERN = /[^a-z0-9]+/g;

function normalizeAscii(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .trim()
    .toLowerCase();
}

export function slugifyCatalogName(value: string): string {
  return normalizeAscii(value)
    .replace(SLUG_PATTERN, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildCategoryHref(slug: string): string {
  return `/categorias/${slug}`;
}

export function buildProductHref(slug: string): string {
  return `/productos/${slug}`;
}

export function resolveCategoryIdentity(input: { name: string; slug?: string; href?: string }): {
  slug: string;
  href: string;
} {
  const slug = input.slug?.trim() || slugifyCatalogName(input.name);
  if (!slug) {
    throw new Error("A valid category name is required to generate slug and href.");
  }

  return {
    slug,
    href: input.href?.trim() || buildCategoryHref(slug),
  };
}

export function resolveProductIdentity(input: { name: string; slug?: string; href?: string }): {
  slug: string;
  href: string;
} {
  const slug = input.slug?.trim() || slugifyCatalogName(input.name);
  if (!slug) {
    throw new Error("A valid product name is required to generate slug and href.");
  }

  return {
    slug,
    href: input.href?.trim() || buildProductHref(slug),
  };
}

export function buildCatalogMediaStorageKey(
  entityType: "categories" | "products" | "brands",
  slug: string,
  fileName: string,
  timestamp = Date.now(),
): string {
  const extensionMatch = /\.[^.]+$/.exec(fileName);
  const extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";
  const folder = entityType === "categories" ? "Categories" : entityType === "brands" ? "Brands" : "Products";

  return `Eterna Vida/Catalog/${folder}/${slug}-${timestamp}${extension}`;
}