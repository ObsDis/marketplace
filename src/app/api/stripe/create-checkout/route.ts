import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MERCHANT") {
      return NextResponse.json(
        { error: "Only merchants can subscribe" },
        { status: 403 }
      );
    }

    const merchant = await db.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant profile not found" },
        { status: 404 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/merchant?subscription=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/merchant?subscription=cancelled`,
      customer_email: session.user.email!,
      metadata: {
        merchantId: merchant.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
