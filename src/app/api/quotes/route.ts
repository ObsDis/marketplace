import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateQuote } from "@/lib/quote-engine";

const submitQuoteSchema = z.object({
  deliveryId: z.string().min(1),
  amount: z.number().positive("Quote amount must be positive"),
  message: z.string().optional(),
  estimatedPickup: z.string().optional(),
});

// GET /api/quotes?deliveryId=xxx — get quotes for a delivery
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deliveryId = request.nextUrl.searchParams.get("deliveryId");
    if (!deliveryId) {
      return NextResponse.json({ error: "deliveryId required" }, { status: 400 });
    }

    const delivery = await db.delivery.findUnique({
      where: { id: deliveryId },
      select: { customerId: true },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    // Shippers see all quotes; drivers see only their own
    const isShipper = session.user.id === delivery.customerId;

    const where: Record<string, unknown> = { deliveryId };
    if (!isShipper && session.user.driver) {
      where.driverId = session.user.driver.id;
    } else if (!isShipper) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const quotes = await db.quote.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            totalDeliveries: true,
            photo: true,
            vanInfo: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

// POST /api/quotes — driver submits a quote
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
      include: { rateCard: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (driver.subscriptionStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Active subscription required to submit quotes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = submitQuoteSchema.parse(body);

    const delivery = await db.delivery.findUnique({
      where: { id: parsed.deliveryId },
    });

    if (!delivery || delivery.status !== "POSTED") {
      return NextResponse.json(
        { error: "Delivery not found or no longer accepting quotes" },
        { status: 400 }
      );
    }

    // Check for existing quote
    const existing = await db.quote.findUnique({
      where: {
        deliveryId_driverId: {
          deliveryId: parsed.deliveryId,
          driverId: driver.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already submitted a quote for this delivery" },
        { status: 409 }
      );
    }

    // Calculate auto-quote for reference
    let autoQuotedAmount = parsed.amount;
    if (driver.rateCard) {
      autoQuotedAmount = calculateQuote(driver.rateCard, {
        distance: delivery.distance,
        packageSize: delivery.packageSize,
        packageWeight: delivery.packageWeight,
        packageCount: delivery.packageCount,
        deliverySpeed: delivery.deliverySpeed,
      });
    }

    const quote = await db.quote.create({
      data: {
        deliveryId: parsed.deliveryId,
        driverId: driver.id,
        amount: parsed.amount,
        autoQuotedAmount,
        message: parsed.message,
        estimatedPickup: parsed.estimatedPickup,
      },
      include: {
        driver: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            totalDeliveries: true,
          },
        },
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error submitting quote:", error);
    return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 });
  }
}
