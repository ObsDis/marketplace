import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          About Sprint Cargo
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We&apos;re building a fairer delivery marketplace — one where drivers
          keep what they earn.
        </p>

        <div className="mt-10 space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">Our Mission</h2>
            <p className="mt-3">
              Traditional delivery platforms take 20–30% of every delivery as
              commission. Sprint Cargo flips that model. Drivers pay a flat
              $99.99/month subscription and keep 100% of their delivery earnings
              minus standard credit card processing fees (2.9% + $0.30).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">How We&apos;re Different</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong>Zero commission</strong> — drivers set their own prices
                and keep what they charge.
              </li>
              <li>
                <strong>Transparent fees</strong> — the only deduction is
                standard Stripe credit card processing.
              </li>
              <li>
                <strong>Driver freedom</strong> — choose your own schedule,
                accept the jobs you want, work on your terms.
              </li>
              <li>
                <strong>Free for shippers</strong> — posting a delivery costs
                nothing. You only pay the delivery price.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">
              Built for Cargo Van Drivers
            </h2>
            <p className="mt-3">
              Sprint Cargo is purpose-built for cargo van delivery — from small
              packages to full pallets. Whether you&apos;re delivering furniture,
              appliances, building materials, or commercial freight, our platform
              connects you directly with customers who need reliable local and
              regional delivery.
            </p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
          >
            Get Started
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
