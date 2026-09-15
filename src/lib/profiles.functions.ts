import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const APP_LANGUAGES = ["pt-BR", "en", "es"] as const;
const THEME_PREFERENCES = ["light", "dark", "system"] as const;
const PROFILE_VISIBILITIES = ["public", "private"] as const;

const usernameSchema = z.object({ username: z.string().trim().min(3).max(20) });
const usernameCheckSchema = z.object({
  username: z.string().trim().min(3).max(20),
  excludeUserId: z.string().uuid().optional(),
});
const createProfileSchema = z.object({
  username: z.string().regex(USERNAME_REGEX),
  display_name: z.string().trim().min(1).max(80),
  language: z.enum(APP_LANGUAGES).optional(),
  theme_preference: z.enum(THEME_PREFERENCES).optional(),
});
const updateProfileSchema = z.object({
  username: z.string().regex(USERNAME_REGEX).optional(),
  display_name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  language: z.enum(APP_LANGUAGES).optional(),
  theme_preference: z.enum(THEME_PREFERENCES).optional(),
  visibility: z.enum(PROFILE_VISIBILITIES).optional(),
});
const followSchema = z.object({ following_id: z.string().uuid() });

export const getProfileByUsername = createServerFn({ method: "GET" })
  .inputValidator((data) => usernameSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "*, followers:follows!follows_following_id_fkey(count), following:follows!follows_follower_id_fkey(count)",
      )
      .ilike("username", data.username)
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const getCurrentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const checkUsernameAvailable = createServerFn({ method: "GET" })
  .inputValidator((data) => usernameCheckSchema.parse(data))
  .handler(async ({ data }) => {
    if (!USERNAME_REGEX.test(data.username)) return { available: false };
    const supabase = getSupabasePublic();
    let query = supabase.from("profiles").select("id").ilike("username", data.username);
    if (data.excludeUserId) query = query.neq("id", data.excludeUserId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { available: rows.length === 0 };
  });

export const createProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createProfileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { username, display_name, language = "pt-BR", theme_preference = "system" } = data;
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
    return profile;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateProfileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const followUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => followSchema.parse(data))
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
  .inputValidator((data) => followSchema.parse(data))
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
  .inputValidator((data) => followSchema.parse(data))
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
