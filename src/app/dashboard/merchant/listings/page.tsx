import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/signin");

  const merchant = await db.merchant.findUnique({
    where: { userId: session.user.id },
    include: {
      brokerageListings: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { inquiries: true } } },
      },
    },
  });

  if (!merchant) redirect("/dashboard/merchant");

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    UNDER_CONTRACT: "bg-yellow-100 text-yellow-800",
    SOLD: "bg-blue-100 text-blue-800",
    WITHDRAWN: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Brokerage Listings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your business-for-sale listings
            </p>
          </div>
          <Link
            href="/dashboard/merchant/listings/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Listing
          </Link>
        </div>

        {merchant.brokerageListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">
              You haven&apos;t created any listings yet.
            </p>
            <Link
              href="/dashboard/merchant/listings/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asking Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inquiries
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchant.brokerageListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {listing.businessName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.industry}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $
                      {listing.askingPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          statusColors[listing.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {listing.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {listing._count.inquiries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/dashboard/merchant/listings/${listing.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/merchant/listings/${listing.id}`}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
