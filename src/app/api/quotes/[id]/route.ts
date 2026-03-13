import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const actionSchema = z.object({
  action: z.enum(["accept", "decline", "counter", "accept_counter", "decline_counter", "withdraw"]),
  counterAmount: z.number().positive().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = actionSchema.parse(body);

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        delivery: { select: { customerId: true, status: true, title: true } },
        driver: { select: { userId: true, displayName: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const isShipper = session.user.id === quote.delivery.customerId;
    const isQuoteDriver = session.user.id === quote.driver.userId;

    switch (parsed.action) {
      // ─── Shipper accepts a quote — creates Stripe Checkout ─
      case "accept": {
        if (!isShipper) {
          return NextResponse.json({ error: "Only the shipper can accept" }, { status: 403 });
        }
        if (quote.delivery.status !== "POSTED") {
          return NextResponse.json({ error: "Delivery no longer accepting quotes" }, { status: 400 });
        }

        // Determine the final price
        const finalPrice =
          quote.counterStatus === "ACCEPTED" && quote.counterAmount
            ? quote.counterAmount
            : quote.amount;

        const amountCents = Math.round(finalPrice * 100);

        // Create Stripe Checkout Session for payment
        const checkoutSession = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Delivery: ${quote.delivery.title}`,
                  description: `Driver: ${quote.driver.displayName}`,
                },
                unit_amount: amountCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            quoteId: id,
            deliveryId: quote.deliveryId,
            driverId: quote.driverId,
            finalPrice: String(finalPrice),
          },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/deliveries/${quote.deliveryId}?payment=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/deliveries/${quote.deliveryId}?payment=cancelled`,
        });

        return NextResponse.json({
          success: true,
          checkoutUrl: checkoutSession.url,
          price: finalPrice,
        });
      }

      // ─── Shipper declines a specific quote ────────────────
      case "decline": {
        if (!isShipper) {
          return NextResponse.json({ error: "Only the shipper can decline" }, { status: 403 });
        }

        const updated = await db.quote.update({
          where: { id },
          data: { status: "DECLINED" },
        });

        return NextResponse.json(updated);
      }

      // ─── Shipper sends counter-offer ──────────────────────
      case "counter": {
        if (!isShipper) {
          return NextResponse.json({ error: "Only the shipper can counter" }, { status: 403 });
        }
        if (!parsed.counterAmount) {
          return NextResponse.json({ error: "counterAmount required" }, { status: 400 });
        }
        if (quote.negotiationRound >= 2) {
          return NextResponse.json({ error: "Maximum negotiation rounds reached" }, { status: 400 });
        }
        if (quote.status !== "PENDING") {
          return NextResponse.json({ error: "Can only counter pending quotes" }, { status: 400 });
        }

        const updated = await db.quote.update({
          where: { id },
          data: {
            status: "COUNTERED",
            counterAmount: parsed.counterAmount,
            counterStatus: "PENDING",
            negotiationRound: quote.negotiationRound + 1,
          },
        });

        return NextResponse.json(updated);
      }

      // ─── Driver accepts counter-offer ─────────────────────
      case "accept_counter": {
        if (!isQuoteDriver) {
          return NextResponse.json({ error: "Only the quoting driver can respond" }, { status: 403 });
        }
        if (quote.counterStatus !== "PENDING") {
          return NextResponse.json({ error: "No pending counter-offer" }, { status: 400 });
        }

        const updated = await db.quote.update({
          where: { id },
          data: {
            counterStatus: "ACCEPTED",
            amount: quote.counterAmount!, // update amount to the agreed price
            status: "PENDING", // back to pending for shipper to formally accept
          },
        });

        return NextResponse.json(updated);
      }

      // ─── Driver declines counter-offer (holds firm) ───────
      case "decline_counter": {
        if (!isQuoteDriver) {
          return NextResponse.json({ error: "Only the quoting driver can respond" }, { status: 403 });
        }
        if (quote.counterStatus !== "PENDING") {
          return NextResponse.json({ error: "No pending counter-offer" }, { status: 400 });
        }

        const updated = await db.quote.update({
          where: { id },
          data: {
            counterStatus: "DECLINED",
            status: "PENDING", // driver holds firm at original price
          },
        });

        return NextResponse.json(updated);
      }

      // ─── Driver withdraws their quote ─────────────────────
      case "withdraw": {
        if (!isQuoteDriver) {
          return NextResponse.json({ error: "Only the quoting driver can withdraw" }, { status: 403 });
        }

        const updated = await db.quote.update({
          where: { id },
          data: { status: "WITHDRAWN" },
        });

        return NextResponse.json(updated);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Error processing quote action:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
