import Link from "next/link";
import { Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "For Drivers", href: "/for-drivers" },
    ],
  },
  {
    title: "Support",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-80"
            >
              <Truck className="h-5 w-5 text-primary" />
              Sprint Cargo
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400 max-w-xs">
              The fair delivery platform. $99.99/mo for drivers. Zero commission.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-100">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-800" />

        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sprint Cargo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
