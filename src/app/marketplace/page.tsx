import Link from "next/link";
import { MapPin, Package, Clock, Search, Filter, Plus } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

const sizeColors: Record<string, string> = {
  SMALL: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LARGE: "bg-orange-100 text-orange-700",
  EXTRA_LARGE: "bg-red-100 text-red-700",
};

export default async function MarketplacePage() {
  const deliveries = await db.delivery.findMany({
    where: { status: "POSTED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Available Deliveries
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Browse open delivery jobs near you
              </p>
            </div>
            <Link
              href="/deliveries/new"
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Post a Delivery
            </Link>
          </div>
        </div>
      </section>

      {/* Search / Filter Bar */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or keyword..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                readOnly
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  disabled
                >
                  <option>All Cities</option>
                </select>
              </div>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  disabled
                >
                  <option>All Sizes</option>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <Package className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No deliveries posted yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Be the first to post a delivery!
            </p>
            <Link
              href="/deliveries/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
            >
              <Plus className="h-4 w-4" />
              Post a Delivery
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              {deliveries.length} delivery{deliveries.length !== 1 ? "ies" : ""}{" "}
              available
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-700">
                        {delivery.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sizeColors[delivery.packageSize] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {delivery.packageSize.replace("_", " ")}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-green-500" />
                        <span>
                          {delivery.pickupCity}, {delivery.pickupState}
                        </span>
                      </div>
                      <div className="ml-2 border-l-2 border-dashed border-gray-200 py-1" />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
                        <span>
                          {delivery.dropoffCity}, {delivery.dropoffState}
                        </span>
                      </div>
                    </div>

                    {/* Price and Date */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">
                        {formatPrice(delivery.price)}
                      </span>
                      {delivery.scheduledDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(
                            delivery.scheduledDate
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                    <span className="text-xs text-gray-400">
                      {timeAgo(delivery.createdAt)}
                    </span>
                    <Link
                      href={`/deliveries/${delivery.id}`}
                      className="text-sm font-medium text-orange-600 transition hover:text-orange-500"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
