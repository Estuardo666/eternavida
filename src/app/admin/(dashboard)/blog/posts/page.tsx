import { BlogPostList } from "@/features/admin-blog/components/blog-post-list";
import { getBlogAdminListData } from "@/services/admin-blog/get-blog-admin-data";
import { requireAdminPageUser } from "@/server/auth/require-admin-page-user";

export const metadata = {
  title: "Admin Blog — Eterna Vida",
  description: "Gestionar entradas del blog.",
};

interface AdminBlogPostsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBlogPostsPage({ searchParams }: AdminBlogPostsPageProps) {
  await requireAdminPageUser();

  const params = await searchParams;
  const data = await getBlogAdminListData({
    page: params.page ? Number(params.page) : 1,
    status: typeof params.status === "string" ? params.status : undefined,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : null,
    query: typeof params.query === "string" ? params.query : undefined,
  });

  return <BlogPostList data={data} />;
}
