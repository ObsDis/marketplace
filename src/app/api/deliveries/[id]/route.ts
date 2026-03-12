import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DeliveryStatus, SubStatus } from "@/generated/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const delivery = await db.delivery.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        driver: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const delivery = await db.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found." },
        { status: 404 }
      );
    }

    // Customer cancellation
    if (status === DeliveryStatus.CANCELLED) {
      if (delivery.customerId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the customer who posted can cancel." },
          { status: 403 }
        );
      }

      const updated = await db.delivery.update({
        where: { id },
        data: { status: DeliveryStatus.CANCELLED },
      });

      return NextResponse.json(updated);
    }

    // Driver accepting
    if (status === DeliveryStatus.ACCEPTED) {
      const driver = await db.driver.findUnique({
        where: { userId: session.user.id },
      });

      if (!driver) {
        return NextResponse.json(
          { error: "Only drivers can accept deliveries." },
          { status: 403 }
        );
      }

      if (driver.subscriptionStatus !== SubStatus.ACTIVE) {
        return NextResponse.json(
          { error: "An active subscription is required to accept deliveries." },
          { status: 403 }
        );
      }

      if (delivery.status !== DeliveryStatus.POSTED) {
        return NextResponse.json(
          { error: "This delivery is no longer available." },
          { status: 400 }
        );
      }

      const updated = await db.delivery.update({
        where: { id },
        data: {
          status: DeliveryStatus.ACCEPTED,
          driverId: driver.id,
        },
      });

      return NextResponse.json(updated);
    }

    // Driver status updates
    if (
      status === DeliveryStatus.PICKED_UP ||
      status === DeliveryStatus.IN_TRANSIT ||
      status === DeliveryStatus.DELIVERED
    ) {
      const driver = await db.driver.findUnique({
        where: { userId: session.user.id },
      });

      if (!driver || delivery.driverId !== driver.id) {
        return NextResponse.json(
          { error: "Only the assigned driver can update this delivery." },
          { status: 403 }
        );
      }

      const updateData: Record<string, unknown> = { status };

      if (status === DeliveryStatus.PICKED_UP) {
        updateData.pickedUpAt = new Date();
      }

      if (status === DeliveryStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }

      const updated = await db.delivery.update({
        where: { id },
        data: updateData,
      });

      // Increment driver's total deliveries on completion
      if (status === DeliveryStatus.DELIVERED) {
        await db.driver.update({
          where: { id: driver.id },
          data: { totalDeliveries: { increment: 1 } },
        });
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Invalid status update." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const delivery = await db.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found." },
        { status: 404 }
      );
    }

    if (delivery.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the customer who posted can delete this delivery." },
        { status: 403 }
      );
    }

    if (delivery.status !== DeliveryStatus.POSTED) {
      return NextResponse.json(
        { error: "Only deliveries with POSTED status can be deleted." },
        { status: 400 }
      );
    }

    await db.delivery.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery." },
      { status: 500 }
    );
  }
}
