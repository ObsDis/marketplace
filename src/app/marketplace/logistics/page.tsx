import Link from "next/link";
import { Truck, ArrowLeft, MapPin, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

const vehicleTypeLabels: Record<string, string> = {
  VAN: "Van",
  BOX_TRUCK: "Box Truck",
  SEMI: "Semi",
  FLATBED: "Flatbed",
};

export default async function LogisticsPage() {
  const shipments = await db.shipment.findMany({
    where: { status: "POSTED" },
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
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logistics</h1>
              <p className="mt-1 text-gray-600">
                Available shipments and freight opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipments Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {shipments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Truck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No shipments posted yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon for new freight opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Vehicle type badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {vehicleTypeLabels[shipment.vehicleType] ??
                      shipment.vehicleType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {shipment.title}
                </h3>

                {/* Route */}
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-green-500" />
                  <span className="truncate">
                    {shipment.pickupCity}, {shipment.pickupState}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                  <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="truncate">
                    {shipment.dropCity}, {shipment.dropState}
                  </span>
                </div>

                {/* Price & Merchant */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {shipment.merchant.businessName}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(shipment.price)}
                    </p>
                  </div>
                  <Link
                    href={`/marketplace/logistics/${shipment.id}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    View
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
