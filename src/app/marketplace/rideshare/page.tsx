import Link from "next/link";
import { Car, ArrowLeft, MapPin, DollarSign } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export default async function RideSharePage() {
  const merchants = await db.merchant.findMany({
    where: { industry: "RIDESHARE" },
    include: { rideConfig: true },
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
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ride Share</h1>
              <p className="mt-1 text-gray-600">
                Find ride services in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ride Services Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {merchants.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Car className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No ride services available yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon for ride service providers in your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Merchant name */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {merchant.businessName}
                </h3>

                {/* Service area */}
                {merchant.rideConfig?.serviceArea && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{merchant.rideConfig.serviceArea}</span>
                  </div>
                )}

                {/* Pricing details */}
                {merchant.rideConfig && (
                  <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Base Fare</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(merchant.rideConfig.baseFare)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Per Mile</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(merchant.rideConfig.perMileRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Per Minute</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(merchant.rideConfig.perMinRate)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Request Ride button */}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/marketplace/rideshare/${merchant.id}/request`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Request Ride
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
