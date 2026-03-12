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

    if (session.user.role !== "DRIVER") {
      return NextResponse.json(
        { error: "Only drivers can connect Stripe accounts" },
        { status: 403 }
      );
    }

    const driver = await db.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Driver profile not found" },
        { status: 404 }
      );
    }

    let stripeAccountId = driver.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: session.user.email!,
        metadata: {
          driverId: driver.id,
        },
      });

      stripeAccountId = account.id;

      await db.driver.update({
        where: { id: driver.id },
        data: { stripeAccountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/driver/settings?stripe=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/driver/settings?stripe=success`,
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
