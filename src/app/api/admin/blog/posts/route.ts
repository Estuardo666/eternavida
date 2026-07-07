import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminBlogPostFormSchema } from "@/features/admin-blog/schemas/admin-blog.schema";
import { getBlogAdminListData, mapPostItem } from "@/services/admin-blog/get-blog-admin-data";
import { createBlogPost, BlogConflictError } from "@/services/admin-blog/post-crud";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import type { AdminBlogPostFormData } from "@/types/admin-blog";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { searchParams } = new URL(request.url);
    const data = await getBlogAdminListData({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      status: searchParams.get("status") ?? undefined,
      categoryId: searchParams.get("categoryId"),
      query: searchParams.get("query") ?? undefined,
    });

    return NextResponse.json({ success: true, data, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin blog posts GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load blog posts." }, timestamp }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." }, timestamp }, { status: 400 });
    }

    const validationResult = adminBlogPostFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message }, timestamp }, { status: 422 });
    }

    const post = await createBlogPost(validationResult.data as AdminBlogPostFormData);

    return NextResponse.json({ success: true, data: { post: mapPostItem(post) }, timestamp }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Blog post slug already exists." }, timestamp }, { status: 409 });
    }
    if (error instanceof BlogConflictError) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: error.message }, timestamp }, { status: 409 });
    }
    console.error("Admin blog posts POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create blog post." }, timestamp }, { status: 500 });
  }
}
