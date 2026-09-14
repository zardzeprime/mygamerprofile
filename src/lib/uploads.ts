import { supabase } from "@/integrations/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET_LIMITS: Record<string, number> = {
  avatars: 5 * 1024 * 1024,
  banners: 8 * 1024 * 1024,
  "post-images": 10 * 1024 * 1024,
};

export async function uploadImage(
  bucket: "avatars" | "banners" | "post-images",
  file: File,
  fileName?: string,
) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("invalid_file_type");
  }
  if (file.size > (BUCKET_LIMITS[bucket] ?? 0)) {
    throw new Error("file_too_large");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const ext = file.name.split(".").pop() ?? "jpg";
  const name = fileName ? `${fileName}.${ext}` : `${crypto.randomUUID()}.${ext}`;
  const path = `${user.id}/${name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
