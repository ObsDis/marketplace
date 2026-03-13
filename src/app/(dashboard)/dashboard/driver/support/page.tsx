import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "How does the subscription work?",
    a: "For $99/month you get unlimited access to delivery jobs. No per-delivery commissions — you keep 100% of your earnings.",
  },
  {
    q: "How do I get paid?",
    a: "Connect your bank account via Stripe in Payment Settings. After each completed delivery, the payment is automatically transferred to your account.",
  },
  {
    q: "How do I set my rates?",
    a: "Go to Rate Card in the sidebar. Set your base rate, per-mile rate, and any size/weight surcharges. Your rates are used to auto-generate quotes for new deliveries.",
  },
  {
    q: "What if a shipper's post is inaccurate?",
    a: "If the actual package doesn't match the listing (wrong size, weight, etc.), contact support. You can also rate the shipper after delivery on accuracy.",
  },
  {
    q: "Can I cancel a delivery I accepted?",
    a: "You can cancel before pickup. After pickup, cancellation requires contacting support. Frequent cancellations may affect your rating.",
  },
  {
    q: "How do ratings work?",
    a: "After each delivery, both you and the shipper can leave ratings. Shippers rate you on performance, communication, and timeliness. Higher ratings help you win more bids.",
  },
];

export default async function DriverSupportPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;re here to help you succeed.
        </p>
      </div>

      {/* Contact Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Get in Touch</h2>
        <p className="mt-2 text-sm text-gray-500">
          For questions, issues, or feedback, email us at:
        </p>
        <a
          href="mailto:support@sprintcargo.com"
          className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:text-orange-500"
        >
          support@sprintcargo.com
        </a>
        <p className="mt-4 text-xs text-gray-400">
          We typically respond within 24 hours on business days.
        </p>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-semibold text-gray-900">{faq.q}</h3>
              <p className="mt-2 text-sm text-gray-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
