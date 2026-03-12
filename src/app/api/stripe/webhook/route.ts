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
        const merchantId = session.metadata?.merchantId;

        if (merchantId && session.subscription) {
          await db.merchant.update({
            where: { id: merchantId },
            data: {
              subscriptionId: session.subscription as string,
              subscriptionStatus: "ACTIVE",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const merchant = await db.merchant.findUnique({
          where: { subscriptionId: subscription.id },
        });

        if (merchant) {
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

          await db.merchant.update({
            where: { id: merchant.id },
            data: { subscriptionStatus },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const merchant = await db.merchant.findUnique({
          where: { subscriptionId: subscription.id },
        });

        if (merchant) {
          await db.merchant.update({
            where: { id: merchant.id },
            data: { subscriptionStatus: "CANCELLED" },
          });
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const merchantId = account.metadata?.merchantId;

        if (merchantId && account.charges_enabled && account.payouts_enabled) {
          await db.merchant.update({
            where: { id: merchantId },
            data: { stripeAccountReady: true },
          });
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
