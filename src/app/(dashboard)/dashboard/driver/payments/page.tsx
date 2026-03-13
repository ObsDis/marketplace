import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const paymentStatusColors: Record<string, string> = {
  TRANSFERRED: "bg-green-100 text-green-700",
  PAID: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-gray-100 text-gray-600",
  REFUNDED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function DriverPaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: {
        where: { status: "DELIVERED" },
        orderBy: { deliveredAt: "desc" },
        include: {
          customer: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!driver) redirect("/");

  const totalEarnings = driver.deliveries.reduce(
    (sum, d) => sum + (d.price ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your payout method and view disbursement history.
        </p>
      </div>

      {/* Stripe Connect Status */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Payout Account</h2>
        {driver.stripeAccountReady ? (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-4 w-4 text-green-600"
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
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Stripe account connected
                </p>
                <p className="text-xs text-gray-500">
                  Payouts are automatically deposited to your bank account.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-medium text-amber-800">
                Connect your bank account to receive payouts
              </p>
              <p className="mt-1 text-xs text-amber-600">
                You need to set up a Stripe account to receive payments for
                completed deliveries.
              </p>
              <a
                href="/api/stripe/connect"
                className="mt-3 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                Connect Bank Account
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Earnings
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Deliveries Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {driver.deliveries.length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Avg per Delivery
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {driver.deliveries.length > 0
              ? formatCurrency(totalEarnings / driver.deliveries.length)
              : "$0.00"}
          </p>
        </div>
      </div>

      {/* Disbursement History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Disbursement History
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {driver.deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">No disbursements yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {driver.deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {d.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.customer.name || d.customer.email}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(d.price ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColors[d.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                      >
                        {d.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.deliveredAt ? formatDate(d.deliveredAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
