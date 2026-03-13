import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/layout/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprint Cargo - The Fair Delivery Platform",
  description:
    "The fair delivery platform. $99/mo for drivers. Zero commission. Post deliveries, claim routes, and keep 100% of your earnings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
