import Link from "next/link";
import { Check } from "lucide-react";

export default function ForDriversPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Drive With Sprint Cargo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Keep 100% of your earnings. Set your own prices. Work on your
            schedule. All for a flat $99.99/month.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-block rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
          >
            Start Driving Today
          </Link>
        </div>

        {/* Comparison */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Sprint Cargo vs. Traditional Platforms
          </h2>
          <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left font-medium text-gray-500" />
                  <th className="px-6 py-4 text-center font-semibold text-orange-600">
                    Sprint Cargo
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-gray-500">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Commission per delivery", "0%", "20–30%"],
                  ["Monthly cost", "$99.99", "Free*"],
                  ["Set your own prices", "Yes", "No"],
                  ["$500 delivery earnings", "You keep $485.20", "You keep ~$375"],
                  ["$2,000/month earnings", "You keep $1,900+", "You keep ~$1,500"],
                  ["Cancel anytime", "Yes", "Varies"],
                ].map(([label, us, them]) => (
                  <tr key={label}>
                    <td className="px-6 py-3 text-gray-700">{label}</td>
                    <td className="px-6 py-3 text-center font-medium text-gray-900">
                      {us}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-500">
                      {them}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-400 text-center">
            * &quot;Free&quot; platforms take 20–30% of every delivery instead.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Why Drivers Choose Us
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Keep What You Earn",
                desc: "No commissions. The only deduction is the standard credit card processing fee (2.9% + $0.30 per transaction).",
              },
              {
                title: "Set Your Own Prices",
                desc: "You decide what a delivery is worth. Accept jobs that make sense for your time and route.",
              },
              {
                title: "Flexible Schedule",
                desc: "Work when you want. Go online when you're available, go offline when you're not. No minimums.",
              },
              {
                title: "Direct Payouts",
                desc: "Funds transfer directly to your bank account via Stripe as soon as you complete a delivery.",
              },
              {
                title: "Build Your Reputation",
                desc: "Earn reviews from satisfied customers. Higher ratings mean more job opportunities.",
              },
              {
                title: "No Long-Term Contracts",
                desc: "Month-to-month subscription. Cancel anytime with no penalties or hidden fees.",
              },
            ].map((b) => (
              <div key={b.title} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Requirements
          </h2>
          <div className="mx-auto mt-8 max-w-lg rounded-xl bg-white p-6 shadow-sm">
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                "Valid driver's license",
                "Cargo van or suitable delivery vehicle",
                "Valid vehicle insurance",
                "Smartphone with internet access",
                "Ability to lift packages (varies by job)",
              ].map((req) => (
                <li key={req} className="flex items-center gap-3">
                  <Check className="h-4 w-4 flex-shrink-0 text-orange-500" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to Start Earning?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up in minutes. Start accepting deliveries today.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
            >
              Sign Up as a Driver
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
