"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Package,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
} from "lucide-react";

type Delivery = {
  id: string;
  title: string;
  packageSize: string;
  pickupCity: string;
  pickupState: string;
  dropoffCity: string;
  dropoffState: string;
  price: number;
  pickupDate: string | Date | null;
  createdAt: string | Date;
};

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
  XL: "bg-red-100 text-red-700",
  XXL: "bg-purple-100 text-purple-700",
  PALLET: "bg-gray-100 text-gray-700",
};

const SIZE_OPTIONS = [
  { value: "", label: "All Sizes" },
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "PALLET", label: "Pallets" },
];

type SortOption = "newest" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function DeliveryList({
  deliveries,
}: {
  deliveries: Delivery[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let results = deliveries;

    // Text search: title, pickup city, dropoff city
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.pickupCity.toLowerCase().includes(q) ||
          d.dropoffCity.toLowerCase().includes(q)
      );
    }

    // Package size filter
    if (sizeFilter) {
      results = results.filter((d) => d.packageSize === sizeFilter);
    }

    // Sort
    results = [...results].sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      // newest first (default)
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return results;
  }, [deliveries, searchQuery, sizeFilter, sortOption]);

  return (
    <>
      {/* Search / Filter Bar */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <Search className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No deliveries match your filters
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSizeFilter("");
                setSortOption("newest");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              Showing {filtered.length} of {deliveries.length} deliver
              {deliveries.length !== 1 ? "ies" : "y"}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((delivery) => (
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
                      {delivery.pickupDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(delivery.pickupDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                    <span className="text-xs text-gray-400">
                      {timeAgo(new Date(delivery.createdAt))}
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
    </>
  );
}
