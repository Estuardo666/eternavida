import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/server/auth/require-admin-auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_URL", message: "url param required." } },
        { status: 400 },
      );
    }

    // Only allow R2 public URLs
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_DEV_URL;
    if (r2PublicUrl && !url.startsWith(r2PublicUrl)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_URL", message: "Only R2 URLs are allowed." } },
        { status: 400 },
      );
    }

    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: { code: "UPSTREAM_ERROR", message: `Upstream returned ${upstream.status}.` } },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Admin image proxy error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Proxy failed." } },
      { status: 500 },
    );
  }
}
