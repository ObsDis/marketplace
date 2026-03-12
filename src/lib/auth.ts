import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma";

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch the full user from our DB with role info
  let dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { driver: true },
  });

  // Auto-sync: user exists in Supabase but not yet in Prisma DB
  if (!dbUser) {
    const meta = user.user_metadata || {};
    const role = (meta.role as UserRole) || UserRole.CUSTOMER;
    const name = (meta.name as string) || "";
    const displayName = (meta.displayName as string) || name || "Driver";

    dbUser = await db.user.create({
      data: {
        id: user.id,
        name,
        email: user.email!,
        role,
        ...(role === UserRole.DRIVER && {
          driver: { create: { displayName } },
        }),
      },
      include: { driver: true },
    });
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      driver: dbUser.driver,
    },
  };
}
