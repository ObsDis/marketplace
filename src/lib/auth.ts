import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch the full user from our DB with role info
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: { driver: true },
  });

  if (!dbUser) return null;

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
