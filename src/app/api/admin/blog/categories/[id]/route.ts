import { NextRequest, NextResponse } from "next/server";

import { adminBlogCategoryFormSchema } from "@/features/admin-blog/schemas/admin-blog.schema";
import { updateBlogCategory, deleteBlogCategory, BlogCategoryConflictError } from "@/services/admin-blog/category-crud";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import type { AdminBlogCategoryFormData } from "@/types/admin-blog";

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

    const validationResult = adminBlogCategoryFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message }, timestamp }, { status: 422 });
    }

    const category = await updateBlogCategory(id, validationResult.data as AdminBlogCategoryFormData);

    return NextResponse.json({ success: true, data: { category }, timestamp }, { status: 200 });
  } catch (error) {
    if (error instanceof BlogCategoryConflictError) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: error.message }, timestamp }, { status: 409 });
    }
    console.error("Admin blog category PUT error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update blog category." }, timestamp }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await context.params;
    await deleteBlogCategory(id);

    return NextResponse.json({ success: true, timestamp }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete blog category.";
    const status = message.includes("associated posts") ? 409 : 500;
    return NextResponse.json({ success: false, error: { code: status === 409 ? "CONFLICT" : "INTERNAL_ERROR", message }, timestamp }, { status });
  }
}
