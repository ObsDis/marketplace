import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/marketplace";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to Prisma DB after email confirmation
      const meta = data.user.user_metadata;
      try {
        await fetch(`${origin}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabaseId: data.user.id,
            name: meta?.name || "",
            email: data.user.email!,
            role: meta?.role || "CUSTOMER",
            displayName: meta?.displayName,
          }),
        });
      } catch (err) {
        console.error("Failed to sync user to Prisma:", err);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth-code-error`);
}
