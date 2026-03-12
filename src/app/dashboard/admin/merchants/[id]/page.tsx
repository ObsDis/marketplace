import { getServerSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  ShieldCheck,
  Star,
  Package,
  Truck,
  Car,
  Briefcase,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMerchantDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const merchant = await db.merchant.findUnique({
    where: { id },
    include: {
      user: true,
      products: true,
      shipments: true,
      brokerageListings: true,
      rideConfig: true,
      reviews: { include: { user: true } },
    },
  });

  if (!merchant) {
    notFound();
  }

  const avgRating =
    merchant.reviews.length > 0
      ? (
          merchant.reviews.reduce((sum, r) => sum + r.rating, 0) /
          merchant.reviews.length
        ).toFixed(1)
      : null;

  function subStatusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAST_DUE":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const industryIcon = {
    ECOMMERCE: Package,
    LOGISTICS: Truck,
    RIDESHARE: Car,
    BROKERAGE: Briefcase,
  }[merchant.industry];
  const IndustryIcon = industryIcon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin/merchants"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Merchants
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Store className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {merchant.businessName}
                </h1>
                <p className="text-gray-500 mt-0.5 capitalize">
                  {merchant.industry.toLowerCase()} merchant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {merchant.verified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  <ShieldCheck className="h-4 w-4" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                  <Shield className="h-4 w-4" />
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{merchant.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">
                      {merchant.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">
                      {merchant.address
                        ? `${merchant.address}, ${merchant.city}, ${merchant.state} ${merchant.zip}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IndustryIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Industry
                    </p>
                    <p className="text-sm text-gray-900 capitalize">
                      {merchant.industry.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
              {merchant.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">{merchant.description}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                Joined {formatDate(merchant.createdAt)}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant.products.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Products</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant.shipments.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Shipments</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant.brokerageListings.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Listings</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant.reviews.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Reviews</p>
                </div>
              </div>
              {avgRating && (
                <div className="mt-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-semibold text-gray-900">
                    {avgRating}
                  </span>
                  <span className="text-sm text-gray-500">
                    average rating ({merchant.reviews.length} review
                    {merchant.reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Ride Config (if applicable) */}
            {merchant.rideConfig && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ride Configuration
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Base Fare
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(merchant.rideConfig.baseFare)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Per Mile
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(merchant.rideConfig.perMileRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Per Minute
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(merchant.rideConfig.perMinRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Surge Multiplier
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {merchant.rideConfig.surgeMultiplier}x
                    </p>
                  </div>
                </div>
                {merchant.rideConfig.serviceArea && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500">
                      Service Area
                    </p>
                    <p className="text-sm text-gray-700">
                      {merchant.rideConfig.serviceArea}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Reviews */}
            {merchant.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews
                </h2>
                <div className="space-y-4">
                  {merchant.reviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {review.user.name || review.user.email}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Subscription Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subscription
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${subStatusBadge(merchant.subscriptionStatus)}`}
                  >
                    {merchant.subscriptionStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <span className="text-sm font-medium text-gray-900">
                    $99/month
                  </span>
                </div>
                {merchant.subscriptionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Subscription ID
                    </span>
                    <span className="text-xs font-mono text-gray-700 truncate max-w-[160px]">
                      {merchant.subscriptionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stripe Connect */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stripe Connect
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {merchant.stripeAccountReady ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500">
                      <XCircle className="h-4 w-4" />
                      Not Connected
                    </span>
                  )}
                </div>
                {merchant.stripeAccountId && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Account ID</span>
                      <span className="text-xs font-mono text-gray-700 truncate max-w-[160px]">
                        {merchant.stripeAccountId}
                      </span>
                    </div>
                    <a
                      href={`https://dashboard.stripe.com/connect/accounts/${merchant.stripeAccountId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View in Stripe Dashboard
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <form
                  action={async () => {
                    "use server";
                    const { getServerSession: getSession } = await import(
                      "@/lib/auth"
                    );
                    const { redirect: serverRedirect } = await import(
                      "next/navigation"
                    );
                    const { db: database } = await import("@/lib/db");

                    const sess = await getSession();
                    if (!sess?.user || sess.user.role !== "ADMIN") {
                      serverRedirect("/");
                    }

                    await database.merchant.update({
                      where: { id },
                      data: { verified: !merchant.verified },
                    });

                    serverRedirect(`/dashboard/admin/merchants/${id}`);
                  }}
                >
                  <button
                    type="submit"
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      merchant.verified
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {merchant.verified ? (
                      <>
                        <Shield className="h-4 w-4" />
                        Revoke Verification
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify Merchant
                      </>
                    )}
                  </button>
                </form>

                {merchant.stripeAccountId && (
                  <a
                    href={`https://dashboard.stripe.com/connect/accounts/${merchant.stripeAccountId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Stripe Dashboard
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
