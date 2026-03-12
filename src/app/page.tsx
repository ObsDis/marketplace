import Link from "next/link";
import {
  Truck,
  Package,
  DollarSign,
  MapPin,
  Clock,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-2 bg-white/10 px-4 py-1.5 text-sm text-amber-100 backdrop-blur-sm"
            >
              <Truck className="h-4 w-4" />
              Cargo Van Delivery Platform
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Sprint Cargo
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-amber-100 sm:text-xl">
              Delivery platforms take up to 30% of every job. We charge drivers
              $99.99/month. That&apos;s it. Lower costs for drivers means lower
              prices for you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup?role=driver"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-auto gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-orange-700 shadow-lg hover:bg-orange-50 hover:shadow-xl"
                )}
              >
                <Truck className="h-5 w-5" />
                I&apos;m a Driver
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/deliveries/new"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto gap-2 rounded-full border-2 border-white/30 bg-transparent px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <Package className="h-5 w-5" />
                Send a Package
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Simple for everyone. Post a delivery or start earning today.
            </p>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {/* For Customers */}
            <Card className="bg-gray-50 py-8 sm:py-10">
              <CardHeader className="items-center">
                <CardTitle className="text-xl font-bold">
                  For Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Post your delivery
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Tell us pickup, dropoff, and package details.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      A driver accepts your job
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Local drivers compete for your delivery.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Track and receive
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Real-time updates until delivered.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Drivers */}
            <Card className="border-2 border-primary/30 bg-orange-50 py-8 sm:py-10">
              <CardHeader className="items-center">
                <CardTitle className="text-xl font-bold">
                  For Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Subscribe for $99.99/mo
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      No commissions, no hidden fees.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Browse available jobs
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Pick the ones that work for your route.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Deliver and earn
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Keep 100% of every delivery minus CC fees.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              No surprises. No percentage cuts. Just a flat monthly fee for
              drivers.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Driver Card */}
            <Card className="border-2 border-primary bg-white py-8 shadow-xl sm:py-10">
              <CardHeader className="items-center">
                <Badge className="gap-2">
                  <Truck className="h-4 w-4" />
                  For Drivers
                </Badge>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    $99.99
                  </span>
                  <span className="text-xl font-medium text-gray-500">
                    /month
                  </span>
                </div>
                <CardDescription className="mt-4 text-center text-base">
                  Unlimited jobs. Zero commission. Keep what you earn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/auth/signup?role=driver"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "h-auto w-full rounded-full py-3.5 text-base font-semibold shadow hover:shadow-lg"
                  )}
                >
                  Start Driving
                </Link>
              </CardContent>
            </Card>

            {/* Customer Card */}
            <Card className="bg-white py-8 shadow-sm sm:py-10">
              <CardHeader className="items-center">
                <Badge variant="secondary" className="gap-2">
                  <Package className="h-4 w-4" />
                  For Customers
                </Badge>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    FREE
                  </span>
                </div>
                <CardDescription className="mt-4 text-center text-base">
                  Set your own budget. Pay only when a driver accepts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/deliveries/new"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-auto w-full rounded-full border-2 border-primary py-3.5 text-base font-semibold text-primary hover:bg-primary/5"
                  )}
                >
                  Post a Delivery
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {[
              { icon: Users, value: "1,000+", label: "Drivers" },
              { icon: Package, value: "50,000+", label: "Deliveries" },
              { icon: DollarSign, value: "$0", label: "Commission" },
              { icon: MapPin, value: "100+", label: "Cities" },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border-none bg-white/10 py-6 text-center shadow-none backdrop-blur-sm"
              >
                <CardContent className="flex flex-col items-center gap-2 p-0 px-4">
                  <stat.icon className="h-8 w-8 text-white/80" />
                  <div className="text-3xl font-extrabold text-white sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-orange-100">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Trust Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Drivers Choose Sprint Cargo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Built by drivers, for drivers. We keep it simple so you can focus
              on earning.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: DollarSign,
                title: "No Commission Fees",
                description:
                  "Other platforms take 20-30% of every job. With Sprint Cargo, you keep 100% of what you earn. Your revenue is your revenue.",
              },
              {
                icon: Clock,
                title: "Flexible Schedule",
                description:
                  "Browse jobs and pick the ones that fit your route and schedule. Work when you want, where you want. No mandatory shifts.",
              },
              {
                icon: Shield,
                title: "Direct Payments",
                description:
                  "Get paid directly via Stripe. No waiting for weekly payouts or dealing with complicated payment structures.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="bg-white py-8 transition hover:shadow-md"
              >
                <CardContent>
                  <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Final CTA */}
      <section className="bg-gray-900 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join Sprint Cargo today. Whether you&apos;re a driver looking to
            earn more or a customer who needs something delivered.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup?role=driver"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-auto gap-2 rounded-full px-8 py-3.5 text-base font-semibold shadow-lg hover:shadow-xl"
              )}
            >
              <Truck className="h-5 w-5" />
              Sign Up as a Driver
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/deliveries/new"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-auto gap-2 rounded-full border-2 border-white/20 bg-transparent px-8 py-3.5 text-base font-semibold text-white hover:border-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <Package className="h-5 w-5" />
              Send a Package
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
