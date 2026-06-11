import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { adminPickupLocationFormSchema } from "@/features/admin-catalog/schemas/admin-catalog.schema";
import { mapAdminPickupLocationItem } from "@/services/admin-catalog/get-catalog-admin-data";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";
import { prisma } from "@/server/db/prisma";

function createErrorResponse(status: number, code: string, message: string, timestamp: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp,
    },
    { status },
  );
}

const pickupLocationInclude = {
  logoMedia: {
    select: {
      publicUrl: true,
      altText: true,
    },
  },
} as const;

export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const records = await prisma.pickupLocation.findMany({
      include: pickupLocationInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          pickupLocations: records.map(mapAdminPickupLocationItem),
        },
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pickup locations.";
    return createErrorResponse(500, "INTERNAL_ERROR", message, timestamp);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.", timestamp);
    }

    const validationResult = adminPickupLocationFormSchema.safeParse(body);
    if (!validationResult.success) {
      const message = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return createErrorResponse(422, "VALIDATION_ERROR", message, timestamp);
    }

    const data = validationResult.data;
    const logoMediaId = data.logoMediaId.trim() || null;

    if (logoMediaId) {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: logoMediaId },
        select: { id: true },
      });
      if (!mediaAsset) {
        return createErrorResponse(422, "VALIDATION_ERROR", "The selected logo media asset does not exist.", timestamp);
      }
    }

    const pickupLocation = await prisma.pickupLocation.create({
      data: {
        name: data.name,
        address: data.address,
        directionsUrl: data.directionsUrl.trim() || null,
        logoMediaId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: pickupLocationInclude,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          pickupLocation: mapAdminPickupLocationItem(pickupLocation),
        },
        timestamp,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse(409, "CONFLICT", "Pickup location name already exists.", timestamp);
    }

    const message = error instanceof Error ? error.message : "Failed to create pickup location.";
    return createErrorResponse(500, "INTERNAL_ERROR", message, timestamp);
  }
}
