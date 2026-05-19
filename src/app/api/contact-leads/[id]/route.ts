import { NextRequest, NextResponse } from "next/server";
import {
  contactLeadRouteParamsSchema,
  updateContactLeadStatusBodySchema,
} from "@/features/contact/schemas/contact-lead.schema";
import { ContactLeadNotFoundError } from "@/services/contact/contact-lead.errors";
import { getContactLeadByIdService } from "@/services/contact/get-contact-lead-by-id";
import { updateContactLeadStatusService } from "@/services/contact/update-contact-lead-status";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function validateRouteParams(
  context: RouteContext,
): Promise<
  | { success: true; data: { id: string } }
  | { success: false; response: NextResponse }
> {
  const timestamp = new Date().toISOString();
  const params = await context.params;
  const paramsValidation = contactLeadRouteParamsSchema.safeParse(params);

  if (!paramsValidation.success) {
    const errors = paramsValidation.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid route parameters: ${errors}`,
          },
          timestamp,
        },
        { status: 422 },
      ),
    };
  }

  return {
    success: true,
    data: paramsValidation.data,
  };
}

/**
 * GET /api/contact-leads/[id]
 * Return a single contact lead by id.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const paramsResult = await validateRouteParams(context);
    if (!paramsResult.success) {
      return paramsResult.response;
    }

    const lead = await getContactLeadByIdService(paramsResult.data.id);

    return NextResponse.json(
      {
        success: true,
        data: lead,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ContactLeadNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Contact lead not found",
          },
          timestamp,
        },
        { status: 404 },
      );
    }

    console.error("ContactLead GET by id error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch contact lead. Please try again.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/contact-leads/[id]
 * Update a lead status using canonical domain values.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const paramsResult = await validateRouteParams(context);
    if (!paramsResult.success) {
      return paramsResult.response;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON",
          },
          timestamp,
        },
        { status: 400 },
      );
    }

    const bodyValidation = updateContactLeadStatusBodySchema.safeParse(body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Validation failed: ${errors}`,
          },
          timestamp,
        },
        { status: 422 },
      );
    }

    const updatedLead = await updateContactLeadStatusService(
      paramsResult.data.id,
      bodyValidation.data,
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedLead,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ContactLeadNotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Contact lead not found",
          },
          timestamp,
        },
        { status: 404 },
      );
    }

    console.error("ContactLead PATCH error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update contact lead. Please try again.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}