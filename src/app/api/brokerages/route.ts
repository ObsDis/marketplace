import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Industry } from "@/generated/prisma";

const createBrokerageSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(1, "Description is required"),
  askingPrice: z.number().positive("Asking price must be positive"),
  annualRevenue: z.number().positive().optional(),
  annualProfit: z.number().optional(),
  employeeCount: z.number().int().min(0).optional(),
  yearEstablished: z.number().int().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).default([]),
  ndaRequired: z.boolean().default(true),
});

export async function GET() {
  try {
    const listings = await db.brokerageListing.findMany({
      where: { status: "ACTIVE" },
      include: {
        merchant: {
          select: { id: true, businessName: true, logo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET /api/brokerages error:", error);
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

    if (!merchant || merchant.industry !== Industry.BROKERAGE) {
      return NextResponse.json(
        { error: "Only brokerage merchants can create listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createBrokerageSchema.parse(body);

    const listing = await db.brokerageListing.create({
      data: {
        ...parsed,
        merchantId: merchant.id,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/brokerages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
