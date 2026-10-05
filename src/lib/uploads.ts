import { supabase } from "@/integrations/supabase/client";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const BUCKET_LIMITS: Record<string, number> = {
  avatars: 5 * 1024 * 1024,
  banners: 8 * 1024 * 1024,
  "post-images": 10 * 1024 * 1024,
};

function safeStem(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function uploadImage(
  bucket: "avatars" | "banners" | "post-images",
  file: File,
  fileName?: string,
) {
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new Error("invalid_file_type");
  if (file.size <= 0 || file.size > (BUCKET_LIMITS[bucket] ?? 0)) {
    throw new Error("file_too_large");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const requestedStem = fileName ? safeStem(fileName) : "";
  const name = `${requestedStem || crypto.randomUUID()}.${extension}`;
  const path = `${user.id}/${name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: Boolean(requestedStem),
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
