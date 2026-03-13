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

export default async function ShipperBidsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const deliveries = await db.delivery.findMany({
    where: {
      customerId: session.user.id,
      status: { in: ["POSTED", "ACCEPTED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      quotes: {
        include: {
          driver: {
            select: { displayName: true, rating: true, totalDeliveries: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipment Bids</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review quotes from drivers on your active shipments.
        </p>
      </div>

      {deliveries.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            No active shipments with bids yet.
          </p>
          <Link
            href="/dashboard/shipper/create"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Create Shipment
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Delivery header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {delivery.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {delivery.pickupCity}, {delivery.pickupState} &rarr;{" "}
                    {delivery.dropoffCity}, {delivery.dropoffState} &middot;{" "}
                    {formatDate(delivery.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">
                    {delivery.quotes.length} quote
                    {delivery.quotes.length !== 1 ? "s" : ""}
                  </span>
                  <Link
                    href={`/deliveries/${delivery.id}`}
                    className="text-xs font-medium text-orange-600 hover:text-orange-500"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>

              {/* Quotes */}
              {delivery.quotes.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No quotes yet. Drivers will start bidding soon.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {delivery.quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                          {quote.driver.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {quote.driver.displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {quote.driver.rating > 0
                              ? `${quote.driver.rating.toFixed(1)} rating`
                              : "New driver"}{" "}
                            &middot; {quote.driver.totalDeliveries} deliveries
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {quote.message && (
                          <p className="hidden max-w-xs truncate text-xs text-gray-400 sm:block">
                            &ldquo;{quote.message}&rdquo;
                          </p>
                        )}
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(quote.amount)}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${quoteStatusColors[quote.status]}`}
                        >
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
