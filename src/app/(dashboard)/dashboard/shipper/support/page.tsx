import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "How do I post a delivery?",
    a: 'Go to "Create Shipment" in the sidebar. Fill in the pickup and dropoff details, package info, and submit. Drivers will start sending you quotes.',
  },
  {
    q: "How does pricing work?",
    a: "Drivers set their own rates. When you post a shipment, available drivers will send you quotes. You choose the one that works best for you — there are no hidden fees.",
  },
  {
    q: "Can I cancel a delivery?",
    a: "Yes. You can cancel a delivery at any time before it is picked up. If payment was already made, a refund will be processed automatically.",
  },
  {
    q: "How do I pay for a delivery?",
    a: "Once you accept a driver's quote, you'll be prompted to pay via credit card. Payment is held securely and only released to the driver upon delivery.",
  },
  {
    q: "What if my package is damaged?",
    a: "Contact our support team immediately with photos and details. We will work with the driver and facilitate a resolution.",
  },
  {
    q: "How do I rate a driver?",
    a: "After a delivery is completed, you'll be prompted to leave a rating. You can rate the driver on performance, communication, and timeliness.",
  },
];

export default async function ShipperSupportPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;re here to help. Reach out anytime.
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
