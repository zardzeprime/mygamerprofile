import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export const getProfileByUsername = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { username: string } }) => {
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
  },
);

export const getCurrentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = getSupabasePublic();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const checkUsernameAvailable = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { username: string; excludeUserId?: string } }) => {
    if (!USERNAME_REGEX.test(data.username)) return { available: false };
    const supabase = getSupabasePublic();
    let query = supabase.from("profiles").select("id").ilike("username", data.username);
    if (data.excludeUserId) query = query.neq("id", data.excludeUserId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { available: rows.length === 0 };
  },
);

export const createProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { username, display_name, language = "pt-BR", theme_preference = "system" } = data as {
      username: string;
      display_name: string;
      language?: string;
      theme_preference?: string;
    };
    if (!USERNAME_REGEX.test(username)) throw new Error("invalid_username");
    const supabase = context.supabase;
    const { data: profile, error } = await supabase
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
  .handler(async ({ context, data }) => {
    const payload = data as Record<string, unknown>;
    if (payload.username && !USERNAME_REGEX.test(payload.username as string)) {
      throw new Error("invalid_username");
    }
    const supabase = context.supabase;
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const followUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { following_id } = data as { following_id: string };
    if (following_id === context.userId) throw new Error("cannot_follow_self");
    const supabase = context.supabase;
    const { error } = await supabase.from("follows").insert({
      follower_id: context.userId,
      following_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unfollowUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { following_id } = data as { following_id: string };
    const supabase = context.supabase;
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", context.userId)
      .eq("following_id", following_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isFollowing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { following_id } = data as { following_id: string };
    const supabase = context.supabase;
    const { data: rows, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", context.userId)
      .eq("following_id", following_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { following: !!rows };
  });
