import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { addressRepository } from "@/server/addresses/address.repository";
import { createAddressSchema } from "@/server/addresses/address.schemas";

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addresses = await addressRepository.getAddressesByUserId(userId);
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("[addresses GET]", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener direcciones" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createAddressSchema.parse(body);
    const address = await addressRepository.createAddress(userId, parsed);

    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }
    console.error("[addresses POST]", error);
    return NextResponse.json(
      { success: false, error: "Error al crear dirección" },
      { status: 500 },
    );
  }
}
