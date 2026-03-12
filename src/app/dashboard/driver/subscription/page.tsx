export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import {
  SubscribeButton,
  ManageSubscriptionButton,
  UpdatePaymentButton,
} from "./subscription-actions";

const sidebarLinks = [
  { href: "/dashboard/driver", label: "Overview" },
  { href: "/dashboard/driver/deliveries", label: "My Deliveries" },
  { href: "/marketplace", label: "Available Jobs" },
  { href: "/dashboard/driver/settings", label: "Settings" },
  { href: "/dashboard/driver/subscription", label: "Subscription" },
];

const subStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const benefits = [
  "Unlimited access to delivery jobs",
  "No per-delivery commissions",
  "Priority job matching",
  "In-app route optimization",
  "24/7 driver support",
  "Weekly direct deposit payouts",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "DRIVER") redirect("/");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: {
        where: { status: "DELIVERED" },
        select: { price: true },
      },
    },
  });

  if (!driver) redirect("/");

  // Fetch Stripe subscription details if active
  let currentPeriodEnd: Date | null = null;
  if (driver.subscriptionId && driver.subscriptionStatus === "ACTIVE") {
    try {
      const sub = await stripe.subscriptions.retrieve(driver.subscriptionId);
      currentPeriodEnd = new Date(sub.current_period_end * 1000);
    } catch {
      // If subscription can't be fetched, just skip
    }
  }

  const totalEarnings = driver.deliveries.reduce((sum, d) => sum + d.price, 0);
  const status = driver.subscriptionStatus;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1 rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Driver Dashboard
            </div>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  link.href === "/dashboard/driver/subscription"
                    ? "bg-orange-50 text-orange-700"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subscription
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your driver subscription plan.
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${subStatusColors[status] || "bg-gray-100 text-gray-700"}`}
            >
              {status}
            </span>
          </div>

          {/* PAST_DUE Warning Banner */}
          {status === "PAST_DUE" && (
            <div className="mt-6 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800">
                    Payment Past Due
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Your last payment failed. Please update your payment method
                    to continue accessing delivery jobs.
                  </p>
                  <div className="mt-4">
                    <UpdatePaymentButton />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE Subscription */}
          {status === "ACTIVE" && (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Your subscription is active
                    </h2>
                    <p className="text-sm text-gray-500">
                      Driver Pro Plan &mdash; $99.99/month
                    </p>
                  </div>
                </div>

                {currentPeriodEnd && (
                  <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-600">
                      Next billing date:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatDate(currentPeriodEnd)}
                      </span>
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <ManageSubscriptionButton />
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Earnings Summary
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-orange-600">
                      Total Earnings
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(totalEarnings)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-orange-600">
                      Deliveries Completed
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {driver.deliveries.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-orange-600">
                      Avg per Delivery
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {driver.deliveries.length > 0
                        ? formatCurrency(totalEarnings / driver.deliveries.length)
                        : "$0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INACTIVE / CANCELLED - Show pricing and subscribe */}
          {(status === "INACTIVE" || status === "CANCELLED") && (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl border-2 border-orange-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Driver Pro Plan
                  </h2>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                      $99.99
                    </span>
                    <span className="text-lg font-medium text-gray-500">
                      /month
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Everything you need to deliver and earn.
                  </p>
                </div>

                <ul className="mt-8 space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 text-center">
                  <SubscribeButton />
                  <p className="mt-3 text-xs text-gray-400">
                    Cancel anytime. No long-term contracts.
                  </p>
                </div>
              </div>

              {status === "CANCELLED" && (
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Your subscription was cancelled. Subscribe again to regain
                    access to delivery jobs.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
