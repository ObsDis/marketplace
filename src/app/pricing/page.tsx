import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            No commissions. No hidden fees. Drivers set their own prices and
            keep everything minus credit card processing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Shippers / Customers */}
          <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Shippers
              </h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">Free</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                No fees to post deliveries
              </p>
            </div>

            <ul className="space-y-3">
              {[
                "Post unlimited delivery requests",
                "Set your own budget",
                "Choose from available drivers",
                "Real-time delivery tracking",
                "Secure payment processing",
                "Rate and review drivers",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="mt-8 block w-full rounded-lg border-2 border-orange-600 py-3 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Get Started Free
            </Link>
          </div>

          {/* Drivers */}
          <div className="relative rounded-2xl border-2 border-orange-500 bg-white p-8 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-orange-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Drivers
              </h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-lg text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Flat monthly subscription &mdash; no commissions
              </p>
            </div>

            <ul className="space-y-3">
              {[
                "Set your own delivery prices",
                "Keep 100% of earnings minus CC fees",
                "Only 2.9% + $0.30 per transaction",
                "Unlimited delivery jobs",
                "Build your reputation with reviews",
                "Manage your own schedule",
                "Cancel anytime",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="mt-8 block w-full rounded-lg bg-orange-600 py-3 text-center text-sm font-semibold text-white shadow transition hover:bg-orange-500"
            >
              Start Driving
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                1
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                Customer Posts a Delivery
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Describe your package, set pickup and dropoff locations, and
                choose a price.
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                2
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                Driver Accepts the Job
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Subscribed drivers browse available jobs and accept the ones
                that work for them.
              </p>
            </div>
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                3
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                Deliver &amp; Get Paid
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete the delivery and funds are transferred directly to your
                account.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-sm font-semibold text-gray-900">
                Why do drivers pay a subscription instead of per-delivery commissions?
              </dt>
              <dd className="mt-1 text-sm text-gray-600">
                Traditional platforms take 20-30% of every delivery. Our flat
                $99/month means the more you deliver, the more you keep. High-volume
                drivers save thousands compared to commission-based platforms.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-900">
                What are the credit card processing fees?
              </dt>
              <dd className="mt-1 text-sm text-gray-600">
                Standard Stripe processing: 2.9% + $0.30 per transaction. That&apos;s
                it. On a $100 delivery, you keep $96.80.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-900">
                Can I cancel my driver subscription?
              </dt>
              <dd className="mt-1 text-sm text-gray-600">
                Yes, cancel anytime with no penalties. Your subscription runs
                until the end of the billing period.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-900">
                How do I get paid as a driver?
              </dt>
              <dd className="mt-1 text-sm text-gray-600">
                Payments are held securely when a customer books. Once you
                complete the delivery, funds are transferred directly to your
                connected bank account.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
