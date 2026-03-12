import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ListingStatus } from "@/generated/prisma";

const updateBrokerageSchema = z.object({
  businessName: z.string().min(1).optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  askingPrice: z.number().positive().optional(),
  annualRevenue: z.number().positive().optional().nullable(),
  annualProfit: z.number().optional().nullable(),
  employeeCount: z.number().int().min(0).optional().nullable(),
  yearEstablished: z.number().int().optional().nullable(),
  location: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  ndaRequired: z.boolean().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.brokerageListing.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, businessName: true, logo: true, description: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/brokerages/[id] error:", error);
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

    const listing = await db.brokerageListing.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.merchant.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateBrokerageSchema.parse(body);

    const updated = await db.brokerageListing.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("PATCH /api/brokerages/[id] error:", error);
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

    const listing = await db.brokerageListing.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.merchant.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.brokerageListing.delete({ where: { id } });

    return NextResponse.json({ message: "Listing deleted" });
  } catch (error) {
    console.error("DELETE /api/brokerages/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
