import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendDeliveryPosted } from "@/lib/email";
import { PackageSize, DeliveryStatus, DeliverySpeed } from "@/generated/prisma";
import { calculateQuote } from "@/lib/quote-engine";

const createDeliverySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  packageSize: z.nativeEnum(PackageSize).default(PackageSize.MEDIUM),
  packageWeight: z.number().positive().optional(),
  packageCount: z.number().int().positive().default(1),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupCity: z.string().min(1, "Pickup city is required"),
  pickupState: z.string().min(1, "Pickup state is required"),
  pickupZip: z.string().min(1, "Pickup zip is required"),
  pickupContact: z.string().optional(),
  pickupPhone: z.string().optional(),
  pickupNotes: z.string().optional(),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  dropoffCity: z.string().min(1, "Dropoff city is required"),
  dropoffState: z.string().min(1, "Dropoff state is required"),
  dropoffZip: z.string().min(1, "Dropoff zip is required"),
  dropoffContact: z.string().optional(),
  dropoffPhone: z.string().optional(),
  dropoffNotes: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  distance: z.number().positive().optional(),
  deliverySpeed: z.nativeEnum(DeliverySpeed).default(DeliverySpeed.STANDARD),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  latestDeliveryTime: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || "POSTED";
    const city = searchParams.get("city");
    const size = searchParams.get("size");

    const where: Record<string, unknown> = {
      status: status as DeliveryStatus,
    };

    if (city) {
      where.pickupCity = { contains: city, mode: "insensitive" };
    }

    if (size) {
      where.packageSize = size as PackageSize;
    }

    const deliveries = await db.delivery.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true },
        },
        driver: {
          select: { id: true, displayName: true, rating: true },
        },
        _count: {
          select: { quotes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error listing deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createDeliverySchema.parse(body);

    // Calculate estimated price range from available drivers
    const drivers = await db.driver.findMany({
      where: {
        available: true,
        subscriptionStatus: "ACTIVE",
        rateCard: { isNot: null },
      },
      include: { rateCard: true },
    });

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

    const estimatedMin = autoQuotes.length > 0 ? Math.min(...autoQuotes) : null;
    const estimatedMax = autoQuotes.length > 0 ? Math.max(...autoQuotes) : null;

    const delivery = await db.delivery.create({
      data: {
        customerId: session.user.id,
        title: parsed.title,
        description: parsed.description,
        packageSize: parsed.packageSize,
        packageWeight: parsed.packageWeight,
        packageCount: parsed.packageCount,
        pickupAddress: parsed.pickupAddress,
        pickupCity: parsed.pickupCity,
        pickupState: parsed.pickupState,
        pickupZip: parsed.pickupZip,
        pickupContact: parsed.pickupContact,
        pickupPhone: parsed.pickupPhone,
        pickupNotes: parsed.pickupNotes,
        dropoffAddress: parsed.dropoffAddress,
        dropoffCity: parsed.dropoffCity,
        dropoffState: parsed.dropoffState,
        dropoffZip: parsed.dropoffZip,
        dropoffContact: parsed.dropoffContact,
        dropoffPhone: parsed.dropoffPhone,
        dropoffNotes: parsed.dropoffNotes,
        images: parsed.images ?? [],
        distance: parsed.distance,
        deliverySpeed: parsed.deliverySpeed,
        estimatedMin,
        estimatedMax,
        pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
        pickupTime: parsed.pickupTime,
        deliveryDate: parsed.deliveryDate ? new Date(parsed.deliveryDate) : undefined,
        deliveryTime: parsed.deliveryTime,
        latestDeliveryTime: parsed.latestDeliveryTime,
      },
    });

    // Fire-and-forget: notify customer that their delivery was posted
    sendDeliveryPosted(session.user.email, delivery.title);

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error creating delivery:", error);
    const message = error instanceof Error ? error.message : "Failed to create delivery.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
