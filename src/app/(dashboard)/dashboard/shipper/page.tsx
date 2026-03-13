import { redirect } from "next/navigation";
import Link from "next/link";
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

const statusColors: Record<string, string> = {
  POSTED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-yellow-100 text-yellow-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ShipperOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const deliveries = await db.delivery.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      driver: { select: { displayName: true } },
      _count: { select: { quotes: true } },
    },
  });

  const active = deliveries.filter(
    (d) => !["DELIVERED", "CANCELLED"].includes(d.status)
  );
  const completed = deliveries.filter((d) => d.status === "DELIVERED");
  const totalSpent = completed.reduce((sum, d) => sum + (d.price ?? 0), 0);
  const pendingBids = deliveries.reduce((sum, d) => sum + d._count.quotes, 0);
  const recent = deliveries.slice(0, 10);

  const stats = [
    { label: "Active Shipments", value: active.length },
    { label: "Pending Bids", value: pendingBids },
    { label: "Completed", value: completed.length },
    { label: "Total Spent", value: formatCurrency(totalSpent) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name || "Shipper"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your shipments.
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

      {/* Recent Shipments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Shipments
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {recent.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                No shipments yet. Create your first one!
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {d.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {d.pickupCity} &rarr; {d.dropoffCity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[d.status]}`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {d.price ? formatCurrency(d.price) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/deliveries/${d.id}`}
                        className="text-sm font-medium text-orange-600 hover:text-orange-500"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/shipper/create"
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500"
        >
          Create Shipment
        </Link>
        <Link
          href="/dashboard/shipper/history"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          View History
        </Link>
      </div>
    </div>
  );
}
