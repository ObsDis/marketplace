import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma";
import { sendWelcomeEmail } from "@/lib/email";

const syncSchema = z.object({
  supabaseId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
  displayName: z.string().optional(),
});

// Called after Supabase auth.signUp() + email confirmation to sync user to Prisma DB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = syncSchema.parse(body);

    const { supabaseId, name, email, role, displayName } = parsed;

    if (role === UserRole.DRIVER && !displayName?.trim()) {
      return NextResponse.json(
        { error: "Display name is required for drivers." },
        { status: 400 }
      );
    }

    // Check if user already exists in our DB (idempotent)
    const existingUser = await db.user.findUnique({
      where: { id: supabaseId },
    });

    if (existingUser) {
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Create user in our Prisma DB with the Supabase user ID
    const user = await db.user.create({
      data: {
        id: supabaseId,
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

    // Fire-and-forget: send welcome email
    sendWelcomeEmail(email, name);

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
