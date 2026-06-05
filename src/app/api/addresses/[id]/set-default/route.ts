import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addressRepository } from "@/server/addresses/address.repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const address = await addressRepository.setDefaultAddress(id, userId);

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Dirección no encontrada" },
        { status: 404 },
      );
    }
    console.error("[addresses set-default]", error);
    return NextResponse.json(
      { success: false, error: "Error al establecer dirección predeterminada" },
      { status: 500 },
    );
  }
}
