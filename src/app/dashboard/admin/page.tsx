import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Store,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Truck,
  Car,
  Briefcase,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [
    totalUsers,
    totalMerchants,
    activeSubscriptions,
    totalProducts,
    totalShipments,
    totalRides,
    totalBrokerageListings,
    recentMerchants,
    industryBreakdown,
  ] = await Promise.all([
    db.user.count(),
    db.merchant.count(),
    db.merchant.count({ where: { subscriptionStatus: "ACTIVE" } }),
    db.product.count(),
    db.shipment.count(),
    db.ride.count(),
    db.brokerageListing.count(),
    db.merchant.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.merchant.groupBy({
      by: ["industry"],
      _count: { id: true },
    }),
  ]);

  const mrr = activeSubscriptions * 99;

  const industryMap: Record<string, number> = {
    ECOMMERCE: 0,
    LOGISTICS: 0,
    RIDESHARE: 0,
    BROKERAGE: 0,
  };
  for (const item of industryBreakdown) {
    industryMap[item.industry] = item._count.id;
  }

  const industryConfig = [
    { key: "ECOMMERCE", label: "E-Commerce", icon: ShoppingBag, color: "bg-blue-100 text-blue-700" },
    { key: "LOGISTICS", label: "Logistics", icon: Truck, color: "bg-orange-100 text-orange-700" },
    { key: "RIDESHARE", label: "Rideshare", icon: Car, color: "bg-green-100 text-green-700" },
    { key: "BROKERAGE", label: "Brokerage", icon: Briefcase, color: "bg-purple-100 text-purple-700" },
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">
                Total Merchants
              </p>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Store className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalMerchants.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">
                Active Subscriptions
              </p>
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {activeSubscriptions.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Monthly MRR</p>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(mrr)}
            </p>
          </div>
        </div>

        {/* Industry Breakdown + Platform Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Industry Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Industry Breakdown
            </h2>
            <div className="space-y-4">
              {industryConfig.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {industryMap[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Products
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalProducts.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Shipments
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalShipments.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Total Rides
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalRides.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Brokerage Listings
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalBrokerageListings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Merchants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Merchants
            </h2>
            <Link
              href="/dashboard/admin/merchants"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {recentMerchants.map((merchant) => (
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
                {recentMerchants.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No merchants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
