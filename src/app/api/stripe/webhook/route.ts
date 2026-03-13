export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle driver subscription checkout
        if (session.metadata?.driverId && session.subscription) {
          await db.driver.update({
            where: { id: session.metadata.driverId },
            data: {
              subscriptionId: session.subscription as string,
              subscriptionStatus: "ACTIVE",
            },
          });
        }

        // Handle delivery payment checkout (quote accepted)
        if (session.metadata?.quoteId && session.metadata?.deliveryId) {
          const quoteId = session.metadata.quoteId;
          const deliveryId = session.metadata.deliveryId;
          const driverId = session.metadata.driverId;
          const finalPrice = parseFloat(session.metadata.finalPrice || "0");
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

          // Accept quote, decline others, assign driver, set price
          await db.$transaction([
            db.quote.update({
              where: { id: quoteId },
              data: { status: "ACCEPTED" },
            }),
            db.quote.updateMany({
              where: {
                deliveryId,
                id: { not: quoteId },
                status: { not: "WITHDRAWN" },
              },
              data: { status: "DECLINED" },
            }),
            db.delivery.update({
              where: { id: deliveryId },
              data: {
                status: "ACCEPTED",
                driverId: driverId || undefined,
                price: finalPrice,
                paymentIntentId: paymentIntentId || undefined,
                paymentStatus: "PAID",
              },
            }),
          ]);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const driver = await db.driver.findUnique({
          where: { subscriptionId: subscription.id },
        });

        if (driver) {
          let subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE";

          switch (subscription.status) {
            case "active":
              subscriptionStatus = "ACTIVE";
              break;
            case "past_due":
              subscriptionStatus = "PAST_DUE";
              break;
            case "canceled":
            case "unpaid":
              subscriptionStatus = "CANCELLED";
              break;
            default:
              subscriptionStatus = "INACTIVE";
          }

          await db.driver.update({
            where: { id: driver.id },
            data: { subscriptionStatus },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const driver = await db.driver.findUnique({
          where: { subscriptionId: subscription.id },
        });

        if (driver) {
          await db.driver.update({
            where: { id: driver.id },
            data: { subscriptionStatus: "CANCELLED" },
          });
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const driverId = account.metadata?.driverId;

        if (driverId && account.charges_enabled && account.payouts_enabled) {
          await db.driver.update({
            where: { id: driverId },
            data: { stripeAccountReady: true },
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        // Update delivery payment status if we have a matching record
        const delivery = await db.delivery.findUnique({
          where: { paymentIntentId: pi.id },
        });
        if (delivery && delivery.paymentStatus !== "TRANSFERRED") {
          await db.delivery.update({
            where: { id: delivery.id },
            data: { paymentStatus: "PAID" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const delivery = await db.delivery.findUnique({
          where: { paymentIntentId: pi.id },
        });
        if (delivery) {
          await db.delivery.update({
            where: { id: delivery.id },
            data: { paymentStatus: "FAILED" },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          const piId = typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent.id;
          const delivery = await db.delivery.findUnique({
            where: { paymentIntentId: piId },
          });
          if (delivery) {
            await db.delivery.update({
              where: { id: delivery.id },
              data: { paymentStatus: "REFUNDED" },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
