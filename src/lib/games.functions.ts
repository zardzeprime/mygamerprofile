import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

export const getGames = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data: games, error } = await supabase
    .from("games")
    .select("*, game_modules(module_key, enabled, sort_order)")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return games ?? [];
});

export const getGameBySlug = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { slug: string } }) => {
    const supabase = getSupabasePublic();
    const { data: game, error } = await supabase
      .from("games")
      .select("*, game_modules(module_key, enabled, sort_order)")
      .eq("slug", data.slug)
      .eq("active", true)
      .single();
    if (error) throw new Error(error.message);
    return game;
  },
);

export const getGameProfile = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { username: string; slug: string } }) => {
    const supabase = getSupabasePublic();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .ilike("username", data.username)
      .single();
    if (profileError) throw new Error(profileError.message);

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, slug, name")
      .eq("slug", data.slug)
      .single();
    if (gameError) throw new Error(gameError.message);

    const { data: gameProfile, error } = await supabase
      .from("game_profiles")
      .select("*, game_slug:games!inner(slug)")
      .eq("user_id", profile.id)
      .eq("game_id", game.id)
      .single();
    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return { profile, game, gameProfile };
  },
);

export const upsertGameProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { game_id, profile_data, visibility = "public" } = data as {
      game_id: string;
      profile_data: Record<string, unknown>;
      visibility?: string;
    };
    const supabase = context.supabase;
    const { data: existing } = await supabase
      .from("game_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("game_id", game_id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("game_profiles")
        .update({ profile_data, visibility })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: inserted, error } = await supabase
      .from("game_profiles")
      .insert({ user_id: context.userId, game_id, profile_data, visibility })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });
