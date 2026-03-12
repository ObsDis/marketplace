import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Car,
  Building2,
  UserPlus,
  Settings,
  DollarSign,
  Check,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";

const industries = [
  {
    icon: ShoppingBag,
    title: "E-Commerce",
    description: "Sell physical and digital products with your own storefront",
    href: "/marketplace/e-commerce",
  },
  {
    icon: Truck,
    title: "Logistics",
    description: "Post and manage deliveries — from van loads to full trucks",
    href: "/marketplace/logistics",
  },
  {
    icon: Car,
    title: "Ride Share",
    description: "Launch your own ride service with custom pricing",
    href: "/marketplace/ride-share",
  },
  {
    icon: Building2,
    title: "Business Brokerage",
    description: "List businesses for sale with built-in NDA workflows",
    href: "/marketplace/brokerage",
  },
];

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Sign up & subscribe",
    description: "$99/month flat fee — no hidden costs, no commissions.",
  },
  {
    icon: Settings,
    step: "2",
    title: "Set up your store",
    description:
      "Configure your industry-specific settings and customize your storefront.",
  },
  {
    icon: DollarSign,
    step: "3",
    title: "Start earning",
    description:
      "Keep 100% of your revenue minus standard credit card processing fees.",
  },
];

const pricingFeatures = [
  "No commissions on sales",
  "Integrated Stripe payments",
  "Industry-specific tools",
  "Priority customer support",
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-Commerce Seller",
    quote:
      "MarketHub changed my business. I moved from a platform that took 15% of every sale to keeping everything. My profit margin doubled in the first month.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Logistics Operator",
    quote:
      "The logistics tools are exactly what I needed. Posting loads, managing routes, and handling payments all in one place has saved me hours every week.",
    rating: 5,
  },
  {
    name: "Diana Okafor",
    role: "Business Broker",
    quote:
      "The built-in NDA workflows and secure document sharing make listing businesses seamless. My clients love the professionalism of the platform.",
    rating: 5,
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              One Platform. Every Industry.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-indigo-100 sm:text-xl">
              Join MarketHub for a flat $99/month. Set your own prices. Keep
              100% of your sales.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 hover:shadow-xl"
              >
                Start Selling
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Cards Section */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Every Industry
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Whether you sell products, move freight, drive passengers, or
              broker deals — MarketHub has the tools you need.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-100">
                  <industry.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {industry.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {industry.description}
                </p>
                <Link
                  href={industry.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
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
              Get up and running in minutes. No complex setup, no surprises.
            </p>
          </div>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="mt-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
                  Step {item.step}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
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
              One plan. One price. Everything included.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-md">
            <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl sm:p-10">
              <h3 className="text-center text-lg font-semibold text-indigo-600">
                MarketHub Pro
              </h3>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                  $99
                </span>
                <span className="text-xl font-medium text-gray-500">
                  /month
                </span>
              </div>
              <ul className="mt-8 space-y-4">
                {pricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                    <span className="text-base text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-full bg-indigo-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow transition hover:bg-indigo-500 hover:shadow-lg"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Sellers Everywhere
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Hear from people who transformed their business with MarketHub.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <Quote className="h-8 w-8 text-indigo-200" />
                <p className="mt-4 text-base leading-7 text-gray-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
