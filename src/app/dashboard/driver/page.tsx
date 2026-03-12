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

const sidebarLinks = [
  { href: "/dashboard/driver", label: "Overview" },
  { href: "/dashboard/driver/deliveries", label: "My Deliveries" },
  { href: "/marketplace", label: "Available Jobs" },
  { href: "/dashboard/driver/settings", label: "Settings" },
  { href: "/dashboard/driver/subscription", label: "Subscription" },
];

export default async function DriverDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "DRIVER") redirect("/");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: { orderBy: { createdAt: "desc" }, take: 10 },
      reviews: true,
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1 rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Driver Dashboard
            </div>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {driver.displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s your driver overview.
          </p>

          {/* Subscription Banner */}
          {driver.subscriptionStatus === "INACTIVE" && (
            <div className="mt-6 rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
              <h3 className="text-lg font-bold text-orange-800">
                Subscribe to Start Accepting Deliveries
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                Get unlimited access to delivery jobs for just $99.99/month. No
                commissions, no hidden fees.
              </p>
              <Link
                href="/dashboard/driver/subscription"
                className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
              >
                Subscribe for $99.99/mo
              </Link>
            </div>
          )}

          {/* Overview Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subscription Status */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Subscription
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${subStatusColors[driver.subscriptionStatus] || "bg-gray-100 text-gray-700"}`}
                >
                  {driver.subscriptionStatus}
                </span>
              </div>
            </div>

            {/* Total Deliveries */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Deliveries Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {driver.totalDeliveries}
              </p>
            </div>

            {/* Average Rating */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
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

            {/* Available Toggle */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Availability
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex h-3 w-3 rounded-full ${driver.available ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-sm font-semibold text-gray-900">
                  {driver.available ? "Available" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Deliveries */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">
              Active Deliveries
            </h2>
            {activeDeliveries.length === 0 ? (
              <div className="mt-4 rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  No active deliveries right now.
                </p>
                <Link
                  href="/marketplace"
                  className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-500"
                >
                  Browse available jobs
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {activeDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {delivery.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {delivery.pickupCity}, {delivery.pickupState} &rarr;{" "}
                        {delivery.dropoffCity}, {delivery.dropoffState}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[delivery.status]}`}
                      >
                        {delivery.status.replace("_", " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(delivery.price)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(delivery.createdAt)}
                      </span>
                      <Link
                        href={`/deliveries/${delivery.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
            >
              Browse Available Jobs
            </Link>
            <Link
              href="/dashboard/driver/settings"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Update Profile
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
