import { NextRequest, NextResponse } from "next/server";

import { adminBlogCategoryFormSchema } from "@/features/admin-blog/schemas/admin-blog.schema";
import { listAllCategories } from "@/server/blog/blog-category.repository";
import { createBlogCategory, BlogCategoryConflictError } from "@/services/admin-blog/category-crud";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import type { AdminBlogCategoryFormData } from "@/types/admin-blog";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const categories = await listAllCategories();

    return NextResponse.json({ success: true, data: { categories }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin blog categories GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load blog categories." }, timestamp }, { status: 500 });
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

    const validationResult = adminBlogCategoryFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message }, timestamp }, { status: 422 });
    }

    const category = await createBlogCategory(validationResult.data as AdminBlogCategoryFormData);

    return NextResponse.json({ success: true, data: { category }, timestamp }, { status: 201 });
  } catch (error) {
    if (error instanceof BlogCategoryConflictError) {
      return NextResponse.json({ success: false, error: { code: "CONFLICT", message: error.message }, timestamp }, { status: 409 });
    }
    console.error("Admin blog categories POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create blog category." }, timestamp }, { status: 500 });
  }
}
