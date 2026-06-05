import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { collectionRepository } from "@/server/collections/collection.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await params;
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Collection not found" }, timestamp }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: collection, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin collection GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch collection." }, timestamp }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await params;
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Collection not found" }, timestamp }, { status: 404 });
    }

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" }, timestamp }, { status: 400 });
    }

    const collection = await collectionRepository.update(id, body as Record<string, unknown>);
    return NextResponse.json({ success: true, data: collection, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin collection PATCH error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update collection." }, timestamp }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) return authResult.response;

    const { id } = await params;
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Collection not found" }, timestamp }, { status: 404 });
    }

    await collectionRepository.delete(id);
    return NextResponse.json({ success: true, data: { deleted: true }, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Admin collection DELETE error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete collection." }, timestamp }, { status: 500 });
  }
}
