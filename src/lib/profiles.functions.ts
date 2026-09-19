import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublic } from "./supabase.server";

type PublicProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  profile_background?: string;
  followers_count?: number;
  following_count?: number;
};

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const APP_LANGUAGES = ["pt-BR", "en", "es"] as const;
const THEME_PREFERENCES = ["light", "dark", "system"] as const;
const PROFILE_VISIBILITIES = ["public", "private"] as const;
const PROFILE_BACKGROUNDS = ["mgp-grid", "ember", "tactical", "midnight"] as const;
const AVATAR_PUBLIC_PREFIX =
  "https://gudvdgpjfapshzqyfcpj.supabase.co/storage/v1/object/public/avatars/";

const avatarUrlSchema = z
  .string()
  .url()
  .refine((value) => value.startsWith(AVATAR_PUBLIC_PREFIX), "invalid_avatar_url");

const usernameSchema = z.object({ username: z.string().trim().min(3).max(20) });
const profileSearchSchema = z.object({ query: z.string().trim().min(1).max(80), limit: z.number().int().min(1).max(12).default(6) });
const usernameCheckSchema = z.object({
  username: z.string().trim().min(3).max(20),
  excludeUserId: z.string().uuid().optional(),
});
const createProfileSchema = z.object({
  username: z.string().regex(USERNAME_REGEX),
  display_name: z.string().trim().min(1).max(80),
  language: z.enum(APP_LANGUAGES).optional(),
  theme_preference: z.enum(THEME_PREFERENCES).optional(),
  favorite_game_ids: z.array(z.string().uuid()).max(20).optional(),
});
const updateProfileSchema = z.object({
  username: z.string().regex(USERNAME_REGEX).optional(),
  display_name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatar_url: avatarUrlSchema.nullable().optional(),
  language: z.enum(APP_LANGUAGES).optional(),
  theme_preference: z.enum(THEME_PREFERENCES).optional(),
  visibility: z.enum(PROFILE_VISIBILITIES).optional(),
  profile_background: z.enum(PROFILE_BACKGROUNDS).optional(),
});
const followSchema = z.object({ following_id: z.string().uuid() });

export const getProfileByUsername = createServerFn({ method: "GET" })
  .validator((data) => usernameSchema.parse(data))
  .handler(async ({ data }) => {
    // Public profile pages must not depend on browser auth state or anonymous
    // client header quirks. Read through the trusted server client, but keep the
    // public-visibility filter explicit so private profiles are never exposed.
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const normalizedUsername = data.username.trim().toLowerCase();

    const { data: profile, error } = await admin
      .from("profiles")
      .select("*")
      .eq("visibility", "public")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (error) {
      console.error("[MGP] Public profile lookup failed", error);
      throw new Error("public_profile_lookup_failed");
    }
    if (!profile) return null;

    const publicProfile = profile as PublicProfile;
    return {
      ...publicProfile,
      followers: Number(publicProfile.followers_count ?? 0),
      following: Number(publicProfile.following_count ?? 0),
    };
  });

export const searchPublicProfiles = createServerFn({ method: "GET" })
  .validator((data) => profileSearchSchema.parse(data))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const term = data.query.trim().replace(/[%_]/g, "");
    if (!term) return [];

    const pattern = `%${term}%`;
    const [usernameResult, displayNameResult] = await Promise.all([
      admin
        .from("profiles")
        .select("id,username,display_name,avatar_url,bio")
        .eq("visibility", "public")
        .ilike("username", pattern)
        .limit(data.limit),
      admin
        .from("profiles")
        .select("id,username,display_name,avatar_url,bio")
        .eq("visibility", "public")
        .ilike("display_name", pattern)
        .limit(data.limit),
    ]);

    if (usernameResult.error) throw new Error("profile_search_failed");
    if (displayNameResult.error) throw new Error("profile_search_failed");

    const merged = [
      ...(usernameResult.data ?? []),
      ...(displayNameResult.data ?? []),
    ];
    const unique = Array.from(new Map(merged.map((profile) => [profile.id, profile])).values());

    return unique
      .sort((first, second) => {
        const q = term.toLowerCase();
        const firstUsername = first.username.toLowerCase();
        const secondUsername = second.username.toLowerCase();
        const firstScore =
          firstUsername === q ? 0 : firstUsername.startsWith(q) ? 1 : first.display_name.toLowerCase().startsWith(q) ? 2 : 3;
        const secondScore =
          secondUsername === q ? 0 : secondUsername.startsWith(q) ? 1 : second.display_name.toLowerCase().startsWith(q) ? 2 : 3;
        return firstScore - secondScore || firstUsername.localeCompare(secondUsername);
      })
      .slice(0, data.limit);
  });

export const getCurrentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("profile_not_found");
    return profile;
  });

export const checkUsernameAvailable = createServerFn({ method: "GET" })
  .validator((data) => usernameCheckSchema.parse(data))
  .handler(async ({ data }) => {
    const normalized = data.username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(normalized)) return { available: false };

    const supabase = getSupabasePublic();
    let query = supabase
      .from("profiles")
      .select("id")
      .ilike("username", normalized);
    if (data.excludeUserId) query = query.neq("id", data.excludeUserId);
    const { data: rows, error } = await query.limit(1);
    if (error) throw new Error(error.message);
    return { available: rows.length === 0 };
  });

export const createProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => createProfileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const {
      username,
      display_name,
      language = "pt-BR",
      theme_preference = "system",
      favorite_game_ids = [],
    } = data;

    const { data: profile, error } = await context.supabase
      .from("profiles")
      .insert({
        id: context.userId,
        username,
        display_name,
        language,
        theme_preference,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (favorite_game_ids.length > 0) {
      const rows = favorite_game_ids.map((gameId) => ({
        user_id: context.userId,
        game_id: gameId,
        profile_data: { favorite: true },
        visibility: "public",
      }));
      const { error: favoritesError } = await context.supabase
        .from("game_profiles")
        .upsert(rows, { onConflict: "user_id,game_id" });
      if (favoritesError) throw new Error(favoritesError.message);
    }

    return profile;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => updateProfileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const updatePayload = { ...data, updated_at: new Date().toISOString() } as Database["public"]["Tables"]["profiles"]["Update"];
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const followUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => followSchema.parse(data))
  .handler(async ({ context, data }) => {
    if (data.following_id === context.userId) throw new Error("cannot_follow_self");
    const { error } = await context.supabase.from("follows").insert({
      follower_id: context.userId,
      following_id: data.following_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unfollowUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => followSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("follows")
      .delete()
      .eq("follower_id", context.userId)
      .eq("following_id", data.following_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isFollowing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => followSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("follows")
      .select("id")
      .eq("follower_id", context.userId)
      .eq("following_id", data.following_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { following: !!rows };
  });
