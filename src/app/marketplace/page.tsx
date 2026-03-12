import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Available Deliveries
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Browse open delivery jobs near you
              </p>
            </div>
            <Button size="lg" render={<Link href="/deliveries/new" />}>
              <Plus className="size-4" />
              Post a Delivery
            </Button>
          </div>
        </div>
      </section>

      <DeliveryList deliveries={serialized} />
    </div>
  );
}
