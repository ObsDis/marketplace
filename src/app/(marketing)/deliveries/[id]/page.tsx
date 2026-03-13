import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateQuote } from "@/lib/quote-engine";
import DeliveryActions from "./DeliveryActions";
import QuotePanel from "./QuotePanel";

export const dynamic = "force-dynamic";

const speedLabels: Record<string, string> = {
  STANDARD: "Standard",
  SAME_DAY: "Same Day",
  RUSH: "Rush",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const statusColors: Record<string, string> = {
  POSTED: "bg-blue-100 text-blue-800 border-blue-200",
  ACCEPTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PICKED_UP: "bg-purple-100 text-purple-800 border-purple-200",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const timelineSteps = [
  { key: "POSTED", label: "Posted" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
];

const sizeLabels: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  XL: "XL",
  XXL: "XXL",
  PALLET: "Pallets",
};

function getTimelineIndex(status: string) {
  const idx = timelineSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const delivery = await db.delivery.findUnique({
    where: { id },
    include: {
      driver: { include: { user: true } },
      customer: true,
    },
  });

  if (!delivery) notFound();

  const currentStep = getTimelineIndex(delivery.status);
  const isCancelled = delivery.status === "CANCELLED";

  // Determine user roles
  const isDriver = session?.user.role === "DRIVER";
  const isCustomer = session?.user.id === delivery.customerId;
  const isAssignedDriver =
    session?.user.driver && delivery.driverId === session.user.driver.id;

  const canUpdateStatus = isAssignedDriver && !isCancelled && delivery.status !== "DELIVERED";
  const canCancel = isCustomer && delivery.status === "POSTED";

  // Calculate auto-quote for current driver (if they have a rate card)
  let driverAutoQuote: number | null = null;
  if (isDriver && session?.user.driver) {
    const driverWithCard = await db.driver.findUnique({
      where: { userId: session.user.id },
      include: { rateCard: true },
    });
    if (driverWithCard?.rateCard) {
      driverAutoQuote = calculateQuote(driverWithCard.rateCard, {
        distance: delivery.distance,
        packageSize: delivery.packageSize,
        packageWeight: delivery.packageWeight,
        packageCount: delivery.packageCount,
        deliverySpeed: delivery.deliverySpeed,
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/marketplace"
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              &larr; Back to Marketplace
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {delivery.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {delivery.deliverySpeed !== "STANDARD" && (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {speedLabels[delivery.deliverySpeed]}
              </span>
            )}
            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColors[delivery.status]}`}
            >
              {delivery.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {delivery.description && (
          <p className="mt-3 text-sm text-gray-600">{delivery.description}</p>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Delivery Progress
            </h3>
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, idx) => (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        idx <= currentStep
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {idx < currentStep ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium ${
                        idx <= currentStep ? "text-orange-600" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        idx < currentStep ? "bg-orange-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pickup & Dropoff */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Pickup
            </h3>
            <p className="mt-3 text-sm font-medium text-gray-900">
              {delivery.pickupAddress}
            </p>
            <p className="text-sm text-gray-600">
              {delivery.pickupCity}, {delivery.pickupState} {delivery.pickupZip}
            </p>
            {delivery.pickupContact && (
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Contact:</span>{" "}
                {delivery.pickupContact}
              </p>
            )}
            {delivery.pickupPhone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span>{" "}
                {delivery.pickupPhone}
              </p>
            )}
            {delivery.pickupNotes && (
              <p className="mt-2 text-xs text-gray-500 italic">
                {delivery.pickupNotes}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Dropoff
            </h3>
            <p className="mt-3 text-sm font-medium text-gray-900">
              {delivery.dropoffAddress}
            </p>
            <p className="text-sm text-gray-600">
              {delivery.dropoffCity}, {delivery.dropoffState}{" "}
              {delivery.dropoffZip}
            </p>
            {delivery.dropoffContact && (
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Contact:</span>{" "}
                {delivery.dropoffContact}
              </p>
            )}
            {delivery.dropoffPhone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span>{" "}
                {delivery.dropoffPhone}
              </p>
            )}
            {delivery.dropoffNotes && (
              <p className="mt-2 text-xs text-gray-500 italic">
                {delivery.dropoffNotes}
              </p>
            )}
          </div>
        </div>

        {/* Package, Price/Estimate, & Schedule */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Package
            </h3>
            <p className="mt-2 text-sm text-gray-900">
              <span className="font-medium">Size:</span>{" "}
              {sizeLabels[delivery.packageSize] || delivery.packageSize}
            </p>
            {delivery.packageWeight && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">Weight:</span>{" "}
                {delivery.packageWeight} lbs
              </p>
            )}
            <p className="text-sm text-gray-900">
              <span className="font-medium">Count:</span>{" "}
              {delivery.packageCount}
            </p>
            {delivery.distance && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">Distance:</span>{" "}
                {delivery.distance} mi
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              {delivery.price ? "Agreed Price" : "Estimated Range"}
            </h3>
            {delivery.price ? (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(delivery.price)}
              </p>
            ) : delivery.estimatedMin != null && delivery.estimatedMax != null ? (
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(delivery.estimatedMin)}
                  {delivery.estimatedMin !== delivery.estimatedMax &&
                    ` – ${formatCurrency(delivery.estimatedMax)}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on driver rate cards
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                Waiting for driver quotes
              </p>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Schedule
            </h3>
            {delivery.pickupDate ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Pickup:</span>{" "}
                  {new Date(delivery.pickupDate).toLocaleDateString()}
                  {delivery.pickupTime && ` at ${delivery.pickupTime}`}
                </p>
                {delivery.deliveryDate && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Delivery:</span>{" "}
                    {new Date(delivery.deliveryDate).toLocaleDateString()}
                    {delivery.deliveryTime && ` at ${delivery.deliveryTime}`}
                  </p>
                )}
                {delivery.latestDeliveryTime && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Latest:</span>{" "}
                    {delivery.latestDeliveryTime}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">ASAP</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Posted {formatDate(delivery.createdAt)}
            </p>
          </div>
        </div>

        {/* Item Photos */}
        {delivery.images && delivery.images.length > 0 && (
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Item Photos
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {delivery.images.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt={`Item ${i + 1}`}
                  className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Driver Info (after quote accepted) */}
        {delivery.driver && (
          <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Assigned Driver
            </h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                {delivery.driver.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {delivery.driver.displayName}
                </p>
                {delivery.driver.phone && (
                  <p className="text-sm text-gray-600">
                    {delivery.driver.phone}
                  </p>
                )}
                {delivery.driver.vanInfo && (
                  <p className="text-xs text-gray-500">
                    {delivery.driver.vanInfo}
                  </p>
                )}
                {delivery.driver.rating > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= Math.round(delivery.driver!.rating) ? "fill-current" : "fill-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {delivery.driver.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quote Panel — drivers submit quotes, shippers review/accept/counter */}
        {session && (isDriver || isCustomer) && (
          <QuotePanel
            deliveryId={delivery.id}
            isShipper={!!isCustomer}
            isDriver={!!isDriver}
            driverAutoQuote={driverAutoQuote}
            deliveryStatus={delivery.status}
          />
        )}

        {/* Status update actions (for assigned driver) */}
        {session && (canUpdateStatus || canCancel) && (
          <DeliveryActions
            deliveryId={delivery.id}
            status={delivery.status}
            canAccept={false}
            canUpdateStatus={!!canUpdateStatus}
            canCancel={canCancel}
          />
        )}
      </div>
    </div>
  );
}
