import type { Metadata } from "next";

import type {
  PublicCatalogCategorySummary,
  PublicCatalogProductSummary,
} from "@/types/public-catalog";

export function buildCategoryIndexMetadata(): Metadata {
  return {
    title: "Categorías",
    description:
      "Explora todas las categorías de productos naturales y artesanales en Eterna Vida. Miel, aceites y bienestar natural.",
  };
}

export function buildProductIndexMetadata(): Metadata {
  return {
    title: "Tienda",
    description:
      "Descubre la tienda Eterna Vida. Productos naturales y artesanales para la salud, el bienestar y la alimentación consciente.",
  };
}

export function buildCategoryMetadata(category: PublicCatalogCategorySummary): Metadata {
  return {
    title: category.name,
    description: category.description,
  };
}

export function buildProductMetadata(product: PublicCatalogProductSummary): Metadata {
  return {
    title: product.name,
    description: product.description,
  };
}