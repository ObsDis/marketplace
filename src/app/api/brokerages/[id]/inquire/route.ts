import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const inquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.brokerageListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = inquirySchema.parse(body);

    const inquiry = await db.brokerageInquiry.create({
      data: {
        ...parsed,
        listingId: id,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/brokerages/[id]/inquire error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
