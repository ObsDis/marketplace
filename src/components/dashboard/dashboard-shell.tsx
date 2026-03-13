import Link from "next/link";
import { Truck, LogOut } from "lucide-react";
import { SidebarNav, type SidebarItem } from "./sidebar-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  user: { name: string | null; email: string; role: string };
}

export function DashboardShell({ children, sidebarItems, user }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Truck className="h-5 w-5 text-orange-600" />
            Sprint Cargo
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={sidebarItems} />
        </div>

        {/* User info + Sign out */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Truck className="h-5 w-5 text-orange-600" />
            <span className="font-bold text-gray-900">Sprint Cargo</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500">
              {user.role === "CUSTOMER" ? "Shipper" : "Driver"} Dashboard
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {user.name || user.email}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
