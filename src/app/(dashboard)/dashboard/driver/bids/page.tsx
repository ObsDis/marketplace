import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const quoteStatusColors: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  COUNTERED: "bg-yellow-100 text-yellow-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-gray-100 text-gray-500",
};

const sizeLabels: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  XL: "XL",
  XXL: "XXL",
  PALLET: "Pallet",
};

export default async function DriverBidsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
  });
  if (!driver) redirect("/");

  // My submitted quotes
  const myQuotes = await db.quote.findMany({
    where: { driverId: driver.id },
    orderBy: { createdAt: "desc" },
    include: {
      delivery: {
        select: {
          id: true,
          title: true,
          pickupCity: true,
          dropoffCity: true,
          status: true,
        },
      },
    },
  });

  // Available jobs (POSTED deliveries I haven't quoted on)
  const quotedDeliveryIds = myQuotes.map((q) => q.deliveryId);
  const availableJobs = await db.delivery.findMany({
    where: {
      status: "POSTED",
      id: { notIn: quotedDeliveryIds },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      customer: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bids</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse available jobs and track your submitted quotes.
        </p>
      </div>

      {/* Available Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Available Jobs</h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {availableJobs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                No new jobs available right now. Check back soon!
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Est. Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Posted
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {availableJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {job.pickupCity} &rarr; {job.dropoffCity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {sizeLabels[job.packageSize] || job.packageSize}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {job.estimatedMin != null && job.estimatedMax != null
                        ? `${formatCurrency(job.estimatedMin)} – ${formatCurrency(job.estimatedMax)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/deliveries/${job.id}`}
                        className="text-sm font-medium text-orange-600 hover:text-orange-500"
                      >
                        View &amp; Quote
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* My Quotes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">My Quotes</h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          {myQuotes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                You haven&apos;t submitted any quotes yet.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    My Quote
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {quote.delivery.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {quote.delivery.pickupCity} &rarr;{" "}
                      {quote.delivery.dropoffCity}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(quote.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${quoteStatusColors[quote.status]}`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(quote.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/deliveries/${quote.deliveryId}`}
                        className="text-sm font-medium text-orange-600 hover:text-orange-500"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
