import Link from "next/link";
import { Check } from "lucide-react";
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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            No commissions. No hidden fees. Drivers set their own prices and
            keep everything minus credit card processing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Shippers / Customers */}
          <Card className="relative bg-white py-8">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Shippers
              </CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">Free</span>
              </div>
              <CardDescription className="mt-2">
                No fees to post deliveries
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {[
                  "Post unlimited delivery requests",
                  "Set your own budget",
                  "Choose from available drivers",
                  "Real-time delivery tracking",
                  "Secure payment processing",
                  "Rate and review drivers",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-8 h-auto w-full rounded-lg border-2 border-primary py-3 text-sm font-semibold text-primary hover:bg-primary/5"
                )}
              >
                Get Started Free
              </Link>
            </CardContent>
          </Card>

          {/* Drivers */}
          <Card className="relative border-2 border-primary bg-white py-8 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Most Popular</Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Drivers
              </CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-lg text-gray-500">/month</span>
              </div>
              <CardDescription className="mt-2">
                Flat monthly subscription &mdash; no commissions
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {[
                  "Set your own delivery prices",
                  "Keep 100% of earnings minus CC fees",
                  "Only 2.9% + $0.30 per transaction",
                  "Unlimited delivery jobs",
                  "Build your reputation with reviews",
                  "Manage your own schedule",
                  "Cancel anytime",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "mt-8 h-auto w-full rounded-lg py-3 text-sm font-semibold shadow hover:shadow-lg"
                )}
              >
                Start Driving
              </Link>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-20" />

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Customer Posts a Delivery",
                description:
                  "Describe your package, set pickup and dropoff locations, and choose a price.",
              },
              {
                step: "2",
                title: "Driver Accepts the Job",
                description:
                  "Subscribed drivers browse available jobs and accept the ones that work for them.",
              },
              {
                step: "3",
                title: "Deliver & Get Paid",
                description:
                  "Complete the delivery and funds are transferred directly to your account.",
              },
            ].map((item) => (
              <Card key={item.step} className="bg-white py-6 text-center">
                <CardContent className="flex flex-col items-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-20" />

        {/* FAQ */}
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-4">
            {[
              {
                question:
                  "Why do drivers pay a subscription instead of per-delivery commissions?",
                answer:
                  "Traditional platforms take 20-30% of every delivery. Our flat $99/month means the more you deliver, the more you keep. High-volume drivers save thousands compared to commission-based platforms.",
              },
              {
                question: "What are the credit card processing fees?",
                answer:
                  "Standard Stripe processing: 2.9% + $0.30 per transaction. That's it. On a $100 delivery, you keep $96.80.",
              },
              {
                question: "Can I cancel my driver subscription?",
                answer:
                  "Yes, cancel anytime with no penalties. Your subscription runs until the end of the billing period.",
              },
              {
                question: "How do I get paid as a driver?",
                answer:
                  "Payments are held securely when a customer books. Once you complete the delivery, funds are transferred directly to your connected bank account.",
              },
            ].map((faq, index, arr) => (
              <Card key={faq.question} className="bg-white py-5">
                <CardContent>
                  <dt className="text-sm font-semibold text-gray-900">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-sm text-gray-600">{faq.answer}</dd>
                </CardContent>
                {index < arr.length - 1 && <Separator className="mt-4" />}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
