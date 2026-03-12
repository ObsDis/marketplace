import Link from "next/link";
import { Search, ShoppingBag, Truck, Car, Building2 } from "lucide-react";

const categories = [
  {
    name: "E-Commerce",
    href: "/marketplace/ecommerce",
    icon: ShoppingBag,
    description:
      "Browse products from verified merchants. Find everything from handmade goods to digital downloads.",
  },
  {
    name: "Logistics",
    href: "/marketplace/logistics",
    icon: Truck,
    description:
      "Find available shipments and freight opportunities. Connect with carriers and shippers nationwide.",
  },
  {
    name: "Ride Share",
    href: "/marketplace/rideshare",
    icon: Car,
    description:
      "Discover ride services in your area. Compare fares and request rides from local providers.",
  },
  {
    name: "Business Brokerage",
    href: "/marketplace/brokerage",
    icon: Building2,
    description:
      "Explore businesses for sale across multiple industries. Find your next investment opportunity.",
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Browse the Marketplace
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover products, services, shipments, and business opportunities
            — all in one place.
          </p>

          {/* Search bar (visual only) */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search the marketplace..."
                className="w-full rounded-full border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                readOnly
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-200"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-gray-600">
                  {category.description}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Browse
                    <svg
                      className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
