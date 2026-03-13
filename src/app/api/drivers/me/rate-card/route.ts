import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const rateCardSchema = z.object({
  baseRate: z.number().min(1, "Base rate must be at least $1"),
  perMileRate: z.number().min(0),
  surgSmall: z.number().min(0).default(0),
  surgMedium: z.number().min(0).default(0),
  surgLarge: z.number().min(0).default(0),
  surgXL: z.number().min(0).default(0),
  surgXXL: z.number().min(0).default(0),
  surgPallet: z.number().min(0).default(0),
  surgWeightLight: z.number().min(0).default(0),
  surgWeightMedium: z.number().min(0).default(0),
  surgWeightHeavy: z.number().min(0).default(0),
  surgWeightExtraHeavy: z.number().min(0).default(0),
  perExtraItem: z.number().min(0).default(0),
  premiumSameDay: z.number().min(0).default(0),
  premiumRush: z.number().min(0).default(0),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
      include: { rateCard: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(driver.rateCard);
  } catch (error) {
    console.error("Error fetching rate card:", error);
    return NextResponse.json({ error: "Failed to fetch rate card" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = rateCardSchema.parse(body);

    const rateCard = await db.rateCard.upsert({
      where: { driverId: driver.id },
      create: { driverId: driver.id, ...parsed },
      update: parsed,
    });

    return NextResponse.json(rateCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error saving rate card:", error);
    return NextResponse.json({ error: "Failed to save rate card" }, { status: 500 });
  }
}
