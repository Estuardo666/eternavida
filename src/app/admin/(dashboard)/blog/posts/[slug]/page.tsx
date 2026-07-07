import { notFound } from "next/navigation";

import { getBlogPostEditorDataBySlug } from "@/services/admin-blog/get-blog-admin-data";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";
import { BlogPostForm } from "@/features/admin-blog/components/blog-post-form";

interface AdminBlogPostEditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminBlogPostEditPage({ params }: AdminBlogPostEditPageProps) {
  await requireAdminPageUser();
  const { slug } = await params;
  const data = await getBlogPostEditorDataBySlug(slug);

  if (!data.post) {
    notFound();
  }

  return <BlogPostForm initialData={data} mode="edit" />;
}
