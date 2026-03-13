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

export default async function DriverDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "DRIVER") redirect("/");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
  });
  if (!driver) redirect("/");

  const deliveries = await db.delivery.findMany({
    where: { driverId: driver.id },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const params = await searchParams;
  const filter = params.filter || "all";

  const filtered = deliveries.filter((d) => {
    if (filter === "active")
      return d.status !== "DELIVERED" && d.status !== "CANCELLED";
    if (filter === "completed") return d.status === "DELIVERED";
    return true;
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
        <p className="mt-1 text-sm text-gray-500">
          All your delivery history and active jobs.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/dashboard/driver/deliveries${tab.key === "all" ? "" : `?filter=${tab.key}`}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === tab.key
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">No deliveries found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {delivery.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {delivery.customer.name || delivery.customer.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {delivery.pickupCity} &rarr; {delivery.dropoffCity}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(delivery.price ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[delivery.status]}`}
                    >
                      {delivery.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(delivery.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/deliveries/${delivery.id}`}
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
  );
}
