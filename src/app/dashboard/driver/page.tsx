import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  POSTED: "secondary",
  ACCEPTED: "outline",
  PICKED_UP: "default",
  IN_TRANSIT: "default",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

const subStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "default",
  PAST_DUE: "outline",
  INACTIVE: "destructive",
  CANCELLED: "destructive",
};

const sidebarLinks = [
  { href: "/dashboard/driver", label: "Overview", icon: "📊" },
  { href: "/dashboard/driver/deliveries", label: "My Deliveries", icon: "📦" },
  { href: "/marketplace", label: "Available Jobs", icon: "🔍" },
  { href: "/dashboard/driver/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/driver/subscription", label: "Subscription", icon: "💳" },
];

export default async function DriverDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "DRIVER") redirect("/");

  const driver = await db.driver.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: { orderBy: { createdAt: "desc" }, take: 10 },
      reviews: true,
    },
  });

  if (!driver) redirect("/");

  const activeDeliveries = driver.deliveries.filter(
    (d) => d.status !== "DELIVERED" && d.status !== "CANCELLED"
  );

  const avgRating =
    driver.reviews.length > 0
      ? driver.reviews.reduce((sum, r) => sum + r.rating, 0) /
        driver.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Driver Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "default" }),
                    "w-full justify-start gap-2"
                  )}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {driver.displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s your driver overview.
            </p>
          </div>

          {/* Subscription Banner */}
          {driver.subscriptionStatus === "INACTIVE" && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary">
                  Subscribe to Start Accepting Deliveries
                </CardTitle>
                <CardDescription>
                  Get unlimited access to delivery jobs for just $99.99/month. No
                  commissions, no hidden fees.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link
                  href="/dashboard/driver/subscription"
                  className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                >
                  Subscribe for $99.99/mo
                </Link>
              </CardFooter>
            </Card>
          )}

          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subscription Status */}
            <Card size="sm">
              <CardHeader>
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={subStatusVariant[driver.subscriptionStatus] || "secondary"}>
                  {driver.subscriptionStatus}
                </Badge>
              </CardContent>
            </Card>

            {/* Total Deliveries */}
            <Card size="sm">
              <CardHeader>
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Deliveries Completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {driver.totalDeliveries}
                </p>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card size="sm">
              <CardHeader>
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Average Rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                  </span>
                  {avgRating > 0 && (
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(avgRating) ? "fill-current" : "fill-gray-200"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Toggle */}
            <Card size="sm">
              <CardHeader>
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-3 w-3 rounded-full",
                      driver.available ? "bg-green-500" : "bg-muted-foreground/30"
                    )}
                  />
                  <Badge variant={driver.available ? "default" : "secondary"}>
                    {driver.available ? "Available" : "Offline"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Active Deliveries */}
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Active Deliveries
            </h2>
            {activeDeliveries.length === 0 ? (
              <Card className="mt-4">
                <CardContent className="flex flex-col items-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No active deliveries right now.
                  </p>
                  <Link
                    href="/marketplace"
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "mt-2"
                    )}
                  >
                    Browse available jobs
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          {delivery.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {delivery.pickupCity}, {delivery.pickupState} &rarr;{" "}
                          {delivery.dropoffCity}, {delivery.dropoffState}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[delivery.status] || "secondary"}>
                            {delivery.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(delivery.price)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(delivery.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/deliveries/${delivery.id}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" })
                            )}
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Browse Available Jobs
            </Link>
            <Link
              href="/dashboard/driver/settings"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Update Profile
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
