import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole),
  displayName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const { name, email, password, role, displayName } = parsed;

    if (role === UserRole.DRIVER && !displayName?.trim()) {
      return NextResponse.json(
        { error: "Display name is required for drivers." },
        { status: 400 }
      );
    }

    // Check if user already exists in our DB
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth (auto-confirmed via admin API)
    const supabase = createAdminClient();
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user in our Prisma DB with the Supabase user ID
    const user = await db.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        role,
        ...(role === UserRole.DRIVER && {
          driver: {
            create: {
              displayName: displayName!,
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
