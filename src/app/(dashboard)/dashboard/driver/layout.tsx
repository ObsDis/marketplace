import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  LayoutDashboard,
  Gavel,
  Package,
  DollarSign,
  Wallet,
  HelpCircle,
  CreditCard,
  Settings,
} from "lucide-react";
import type { SidebarItem } from "@/components/dashboard/sidebar-nav";

const sidebarItems: SidebarItem[] = [
  { href: "/dashboard/driver", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/driver/bids", label: "Bids", icon: Gavel },
  { href: "/dashboard/driver/deliveries", label: "Deliveries", icon: Package },
  { href: "/dashboard/driver/rate-card", label: "Rate Card", icon: DollarSign },
  { href: "/dashboard/driver/payments", label: "Payment Settings", icon: Wallet },
  { href: "/dashboard/driver/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/driver/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/driver/support", label: "Contact Support", icon: HelpCircle },
];

export default async function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "DRIVER") redirect("/dashboard/shipper");

  return (
    <DashboardShell sidebarItems={sidebarItems} user={session.user}>
      {children}
    </DashboardShell>
  );
}
