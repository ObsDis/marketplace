export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 12, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using Sprint Cargo (&quot;the Platform&quot;), you
              agree to be bound by these Terms of Service. If you do not agree,
              do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. Description of Service
            </h2>
            <p className="mt-2">
              Sprint Cargo is a marketplace that connects customers who need
              deliveries (&quot;Shippers&quot;) with independent delivery
              drivers (&quot;Drivers&quot;). Sprint Cargo does not itself
              provide delivery services — Drivers are independent contractors,
              not employees of Sprint Cargo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. User Accounts
            </h2>
            <p className="mt-2">
              You must provide accurate information when creating an account.
              You are responsible for maintaining the security of your account
              credentials. You must be at least 18 years old to use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Driver Subscriptions
            </h2>
            <p className="mt-2">
              Drivers must maintain an active subscription ($99.99/month) to
              accept deliveries. Subscriptions renew automatically and can be
              cancelled at any time. Cancellation takes effect at the end of
              the current billing period. No refunds are provided for partial
              billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Payments & Fees
            </h2>
            <p className="mt-2">
              Shippers pay the delivery price upfront. Funds are held until the
              delivery is confirmed complete, then transferred to the Driver
              minus standard credit card processing fees (2.9% + $0.30 per
              transaction). Sprint Cargo does not charge commissions on
              deliveries. If a delivery is cancelled before a Driver accepts,
              the Shipper receives a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Driver Responsibilities
            </h2>
            <p className="mt-2">
              Drivers are independent contractors responsible for their own
              vehicle, insurance, licensing, and compliance with local laws.
              Drivers agree to handle all packages with care and complete
              accepted deliveries in a timely manner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. Limitation of Liability
            </h2>
            <p className="mt-2">
              Sprint Cargo acts solely as a marketplace connecting Shippers and
              Drivers. We are not liable for damage to or loss of packages,
              personal injury, or any disputes between Shippers and Drivers.
              Our total liability is limited to the subscription fees paid in
              the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              8. Termination
            </h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate accounts that
              violate these terms, engage in fraudulent activity, or receive
              repeated negative reviews.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              9. Changes to Terms
            </h2>
            <p className="mt-2">
              We may update these terms at any time. Continued use of the
              Platform after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              10. Contact
            </h2>
            <p className="mt-2">
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:support@sprintcargo.com"
                className="text-orange-600 hover:text-orange-500"
              >
                support@sprintcargo.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
