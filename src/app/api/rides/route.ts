import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const createRideSchema = z.object({
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),
  estimatedFare: z.number().positive("Estimated fare must be positive"),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rides = await db.ride.findMany({
      where: { passengerId: session.user.id },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error("GET /api/rides error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createRideSchema.parse(body);

    const ride = await db.ride.create({
      data: {
        ...parsed,
        passengerId: session.user.id,
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/rides error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
