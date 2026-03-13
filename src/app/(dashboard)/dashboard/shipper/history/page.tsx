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

export default async function ShipperHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const deliveries = await db.delivery.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      driver: { select: { displayName: true } },
    },
  });

  const params = await searchParams;
  const filter = params.filter || "all";

  const filtered = deliveries.filter((d) => {
    if (filter === "active")
      return !["DELIVERED", "CANCELLED"].includes(d.status);
    if (filter === "completed") return d.status === "DELIVERED";
    if (filter === "cancelled") return d.status === "CANCELLED";
    return true;
  });

  const tabs = [
    { key: "all", label: "All", count: deliveries.length },
    {
      key: "active",
      label: "Active",
      count: deliveries.filter(
        (d) => !["DELIVERED", "CANCELLED"].includes(d.status)
      ).length,
    },
    {
      key: "completed",
      label: "Completed",
      count: deliveries.filter((d) => d.status === "DELIVERED").length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: deliveries.filter((d) => d.status === "CANCELLED").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipment History</h1>
        <p className="mt-1 text-sm text-gray-500">
          All your shipments in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/shipper/history${tab.key === "all" ? "" : `?filter=${tab.key}`}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">No shipments found.</p>
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
                  Driver
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
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {d.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {d.pickupCity} &rarr; {d.dropoffCity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {d.driver?.displayName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {d.price ? formatCurrency(d.price) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[d.status]}`}
                    >
                      {d.status.replace("_", " ")}
                    </span>
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
  );
}
