import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ReviewDirection } from "@/generated/prisma";

const createReviewSchema = z.object({
  deliveryId: z.string().min(1, "Delivery ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  direction: z.nativeEnum(ReviewDirection),
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

    // Verify the delivery exists and is completed
    const delivery = await db.delivery.findUnique({
      where: { id: parsed.deliveryId },
    });

    if (!delivery || delivery.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Review can only be submitted for completed deliveries." },
        { status: 400 }
      );
    }

    // Verify the reviewer is involved in this delivery
    const isShipper = delivery.customerId === session.user.id;
    const driver = session.user.driver;
    const isDriver = driver && delivery.driverId === driver.id;

    if (!isShipper && !isDriver) {
      return NextResponse.json(
        { error: "You are not involved in this delivery." },
        { status: 403 }
      );
    }

    // Verify direction matches role
    if (isShipper && parsed.direction !== ReviewDirection.SHIPPER_TO_DRIVER) {
      return NextResponse.json(
        { error: "Shippers can only submit shipper-to-driver reviews." },
        { status: 400 }
      );
    }
    if (isDriver && parsed.direction !== ReviewDirection.DRIVER_TO_SHIPPER) {
      return NextResponse.json(
        { error: "Drivers can only submit driver-to-shipper reviews." },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        deliveryId: parsed.deliveryId,
        reviewerId: session.user.id,
        driverId: parsed.driverId,
        direction: parsed.direction,
        rating: parsed.rating,
        comment: parsed.comment,
      },
    });

    // Update driver's average rating (from shipper reviews)
    const { _avg } = await db.review.aggregate({
      where: {
        driverId: parsed.driverId,
        direction: ReviewDirection.SHIPPER_TO_DRIVER,
      },
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
