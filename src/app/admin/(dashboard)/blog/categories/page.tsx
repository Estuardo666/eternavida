import { BlogCategoryManager } from "@/features/admin-blog/components/blog-category-manager";
import { listAllCategories } from "@/server/blog/blog-category.repository";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";

export const metadata = {
  title: "Categorías de Blog — Admin — Eterna Vida",
  description: "Gestionar categorías del blog.",
};

export default async function AdminBlogCategoriesPage() {
  await requireAdminPageUser();
  const categories = await listAllCategories();

  return <BlogCategoryManager categories={categories} />;
}
