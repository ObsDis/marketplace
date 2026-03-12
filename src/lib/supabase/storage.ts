import { createAdminClient } from "./admin";

const BUCKET_NAME = "marketplace-images";

export async function uploadImage(
  file: File,
  folder: string
): Promise<string> {
  const supabase = createAdminClient();
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export function getImageUrl(path: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);
  if (error) throw error;
}
