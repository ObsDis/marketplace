import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  sendDeliveryAccepted,
  sendDeliveryPickedUp,
  sendDeliveryCompleted,
  sendDeliveryCancelled,
} from "@/lib/email";
import { DeliveryStatus, SubStatus } from "@/generated/prisma";

// Stripe's standard CC processing fee — passed through, not profit.
// Revenue comes from driver $99/month subscriptions.
const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED_CENTS = 30;

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

    // ─── Customer cancellation ──────────────────────────────
    if (status === DeliveryStatus.CANCELLED) {
      if (delivery.customerId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the customer who posted can cancel." },
          { status: 403 }
        );
      }

      // Refund the customer if payment was made
      let refundId: string | undefined;
      if (delivery.paymentIntentId && delivery.paymentStatus === "PAID") {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: delivery.paymentIntentId,
          });
          refundId = refund.id;
        } catch (refundError) {
          console.error("Refund failed:", refundError);
          return NextResponse.json(
            { error: "Failed to process refund. Please contact support." },
            { status: 500 }
          );
        }
      }

      const updated = await db.delivery.update({
        where: { id },
        data: {
          status: DeliveryStatus.CANCELLED,
          paymentStatus: refundId ? "REFUNDED" : delivery.paymentStatus,
          refundId,
        },
      });

      // Fire-and-forget: notify customer of cancellation
      const cancelCustomer = await db.user.findUnique({ where: { id: delivery.customerId } });
      if (cancelCustomer?.email) {
        sendDeliveryCancelled(cancelCustomer.email, delivery.title);
      }

      return NextResponse.json(updated);
    }

    // ─── Driver accepting ────────────────────────────────────
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

      // Require Stripe Connect for payout
      if (!driver.stripeAccountId || !driver.stripeAccountReady) {
        return NextResponse.json(
          { error: "You must complete Stripe Connect setup to accept deliveries." },
          { status: 403 }
        );
      }

      const updated = await db.delivery.update({
        where: { id },
        data: {
          status: DeliveryStatus.ACCEPTED,
          driverId: driver.id,
        },
      });

      // Fire-and-forget: notify customer that a driver accepted
      const acceptCustomer = await db.user.findUnique({ where: { id: delivery.customerId } });
      if (acceptCustomer?.email) {
        sendDeliveryAccepted(acceptCustomer.email, driver.displayName, delivery.title);
      }

      return NextResponse.json(updated);
    }

    // ─── Driver status updates ───────────────────────────────
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

      // ─── DELIVERED: Transfer payment to driver ─────────────
      if (status === DeliveryStatus.DELIVERED) {
        updateData.deliveredAt = new Date();

        if (
          delivery.paymentIntentId &&
          delivery.paymentStatus === "PAID" &&
          driver.stripeAccountId
        ) {
          const amountCents = Math.round((delivery.price ?? 0) * 100);
          // Deduct only the Stripe CC processing fee (2.9% + $0.30)
          const stripeFee = Math.round(amountCents * STRIPE_FEE_PERCENT) + STRIPE_FEE_FIXED_CENTS;
          const transferAmount = amountCents - stripeFee;

          try {
            const transfer = await stripe.transfers.create({
              amount: transferAmount,
              currency: "usd",
              destination: driver.stripeAccountId,
              transfer_group: delivery.id,
              metadata: {
                deliveryId: delivery.id,
                driverId: driver.id,
                stripeFee: stripeFee.toString(),
              },
            });

            updateData.transferId = transfer.id;
            updateData.paymentStatus = "TRANSFERRED";
            updateData.platformFee = stripeFee / 100;
          } catch (transferError) {
            console.error("Transfer to driver failed:", transferError);
            // Don't block delivery completion — mark for manual resolution
            updateData.paymentStatus = "PAID"; // stays as PAID, admin resolves
          }
        }
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

      // Fire-and-forget: send status notification emails
      const statusCustomer = await db.user.findUnique({ where: { id: delivery.customerId } });
      if (status === DeliveryStatus.PICKED_UP && statusCustomer?.email) {
        sendDeliveryPickedUp(statusCustomer.email, delivery.title);
      }
      if (status === DeliveryStatus.DELIVERED && statusCustomer?.email) {
        const driverUser = await db.user.findUnique({ where: { id: driver.userId } });
        sendDeliveryCompleted(
          statusCustomer.email,
          driverUser?.email ?? "",
          delivery.title,
          delivery.price ?? 0
        );
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

    // Refund if paid
    if (delivery.paymentIntentId && delivery.paymentStatus === "PAID") {
      try {
        await stripe.refunds.create({
          payment_intent: delivery.paymentIntentId,
        });
      } catch (refundError) {
        console.error("Refund on delete failed:", refundError);
      }
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
