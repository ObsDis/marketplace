import Link from "next/link";

const customerSteps = [
  {
    step: 1,
    title: "Post Your Delivery",
    description:
      "Describe your package, enter pickup and dropoff addresses, upload photos, and set your budget. Our price estimator helps you find a fair price.",
  },
  {
    step: 2,
    title: "Pay Securely",
    description:
      "Your payment is processed and held securely. Funds are only released to the driver once your delivery is confirmed complete.",
  },
  {
    step: 3,
    title: "Driver Accepts",
    description:
      "Available drivers browse your delivery and accept the job. You'll be notified when a driver picks up your delivery.",
  },
  {
    step: 4,
    title: "Track & Receive",
    description:
      "Follow your delivery status in real-time. Once delivered, the driver is paid automatically and you can leave a review.",
  },
];

const driverSteps = [
  {
    step: 1,
    title: "Subscribe for $99.99/mo",
    description:
      "Sign up as a driver and activate your monthly subscription. No contracts — cancel anytime.",
  },
  {
    step: 2,
    title: "Connect Your Bank",
    description:
      "Set up Stripe Connect to receive direct payouts. Quick verification gets you earning fast.",
  },
  {
    step: 3,
    title: "Browse & Accept Jobs",
    description:
      "Browse the marketplace for available deliveries in your area. Accept the jobs that fit your schedule and route.",
  },
  {
    step: 4,
    title: "Deliver & Get Paid",
    description:
      "Pick up, deliver, and mark complete. Payment is transferred directly to your bank minus only the credit card fee (2.9% + $0.30).",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            How Sprint Cargo Works
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Simple, transparent delivery — from posting to payout.
          </p>
        </div>

        {/* For Customers */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            For Customers
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {customerSteps.map((s) => (
              <div key={s.step} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Drivers */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            For Drivers
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {driverSteps.map((s) => (
              <div key={s.step} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/auth/signup"
            className="inline-block rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
