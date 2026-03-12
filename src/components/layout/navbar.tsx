"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.name || user?.email || "";

  const userRole: string = user?.user_metadata?.role || "";

  const dashboardHref =
    userRole === "DRIVER"
      ? "/dashboard/driver"
      : userRole === "ADMIN"
        ? "/dashboard/admin"
        : "/deliveries/new";

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary transition-opacity hover:opacity-80">
          <Truck className="h-6 w-6" />
          Sprint Cargo
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">Browse Deliveries</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/deliveries/new">Post Delivery</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                {displayName}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t bg-white px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" className="justify-start" asChild>
              <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
                Browse Deliveries
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="justify-start" asChild>
              <Link href="/deliveries/new" onClick={() => setMobileOpen(false)}>
                Post Delivery
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="justify-start" asChild>
              <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
            </Button>
          </div>

          <Separator className="my-3" />

          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <span className="px-3 text-sm font-medium text-muted-foreground">
                  {displayName}
                </span>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
