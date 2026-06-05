import { NextRequest, NextResponse } from "next/server";
import { collectionRepository } from "@/server/collections/collection.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  try {
    const { slug } = await params;
    const collection = await collectionRepository.findBySlug(slug);

    if (!collection || !collection.isActive) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Collection not found" }, timestamp }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: collection, timestamp }, { status: 200 });
  } catch (error) {
    console.error("Collection GET error:", { error: error instanceof Error ? error.message : String(error), timestamp });
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch collection." }, timestamp }, { status: 500 });
  }
}
