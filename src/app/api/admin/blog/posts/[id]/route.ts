import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminBlogPostFormSchema } from "@/features/admin-blog/schemas/admin-blog.schema";
import { mapPostItem } from "@/services/admin-blog/get-blog-admin-data";
import { updateBlogPost, deleteBlogPost, BlogConflictError } from "@/services/admin-blog/post-crud";
import { findPostById } from "@/server/blog/blog-post.repository";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import type { AdminBlogPostFormData } from "@/types/admin-blog";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;
    const post = await findPostById(id);

    if (!post) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Blog post not found." }, timestamp }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { post: mapPostItem(post) }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin blog post GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load blog post." }, timestamp }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." }, timestamp }, { status: 400 });
    }

    const validationResult = adminBlogPostFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message }, timestamp }, { status: 422 });
    }

    const post = await updateBlogPost(id, validationResult.data as AdminBlogPostFormData);

    return NextResponse.json({ success: true, data: { post: mapPostItem(post) }, timestamp }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Blog post slug already exists." }, timestamp }, { status: 409 });
    }
    if (error instanceof BlogConflictError) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: error.message }, timestamp }, { status: 409 });
    }
    console.error("Admin blog post PUT error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update blog post." }, timestamp }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;
    await deleteBlogPost(id);

    return NextResponse.json({ success: true, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin blog post DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete blog post." }, timestamp }, { status: 500 });
  }
}
