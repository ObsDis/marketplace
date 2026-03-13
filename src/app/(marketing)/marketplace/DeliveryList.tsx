"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Package, Clock, Search, Plus, Zap, MessageSquare } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Delivery = {
  id: string;
  title: string;
  packageSize: string;
  pickupCity: string;
  pickupState: string;
  dropoffCity: string;
  dropoffState: string;
  price: number | null;
  estimatedMin: number | null;
  estimatedMax: number | null;
  deliverySpeed: string;
  distance: number | null;
  quoteCount: number;
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

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const sizeBadgeVariant: Record<string, BadgeVariant> = {
  SMALL: "secondary",
  MEDIUM: "outline",
  LARGE: "default",
  XL: "default",
  XXL: "destructive",
  PALLET: "secondary",
};

const speedLabels: Record<string, string> = {
  STANDARD: "Standard",
  SAME_DAY: "Same Day",
  RUSH: "Rush",
};

const SIZE_OPTIONS = [
  { value: "ALL", label: "All Sizes" },
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "PALLET", label: "Pallets" },
];

const SPEED_OPTIONS = [
  { value: "ALL", label: "All Speeds" },
  { value: "STANDARD", label: "Standard" },
  { value: "SAME_DAY", label: "Same Day" },
  { value: "RUSH", label: "Rush" },
];

type SortOption = "newest" | "estimate-asc" | "estimate-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "estimate-asc", label: "Estimate: Low to High" },
  { value: "estimate-desc", label: "Estimate: High to Low" },
];

export default function DeliveryList({
  deliveries,
}: {
  deliveries: Delivery[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [speedFilter, setSpeedFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let results = deliveries;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.pickupCity.toLowerCase().includes(q) ||
          d.dropoffCity.toLowerCase().includes(q)
      );
    }

    if (sizeFilter && sizeFilter !== "ALL") {
      results = results.filter((d) => d.packageSize === sizeFilter);
    }

    if (speedFilter && speedFilter !== "ALL") {
      results = results.filter((d) => d.deliverySpeed === speedFilter);
    }

    results = [...results].sort((a, b) => {
      if (sortOption === "estimate-asc") {
        return (a.estimatedMin ?? 0) - (b.estimatedMin ?? 0);
      }
      if (sortOption === "estimate-desc") {
        return (b.estimatedMax ?? 0) - (a.estimatedMax ?? 0);
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return results;
  }, [deliveries, searchQuery, sizeFilter, speedFilter, sortOption]);

  return (
    <>
      {/* Search / Filter Bar */}
      <section className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by city or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={sizeFilter}
                onValueChange={(val) => setSizeFilter(val as string)}
              >
                <SelectTrigger className="w-[140px]">
                  <Package className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={speedFilter}
                onValueChange={(val) => setSpeedFilter(val as string)}
              >
                <SelectTrigger className="w-[140px]">
                  <Zap className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="All Speeds" />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOption}
                onValueChange={(val) => setSortOption(val as SortOption)}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {deliveries.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed px-6 py-20 text-center">
            <Package className="size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No deliveries posted yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to post a delivery!
            </p>
            <Button className="mt-6" render={<Link href="/deliveries/new" />}>
              <Plus className="size-4" />
              Post a Delivery
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed px-6 py-20 text-center">
            <Search className="size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No deliveries match your filters
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                setSizeFilter("ALL");
                setSpeedFilter("ALL");
                setSortOption("newest");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {filtered.length} of {deliveries.length} deliver
              {deliveries.length !== 1 ? "ies" : "y"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((delivery) => (
                <Card
                  key={delivery.id}
                  className="transition hover:ring-2 hover:ring-primary/30"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1">
                        {delivery.title}
                      </CardTitle>
                      <div className="flex shrink-0 gap-1.5">
                        {delivery.deliverySpeed !== "STANDARD" && (
                          <Badge variant="destructive" className="text-xs">
                            {speedLabels[delivery.deliverySpeed]}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            sizeBadgeVariant[delivery.packageSize] || "secondary"
                          }
                        >
                          {delivery.packageSize.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Route */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="size-4 shrink-0 text-green-600" />
                        <span>
                          {delivery.pickupCity}, {delivery.pickupState}
                        </span>
                      </div>
                      <div className="ml-2 border-l-2 border-dashed border-border py-0.5" />
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        <span>
                          {delivery.dropoffCity}, {delivery.dropoffState}
                        </span>
                      </div>
                    </div>

                    {delivery.distance && (
                      <p className="text-xs text-muted-foreground">
                        ~{delivery.distance} miles
                      </p>
                    )}

                    <Separator />

                    {/* Price / Estimate + Quotes */}
                    <div className="flex items-center justify-between">
                      <div>
                        {delivery.price ? (
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(delivery.price)}
                          </span>
                        ) : delivery.estimatedMin != null && delivery.estimatedMax != null ? (
                          <div>
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(delivery.estimatedMin)}
                              {delivery.estimatedMin !== delivery.estimatedMax &&
                                ` – ${formatPrice(delivery.estimatedMax)}`}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              est. range
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Awaiting quotes
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {delivery.quoteCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="size-3.5" />
                            {delivery.quoteCount} quote
                            {delivery.quoteCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {delivery.pickupDate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            {new Date(delivery.pickupDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(new Date(delivery.createdAt))}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      render={<Link href={`/deliveries/${delivery.id}`} />}
                    >
                      View Details &rarr;
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
