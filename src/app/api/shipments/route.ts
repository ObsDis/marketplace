import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Industry, ShipmentStatus, VehicleType } from "@/generated/prisma";

const createShipmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupCity: z.string().min(1, "Pickup city is required"),
  pickupState: z.string().min(1, "Pickup state is required"),
  pickupZip: z.string().min(1, "Pickup zip is required"),
  dropAddress: z.string().min(1, "Drop address is required"),
  dropCity: z.string().min(1, "Drop city is required"),
  dropState: z.string().min(1, "Drop state is required"),
  dropZip: z.string().min(1, "Drop zip is required"),
  weight: z.number().positive().optional(),
  vehicleType: z.nativeEnum(VehicleType).default(VehicleType.VAN),
  price: z.number().positive("Price must be positive"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status as ShipmentStatus;
    }

    const shipments = await db.shipment.findMany({
      where,
      include: {
        merchant: {
          select: { id: true, businessName: true, logo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error("GET /api/shipments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchant = await db.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (!merchant || merchant.industry !== Industry.LOGISTICS) {
      return NextResponse.json(
        { error: "Only logistics merchants can create shipments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createShipmentSchema.parse(body);

    const shipment = await db.shipment.create({
      data: {
        ...parsed,
        merchantId: merchant.id,
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/shipments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
