import "server-only";

import { listMediaAssets } from "@/server/media/admin-media-library.repository";
import {
  listAdminCategoryRecords,
  listAdminProductRecords,
} from "@/server/catalog/admin-catalog.repository";
import { collectionRepository } from "@/server/collections/collection.repository";
import { listPublishedPosts } from "@/server/blog/blog-post.repository";
import { listActiveCategories } from "@/server/blog/blog-category.repository";
import { mapAdminMediaAssetSummary } from "@/services/admin-catalog/get-catalog-admin-data";
import type {
  QrEntityOption,
  QrGeneratorData,
  QrStaticPageKey,
} from "@/types/qr-generator";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eternavida.com.ec";

const STATIC_PAGE_MAP: ReadonlyArray<{ key: QrStaticPageKey; label: string; path: string }> = [
  { key: "home", label: "Inicio", path: "/" },
  { key: "about", label: "Acerca de Nosotros", path: "/acerca-de-nosotros" },
  { key: "contact", label: "Contacto", path: "/contacto" },
  { key: "shipping", label: "Política de Envíos", path: "/politica-de-envios" },
  { key: "returns", label: "Política de Devoluciones", path: "/politica-de-devoluciones" },
  { key: "privacy", label: "Política de Privacidad", path: "/politica-de-privacidad" },
  { key: "terms", label: "Términos y Condiciones", path: "/terminos-y-condiciones" },
];

export async function getQrGeneratorData(): Promise<QrGeneratorData> {
  const [productRecords, categoryRecords, collectionRecords, rawMediaAssets, blogPostResult, blogCategoryRecords] = await Promise.all([
    listAdminProductRecords(),
    listAdminCategoryRecords(),
    collectionRepository.findAll({ includeInactive: true }),
    listMediaAssets(),
    listPublishedPosts({ page: 1, pageSize: 500 }),
    listActiveCategories(),
  ]);

  const productOptions: QrEntityOption[] = productRecords
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      label: p.name,
      url: `${BASE_URL}${p.href}`,
      entityType: "product" as const,
    }));

  const categoryOptions: QrEntityOption[] = categoryRecords
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c.id,
      label: c.name,
      url: `${BASE_URL}${c.href}`,
      entityType: "category" as const,
    }));

  const collectionOptions: QrEntityOption[] = collectionRecords
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c.id,
      label: c.name,
      url: `${BASE_URL}/colecciones/${c.slug}`,
      entityType: "collection" as const,
    }));

  const blogPostOptions: QrEntityOption[] = blogPostResult.items.map((p) => ({
    id: p.id,
    label: p.title,
    url: `${BASE_URL}/blog/${p.slug}`,
    entityType: "blog-post" as const,
  }));

  const blogCategoryOptions: QrEntityOption[] = blogCategoryRecords.map((c) => ({
    id: c.id,
    label: c.name,
    url: `${BASE_URL}/blog/categoria/${c.slug}`,
    entityType: "blog-category" as const,
  }));

  const staticPageOptions: QrEntityOption[] = STATIC_PAGE_MAP.map((page) => ({
    id: `static-${page.key}`,
    label: page.label,
    url: `${BASE_URL}${page.path}`,
    entityType: "static-page" as const,
  }));

  const mediaAssets = rawMediaAssets
    .filter((a) => a.kind === "image")
    .map(mapAdminMediaAssetSummary);

  return {
    entityOptions: [
      ...staticPageOptions,
      ...blogPostOptions,
      ...blogCategoryOptions,
      ...productOptions,
      ...categoryOptions,
      ...collectionOptions,
    ],
    mediaAssets,
  };
}
