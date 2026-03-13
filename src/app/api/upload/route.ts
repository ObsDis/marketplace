import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allow up to 500MB request body (5 images × 100MB each)
export const maxDuration = 120;

const BUCKET_NAME = "marketplace-images";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Ensure the storage bucket exists (auto-create on first upload)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET_NAME)) {
      const { error: bucketError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        { public: true }
      );
      if (bucketError) {
        console.error("Bucket creation error:", bucketError);
        return NextResponse.json(
          { error: `Failed to create storage bucket: ${bucketError.message}` },
          { status: 500 }
        );
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 100MB limit` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `deliveries/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error.message, error);
        return NextResponse.json(
          { error: `Failed to upload image: ${error.message}` },
          { status: 500 }
        );
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
