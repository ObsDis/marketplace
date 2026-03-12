import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createReviewSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.parse(body);

    // Check that the driver exists
    const driver = await db.driver.findUnique({
      where: { id: parsed.driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found." },
        { status: 404 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        driverId: parsed.driverId,
        rating: parsed.rating,
        comment: parsed.comment,
      },
    });

    // Update driver's average rating
    const { _avg } = await db.review.aggregate({
      where: { driverId: parsed.driverId },
      _avg: { rating: true },
    });

    await db.driver.update({
      where: { id: parsed.driverId },
      data: { rating: _avg.rating ?? 0 },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review." },
      { status: 500 }
    );
  }
}
