import "server-only";
import { contactLeadRepository } from "@/server/contact/contact-lead.repository";
import type { CreateContactLeadInput, ContactLeadResponseDto } from "@/features/contact/schemas/contact-lead.schema";
import type { ContactLead } from "@/types/contact-lead";

/**
 * CreateContactLeadService - application service for creating contact leads
 * Orchestrates validation and repository calls
 * Located in services/ for reusable business workflows
 */

export async function createContactLeadService(
  input: CreateContactLeadInput,
): Promise<ContactLeadResponseDto> {
  // Create the lead in database
  const lead = await contactLeadRepository.create(input);

  try {
    const { sendContactLeadNotification } = await import(
      "@/services/email/send-contact-lead-notification"
    );
    await sendContactLeadNotification(lead);
  } catch (error) {
    console.error("[contact-lead] Failed to send notification email:", error);
  }

  // Transform to response DTO
  return contactLeadToResponse(lead);
}

/**
 * Transform ContactLead to response DTO
 * Excludes sensitive or internal fields
 */
function contactLeadToResponse(lead: ContactLead): ContactLeadResponseDto {
  return {
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    status: lead.status as "new" | "contacted" | "converted" | "rejected",
    createdAt: lead.createdAt.toISOString(),
  };
}
