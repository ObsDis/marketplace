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

const subStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function DriverDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: { orderBy: { createdAt: "desc" }, take: 10 },
      reviews: true,
      rateCard: true,
    },
  });

  if (!driver) redirect("/");

  const activeDeliveries = driver.deliveries.filter(
    (d) => d.status !== "DELIVERED" && d.status !== "CANCELLED"
  );

  const avgRating =
    driver.reviews.length > 0
      ? driver.reviews.reduce((sum, r) => sum + r.rating, 0) /
        driver.reviews.length
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {driver.displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s your driver overview.
        </p>
      </div>

      {/* Subscription Banner */}
      {driver.subscriptionStatus === "INACTIVE" && (
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6">
          <h2 className="text-lg font-bold text-orange-800">
            Subscribe to Start Accepting Deliveries
          </h2>
          <p className="mt-1 text-sm text-orange-700">
            Get unlimited access to delivery jobs for just $99/month. No
            commissions, no hidden fees.
          </p>
          <Link
            href="/dashboard/driver/subscription"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Subscribe for $99/mo
          </Link>
        </div>
      )}

      {/* Rate Card Banner */}
      {!driver.rateCard && driver.subscriptionStatus === "ACTIVE" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-800">
            Set Up Your Rate Card
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            You need a rate card so shippers can see your pricing. Takes about 2
            minutes.
          </p>
          <Link
            href="/dashboard/driver/rate-card"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Set Up Pricing
          </Link>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Subscription
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${subStatusColors[driver.subscriptionStatus] || "bg-gray-100 text-gray-600"}`}
            >
              {driver.subscriptionStatus}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Deliveries Completed
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {driver.totalDeliveries}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Average Rating
          </p>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
            </span>
            {avgRating > 0 && (
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(avgRating) ? "fill-current" : "fill-gray-200"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Availability
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${driver.available ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-sm font-medium text-gray-900">
              {driver.available ? "Available" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Active Deliveries
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {activeDeliveries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                No active deliveries right now.
              </p>
              <Link
                href="/dashboard/driver/bids"
                className="mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-500"
              >
                Browse available jobs
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Delivery
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
                {activeDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {delivery.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {delivery.pickupCity}, {delivery.pickupState} &rarr;{" "}
                      {delivery.dropoffCity}, {delivery.dropoffState}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[delivery.status]}`}
                      >
                        {delivery.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(delivery.price ?? 0)}
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/driver/bids"
          className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500"
        >
          Browse Available Jobs
        </Link>
        <Link
          href="/dashboard/driver/settings"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Update Profile
        </Link>
      </div>
    </div>
  );
}
