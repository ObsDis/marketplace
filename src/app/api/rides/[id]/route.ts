import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RideStatus } from "@/generated/prisma";

const updateRideSchema = z.object({
  status: z.nativeEnum(RideStatus).optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  vehicleInfo: z.string().optional(),
  finalFare: z.number().positive().optional(),
  distance: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const ride = await db.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("GET /api/rides/[id] error:", error);
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

    const ride = await db.ride.findUnique({
      where: { id },
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateRideSchema.parse(body);

    const data: Record<string, unknown> = { ...parsed };

    if (parsed.status === RideStatus.ACCEPTED) {
      data.acceptedAt = new Date();
    } else if (parsed.status === RideStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const updated = await db.ride.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("PATCH /api/rides/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
