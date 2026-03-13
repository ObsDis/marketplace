import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { PackageSize, DeliverySpeed } from "@/generated/prisma";
import { calculateQuote } from "@/lib/quote-engine";

const estimateSchema = z.object({
  packageSize: z.nativeEnum(PackageSize).default(PackageSize.MEDIUM),
  packageWeight: z.number().nullable().optional(),
  packageCount: z.number().int().positive().default(1),
  distance: z.number().nullable().optional(),
  deliverySpeed: z.nativeEnum(DeliverySpeed).default(DeliverySpeed.STANDARD),
  pickupCity: z.string().optional(),
  pickupState: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = estimateSchema.parse(body);

    // Find available drivers with rate cards (optionally filter by service area)
    const where: Record<string, unknown> = {
      available: true,
      subscriptionStatus: "ACTIVE",
      rateCard: { isNot: null },
    };

    const drivers = await db.driver.findMany({
      where,
      include: { rateCard: true },
    });

    if (drivers.length === 0) {
      return NextResponse.json({
        driverCount: 0,
        estimatedMin: null,
        estimatedMax: null,
        quotes: [],
      });
    }

    const deliveryParams = {
      distance: parsed.distance ?? null,
      packageSize: parsed.packageSize,
      packageWeight: parsed.packageWeight ?? null,
      packageCount: parsed.packageCount,
      deliverySpeed: parsed.deliverySpeed,
    };

    const autoQuotes = drivers
      .filter((d): d is typeof d & { rateCard: NonNullable<typeof d.rateCard> } => !!d.rateCard)
      .map((d) => calculateQuote(d.rateCard, deliveryParams));

    const estimatedMin = Math.min(...autoQuotes);
    const estimatedMax = Math.max(...autoQuotes);

    return NextResponse.json({
      driverCount: autoQuotes.length,
      estimatedMin,
      estimatedMax,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error estimating price:", error);
    return NextResponse.json(
      { error: "Failed to estimate price." },
      { status: 500 }
    );
  }
}
