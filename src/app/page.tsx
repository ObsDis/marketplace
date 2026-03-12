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

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
              <Truck className="h-4 w-4" />
              Cargo Van Delivery Platform
            </div>
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
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-orange-700 shadow-lg transition hover:bg-orange-50 hover:shadow-xl"
              >
                <Truck className="h-5 w-5" />
                I&apos;m a Driver
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/deliveries/new"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                <Package className="h-5 w-5" />
                Send a Package
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10">
              <h3 className="text-center text-xl font-bold text-gray-900">
                For Customers
              </h3>
              <div className="mt-8 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
              </div>
            </div>

            {/* For Drivers */}
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-8 sm:p-10">
              <h3 className="text-center text-xl font-bold text-gray-900">
                For Drivers
              </h3>
              <div className="mt-8 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
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
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="rounded-2xl border-2 border-orange-500 bg-white p-8 shadow-xl sm:p-10">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  <Truck className="h-4 w-4" />
                  For Drivers
                </div>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    $99.99
                  </span>
                  <span className="text-xl font-medium text-gray-500">
                    /month
                  </span>
                </div>
                <p className="mt-4 text-base text-gray-600">
                  Unlimited jobs. Zero commission. Keep what you earn.
                </p>
              </div>
              <Link
                href="/auth/signup?role=driver"
                className="mt-8 block rounded-full bg-orange-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow transition hover:bg-orange-500 hover:shadow-lg"
              >
                Start Driving
              </Link>
            </div>

            {/* Customer Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                  <Package className="h-4 w-4" />
                  For Customers
                </div>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    FREE
                  </span>
                </div>
                <p className="mt-4 text-base text-gray-600">
                  Set your own budget. Pay only when a driver accepts.
                </p>
              </div>
              <Link
                href="/deliveries/new"
                className="mt-8 block rounded-full border-2 border-orange-600 px-6 py-3.5 text-center text-base font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Post a Delivery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            <div>
              <div className="flex justify-center">
                <Users className="h-8 w-8 text-white/80" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                1,000+
              </div>
              <div className="mt-1 text-sm font-medium text-orange-100">
                Drivers
              </div>
            </div>
            <div>
              <div className="flex justify-center">
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                50,000+
              </div>
              <div className="mt-1 text-sm font-medium text-orange-100">
                Deliveries
              </div>
            </div>
            <div>
              <div className="flex justify-center">
                <DollarSign className="h-8 w-8 text-white/80" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                $0
              </div>
              <div className="mt-1 text-sm font-medium text-orange-100">
                Commission
              </div>
            </div>
            <div>
              <div className="flex justify-center">
                <MapPin className="h-8 w-8 text-white/80" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                100+
              </div>
              <div className="mt-1 text-sm font-medium text-orange-100">
                Cities
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="inline-flex rounded-xl bg-orange-50 p-3 text-orange-600">
                <DollarSign className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                No Commission Fees
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Other platforms take 20-30% of every job. With Sprint Cargo, you
                keep 100% of what you earn. Your revenue is your revenue.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="inline-flex rounded-xl bg-orange-50 p-3 text-orange-600">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Flexible Schedule
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Browse jobs and pick the ones that fit your route and schedule.
                Work when you want, where you want. No mandatory shifts.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="inline-flex rounded-xl bg-orange-50 p-3 text-orange-600">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Direct Payments
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Get paid directly via Stripe. No waiting for weekly payouts or
                dealing with complicated payment structures.
              </p>
            </div>
          </div>
        </div>
      </section>

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
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-orange-500 hover:shadow-xl"
            >
              <Truck className="h-5 w-5" />
              Sign Up as a Driver
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/deliveries/new"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-8 py-3.5 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
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
