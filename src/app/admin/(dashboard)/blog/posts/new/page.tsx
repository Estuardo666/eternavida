import { getBlogPostEditorData } from "@/services/admin-blog/get-blog-admin-data";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";
import { BlogPostForm } from "@/features/admin-blog/components/blog-post-form";

export const metadata = {
  title: "Nueva Entrada — Blog Admin — Eterna Vida",
  description: "Crear nueva entrada de blog.",
};

export default async function AdminBlogPostNewPage() {
  await requireAdminPageUser();
  const data = await getBlogPostEditorData();

  return <BlogPostForm initialData={data} mode="create" />;
}
