import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { Industry } from "@/generated/prisma";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  images: z.array(z.string()).default([]),
  category: z.string().optional(),
  digital: z.boolean().default(false),
  downloadUrl: z.string().url().optional().nullable(),
  inventory: z.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const industry = searchParams.get("industry");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { active: true };

    if (industry) {
      where.merchant = { industry: industry as Industry };
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: {
        merchant: {
          select: { id: true, businessName: true, logo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const merchant = await db.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant account required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createProductSchema.parse(body);

    const product = await db.product.create({
      data: {
        ...parsed,
        merchantId: merchant.id,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
