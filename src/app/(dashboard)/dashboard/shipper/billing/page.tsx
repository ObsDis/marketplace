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
  PAID: "bg-green-100 text-green-700",
  TRANSFERRED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-gray-100 text-gray-600",
  REFUNDED: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function ShipperBillingPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const deliveries = await db.delivery.findMany({
    where: {
      customerId: session.user.id,
      status: "DELIVERED",
    },
    orderBy: { deliveredAt: "desc" },
    include: {
      driver: { select: { displayName: true } },
    },
  });

  const totalSpent = deliveries.reduce((sum, d) => sum + (d.price ?? 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = deliveries
    .filter((d) => d.deliveredAt && new Date(d.deliveredAt) >= startOfMonth)
    .reduce((sum, d) => sum + (d.price ?? 0), 0);

  const avgPerDelivery =
    deliveries.length > 0 ? totalSpent / deliveries.length : 0;

  const stats = [
    { label: "Total Spent", value: formatCurrency(totalSpent) },
    { label: "This Month", value: formatCurrency(thisMonth) },
    { label: "Avg per Delivery", value: formatCurrency(avgPerDelivery) },
    { label: "Deliveries Paid", value: deliveries.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your payment history and spending summary.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Payment History
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">No payments yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Driver
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
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {d.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.driver?.displayName || "—"}
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
