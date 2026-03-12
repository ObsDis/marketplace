import Link from "next/link";
import { Truck } from "lucide-react";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Drivers", href: "/for-drivers" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <Truck className="h-5 w-5 text-orange-500" />
              Sprint Cargo
            </Link>
            <p className="text-sm text-gray-400 max-w-xs text-center sm:text-left">
              The fair delivery platform. $99.99/mo for drivers. Zero commission.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sprint Cargo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
