import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { addressRepository } from "@/server/addresses/address.repository";
import { updateAddressSchema } from "@/server/addresses/address.schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAddressSchema.parse(body);
    const address = await addressRepository.updateAddress(id, userId, parsed);

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Dirección no encontrada" },
        { status: 404 },
      );
    }
    console.error("[addresses PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar dirección" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await addressRepository.deleteAddress(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Dirección no encontrada" },
        { status: 404 },
      );
    }
    console.error("[addresses DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar dirección" },
      { status: 500 },
    );
  }
}
