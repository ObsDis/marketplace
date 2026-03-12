import Link from "next/link";
import { Building2, ArrowLeft, MapPin, Calendar, Users, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function BrokeragePage() {
  const listings = await db.brokerageListing.findMany({
    where: { status: "ACTIVE" },
    include: { merchant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Marketplace
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Business Brokerage
              </h1>
              <p className="mt-1 text-gray-600">
                Explore businesses for sale across multiple industries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {listings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No businesses listed for sale yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon for new business opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Industry badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                    {listing.industry}
                  </span>
                </div>

                {/* Business name */}
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {listing.businessName}
                </h3>

                {/* Asking price */}
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(listing.askingPrice)}
                </p>

                {/* Details */}
                <div className="mt-4 space-y-2">
                  {listing.annualRevenue != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span>
                        Annual Revenue: {formatCurrency(listing.annualRevenue)}
                      </span>
                    </div>
                  )}
                  {listing.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{listing.location}</span>
                    </div>
                  )}
                  {listing.yearEstablished != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Established {listing.yearEstablished}</span>
                    </div>
                  )}
                  {listing.employeeCount != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{listing.employeeCount} employees</span>
                    </div>
                  )}
                </div>

                {/* Broker info */}
                <p className="mt-3 text-xs text-gray-500">
                  Listed by {listing.merchant.businessName}
                </p>

                {/* View Details */}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/marketplace/brokerage/${listing.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
