import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  LayoutDashboard,
  PlusCircle,
  Gavel,
  History,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import type { SidebarItem } from "@/components/dashboard/sidebar-nav";

const sidebarItems: SidebarItem[] = [
  { href: "/dashboard/shipper", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/shipper/create", label: "Create Shipment", icon: PlusCircle },
  { href: "/dashboard/shipper/bids", label: "Shipment Bids", icon: Gavel },
  { href: "/dashboard/shipper/history", label: "Shipment History", icon: History },
  { href: "/dashboard/shipper/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/shipper/support", label: "Contact Support", icon: HelpCircle },
];

export default async function ShipperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.user.role === "DRIVER") redirect("/dashboard/driver");

  return (
    <DashboardShell sidebarItems={sidebarItems} user={session.user}>
      {children}
    </DashboardShell>
  );
}
