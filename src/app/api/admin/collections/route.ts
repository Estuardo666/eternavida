import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { collectionRepository } from "@/server/collections/collection.repository";

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const collections = await collectionRepository.findAll({ includeInactive: true });
    return NextResponse.json({ success: true, data: { items: collections }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin collections GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch collections." }, timestamp }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp }, { status: 400 });
    }

    const data = body as {
      slug: string; name: string; description?: string; excerpt?: string;
      isActive?: boolean; sortOrder?: number; mediaAssetId?: string | null;
      productIds?: string[]; categoryIds?: string[];
    };

    if (!data.slug || !data.name) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "slug and name are required" }, timestamp }, { status: 422 });
    }

    const existing = await collectionRepository.findBySlug(data.slug);
    if (existing) {
      return NextResponse.json({ success: false, error: { code: "DUPLICATE", message: "A collection with this slug already exists" }, timestamp }, { status: 409 });
    }

    const collection = await collectionRepository.create(data);
    return NextResponse.json({ success: true, data: collection, timestamp }, { status: 201 });
  } catch (error) {
    console.error("Admin collections POST error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create collection." }, timestamp }, { status: 500 });
  }
}
