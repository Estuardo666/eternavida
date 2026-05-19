import { NextRequest, NextResponse } from "next/server";
import {
  createContactLeadInputSchema,
  listContactLeadsQuerySchema,
} from "@/features/contact/schemas/contact-lead.schema";
import { createContactLeadService } from "@/services/contact/create-contact-lead";
import { listContactLeadsService } from "@/services/contact/list-contact-leads";
import { requireAdminAuth } from "@/server/auth/require-admin-auth";

/**
 * GET /api/contact-leads
 * List contact leads with pagination and optional filters
 *
 * Query params:
 *   status?  "new" | "contacted" | "converted" | "rejected"
 *   source?  "web-form" | "landing-page" | "email" | "referral"
 *   page?    integer >= 1 (default: 1)
 *   limit?   integer >= 1, max 100 (default: 20)
 *
 * Response on success (200):
 * {
 *   success: true
 *   data: {
 *     items: ContactLeadListItem[]
 *     pagination: { page, limit, total, totalPages }
 *   }
 *   timestamp: ISO string
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    const rawQuery = {
      status: searchParams.get("status") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const validationResult = listContactLeadsQuerySchema.safeParse(rawQuery);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid query parameters: ${errors}`,
          },
          timestamp,
        },
        { status: 422 },
      );
    }

    const result = await listContactLeadsService(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ContactLead GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch contact leads. Please try again.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/contact-leads
 * Create a new contact lead from form submission
 *
 * Request body:
 * {
 *   fullName: string
 *   email: string
 *   phone?: string
 *   message: string
 *   source?: "web-form" | "landing-page" | "email" | "referral" (defaults to "web-form")
 * }
 *
 * Response on success (201):
 * {
 *   success: true
 *   data: { id, fullName, email, status, createdAt }
 *   timestamp: ISO string
 * }
 *
 * Response on error:
 * {
 *   success: false
 *   error: { code, message }
 *   timestamp: ISO string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString();

  try {
    // Parse JSON body
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

    // Validate input against schema
    const validationResult = createContactLeadInputSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
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

    // Create contact lead using service
    const contactLead = await createContactLeadService(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: contactLead,
        timestamp,
      },
      { status: 201 },
    );
  } catch (error) {
    // Log error for observability (important for production)
    console.error("ContactLead POST error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp,
    });

    // Return generic error to avoid leaking internal details
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create contact lead. Please try again.",
        },
        timestamp,
      },
      { status: 500 },
    );
  }
}
