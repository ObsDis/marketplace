import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "MERCHANT") {
      return NextResponse.json(
        { error: "Only merchants can connect Stripe accounts" },
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

    let stripeAccountId = merchant.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: session.user.email!,
        metadata: {
          merchantId: merchant.id,
        },
      });

      stripeAccountId = account.id;

      await db.merchant.update({
        where: { id: merchant.id },
        data: { stripeAccountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/merchant?stripe=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/merchant?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe Connect account link:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account link" },
      { status: 500 }
    );
  }
}
