export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: March 12, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <p className="mt-2">We collect information you provide directly:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account information (name, email, phone number)</li>
              <li>Driver profile details (display name, vehicle info, service areas)</li>
              <li>Delivery details (addresses, package descriptions, photos)</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. How We Use Your Information
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Provide and improve our delivery marketplace service</li>
              <li>Process payments and transfers between Shippers and Drivers</li>
              <li>Send delivery status notifications and account updates</li>
              <li>Verify driver accounts and maintain platform safety</li>
              <li>Respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Payment Data
            </h2>
            <p className="mt-2">
              All payment processing is handled by Stripe. We do not store
              credit card numbers, CVVs, or full bank account details on our
              servers. Payment data is subject to{" "}
              <a
                href="https://stripe.com/privacy"
                className="text-orange-600 hover:text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Information Sharing
            </h2>
            <p className="mt-2">
              We share limited information between Shippers and Drivers to
              facilitate deliveries (e.g., pickup/dropoff addresses, contact
              info). We do not sell your personal information to third parties.
              We may share data with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Stripe — for payment processing</li>
              <li>Supabase — for authentication and data storage</li>
              <li>Law enforcement — when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              5. Data Security
            </h2>
            <p className="mt-2">
              We use industry-standard security measures including encrypted
              connections (TLS), secure authentication, and access controls.
              However, no system is 100% secure and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              6. Your Rights
            </h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              7. Cookies
            </h2>
            <p className="mt-2">
              We use essential cookies for authentication and session management.
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              8. Contact
            </h2>
            <p className="mt-2">
              For privacy questions or data requests, contact us at{" "}
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
