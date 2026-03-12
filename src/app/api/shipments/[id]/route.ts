import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ShipmentStatus, VehicleType } from "@/generated/prisma";

const updateShipmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  pickupAddress: z.string().optional(),
  pickupCity: z.string().optional(),
  pickupState: z.string().optional(),
  pickupZip: z.string().optional(),
  dropAddress: z.string().optional(),
  dropCity: z.string().optional(),
  dropState: z.string().optional(),
  dropZip: z.string().optional(),
  weight: z.number().positive().optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  price: z.number().positive().optional(),
  status: z.nativeEnum(ShipmentStatus).optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  trackingNote: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shipment = await db.shipment.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, businessName: true, logo: true, phone: true },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("GET /api/shipments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await db.shipment.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    if (shipment.merchant.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateShipmentSchema.parse(body);

    const updated = await db.shipment.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("PATCH /api/shipments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await db.shipment.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    if (shipment.merchant.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.shipment.delete({ where: { id } });

    return NextResponse.json({ message: "Shipment deleted" });
  } catch (error) {
    console.error("DELETE /api/shipments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
