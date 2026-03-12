import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const updateDriverSchema = z.object({
  displayName: z.string().min(1).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  vanInfo: z.string().optional(),
  licensePlate: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  available: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateDriverSchema.parse(body);

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver profile not found." },
        { status: 404 }
      );
    }

    const updated = await db.driver.update({
      where: { id: driver.id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error updating driver:", error);
    return NextResponse.json(
      { error: "Failed to update driver profile." },
      { status: 500 }
    );
  }
}
