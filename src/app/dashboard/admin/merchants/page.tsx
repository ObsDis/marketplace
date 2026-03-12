import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Industry, SubStatus } from "@/generated/prisma";
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    industry?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function AdminMerchantsPage({ searchParams }: PageProps) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const industryFilter = params.industry as Industry | undefined;
  const statusFilter = params.status as SubStatus | undefined;
  const searchQuery = params.q || "";

  const where: Record<string, unknown> = {};

  if (industryFilter && Object.values(Industry).includes(industryFilter)) {
    where.industry = industryFilter;
  }

  if (statusFilter && Object.values(SubStatus).includes(statusFilter)) {
    where.subscriptionStatus = statusFilter;
  }

  if (searchQuery) {
    where.OR = [
      { businessName: { contains: searchQuery, mode: "insensitive" } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  const [merchants, totalCount] = await Promise.all([
    db.merchant.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.merchant.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string> = {};
    if (params.q) base.q = params.q;
    if (params.industry) base.industry = params.industry;
    if (params.status) base.status = params.status;
    if (params.page) base.page = params.page;

    const merged = { ...base, ...overrides };
    const filtered = Object.entries(merged).filter(
      ([, v]) => v !== undefined && v !== ""
    );
    if (filtered.length === 0) return "/dashboard/admin/merchants";
    return `/dashboard/admin/merchants?${new URLSearchParams(filtered as [string, string][]).toString()}`;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">All Merchants</h1>
          <p className="text-gray-500 mt-1">
            {totalCount} merchant{totalCount !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <form method="GET" action="/dashboard/admin/merchants">
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label
                  htmlFor="q"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="q"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="Business name or email..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Industry Filter */}
              <div className="w-44">
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  defaultValue={industryFilter || ""}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Industries</option>
                  <option value="ECOMMERCE">E-Commerce</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="RIDESHARE">Rideshare</option>
                  <option value="BROKERAGE">Brokerage</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-44">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subscription
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={statusFilter || ""}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PAST_DUE">Past Due</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Filter
              </button>

              {/* Clear */}
              <Link
                href="/dashboard/admin/merchants"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear
              </Link>
            </div>
          </form>
        </div>

        {/* Merchants Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {merchant.businessName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {merchant.industry.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${subStatusBadge(merchant.subscriptionStatus)}`}
                      >
                        {merchant.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {merchant.stripeAccountReady ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Not Connected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {merchant.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(merchant.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/dashboard/admin/merchants/${merchant.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {merchants.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No merchants found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} merchants
              </p>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={buildUrl({ page: String(page - 1) })}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </span>
                )}
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={buildUrl({ page: String(page + 1) })}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
