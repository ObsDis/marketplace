import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import DeliveryList from "./DeliveryList";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const deliveries = await db.delivery.findMany({
    where: { status: "POSTED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      packageSize: true,
      pickupCity: true,
      pickupState: true,
      dropoffCity: true,
      dropoffState: true,
      price: true,
      pickupDate: true,
      createdAt: true,
    },
  });

  // Serialize dates for the client component
  const serialized = deliveries.map((d) => ({
    ...d,
    pickupDate: d.pickupDate ? d.pickupDate.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

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

      <DeliveryList deliveries={serialized} />
    </div>
  );
}
