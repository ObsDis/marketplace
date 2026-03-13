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

const subStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");

  const [totalUsers, totalDrivers, activeSubscriptions, totalDeliveries, completedDeliveries, recentDrivers] =
    await Promise.all([
      db.user.count(),
      db.driver.count(),
      db.driver.count({ where: { subscriptionStatus: "ACTIVE" } }),
      db.delivery.count(),
      db.delivery.count({ where: { status: "DELIVERED" } }),
      db.driver.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: true, _count: { select: { deliveries: true } } },
      }),
    ]);

  const mrr = activeSubscriptions * 99;
  const completionRate =
    totalDeliveries > 0
      ? ((completedDeliveries / totalDeliveries) * 100).toFixed(1)
      : "0";

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString() },
    { label: "Active Drivers", value: totalDrivers.toLocaleString() },
    { label: "Active Subscriptions", value: activeSubscriptions.toLocaleString() },
    { label: "MRR", value: formatCurrency(mrr) },
    { label: "Total Deliveries", value: totalDeliveries.toLocaleString() },
    { label: "Completion Rate", value: `${completionRate}%` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and management.
        </p>

        {/* Stats Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Drivers Table */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Recent Drivers</h2>
          <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Subscription
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Deliveries
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {driver.displayName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {driver.user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${subStatusColors[driver.subscriptionStatus] || "bg-gray-100 text-gray-700"}`}
                      >
                        {driver.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {driver._count.deliveries}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {driver.rating > 0 ? driver.rating.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(driver.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentDrivers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No drivers registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
