import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { UserRole, Industry } from "@/generated/prisma";

const registerSchema = z.object({
  supabaseUserId: z.string().min(1, "Supabase user ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
  industry: z.nativeEnum(Industry).optional(),
  businessName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const { supabaseUserId, name, email, role, industry, businessName } = parsed;

    if (role === UserRole.MERCHANT && !businessName?.trim()) {
      return NextResponse.json(
        { error: "Business name is required for merchants." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        id: supabaseUserId,
        name,
        email,
        role,
        ...(role === UserRole.MERCHANT && {
          merchant: {
            create: {
              businessName: businessName!,
              industry: industry || Industry.ECOMMERCE,
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
