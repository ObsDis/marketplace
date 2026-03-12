import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const merchant = await db.merchant.findUnique({
    where: { userId: session.user.id },
    include: {
      products: true,
      shipments: true,
      brokerageListings: true,
      rideConfig: true,
      reviews: true,
    },
  });

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Not a Merchant
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have a merchant account yet. Sign up to start selling
            on our marketplace.
          </p>
          <Link
            href="/merchant/signup"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Become a Merchant
          </Link>
        </div>
      </div>
    );
  }

  const totalItems =
    merchant.industry === "ECOMMERCE"
      ? merchant.products.length
      : merchant.industry === "LOGISTICS"
        ? merchant.shipments.length
        : merchant.industry === "BROKERAGE"
          ? merchant.brokerageListings.length
          : 0;

  const itemLabel =
    merchant.industry === "ECOMMERCE"
      ? "Products"
      : merchant.industry === "LOGISTICS"
        ? "Shipments"
        : merchant.industry === "BROKERAGE"
          ? "Listings"
          : "Items";

  const avgRating =
    merchant.reviews.length > 0
      ? (
          merchant.reviews.reduce((sum, r) => sum + r.rating, 0) /
          merchant.reviews.length
        ).toFixed(1)
      : "N/A";

  const statusColor =
    merchant.subscriptionStatus === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : merchant.subscriptionStatus === "PAST_DUE"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  const sidebarLinks = [
    { label: "Overview", href: "/dashboard/merchant", show: true },
    {
      label: "Products",
      href: "/dashboard/merchant/products",
      show: merchant.industry === "ECOMMERCE",
    },
    {
      label: "Shipments",
      href: "/dashboard/merchant/shipments",
      show: merchant.industry === "LOGISTICS",
    },
    {
      label: "Ride Config",
      href: "/dashboard/merchant/ride-config",
      show: merchant.industry === "RIDESHARE",
    },
    {
      label: "Listings",
      href: "/dashboard/merchant/listings",
      show: merchant.industry === "BROKERAGE",
    },
    { label: "Subscription", href: "/dashboard/merchant/subscription", show: true },
    { label: "Settings", href: "/dashboard/merchant/settings", show: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900">
              {merchant.businessName}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {merchant.industry.toLowerCase()} merchant
            </p>
          </div>
          <nav className="space-y-1">
            {sidebarLinks
              .filter((link) => link.show)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {session.user.name || "Merchant"}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Subscription
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}
              >
                {merchant.subscriptionStatus}
              </span>
            </div>

            {/* Industry */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Industry</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {merchant.industry.toLowerCase()}
              </p>
            </div>

            {/* Total Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Total {itemLabel}
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {avgRating}{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({merchant.reviews.length} reviews)
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              {merchant.industry === "ECOMMERCE" && (
                <Link
                  href="/dashboard/merchant/products"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Manage Products
                </Link>
              )}
              {merchant.industry === "LOGISTICS" && (
                <Link
                  href="/dashboard/merchant/shipments"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Manage Shipments
                </Link>
              )}
              {merchant.industry === "RIDESHARE" && (
                <Link
                  href="/dashboard/merchant/ride-config"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Configure Rides
                </Link>
              )}
              {merchant.industry === "BROKERAGE" && (
                <Link
                  href="/dashboard/merchant/listings"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Manage Listings
                </Link>
              )}
              <Link
                href="/dashboard/merchant/settings"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Manage Subscription */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {merchant.subscriptionStatus === "ACTIVE"
                ? "Your subscription is active. You have full access to all merchant features."
                : "Subscribe to unlock all merchant features and start selling."}
            </p>
            {merchant.subscriptionStatus === "ACTIVE" ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                Active Subscription
              </span>
            ) : (
              <a
                href="/api/stripe/create-checkout"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Manage Subscription
              </a>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
