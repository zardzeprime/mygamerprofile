import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GAMES, type GameProfileField } from "@/config/games";
import { getSupabasePublic } from "./supabase.server";

const slugSchema = z.object({ slug: z.string() });
const gameProfileSchema = z.object({ username: z.string(), slug: z.string() });
const upsertGameProfileSchema = z.object({
  game_id: z.string(),
  profile_data: z.record(z.unknown()),
  visibility: z.string().optional(),
});

export const getGames = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("games")
    .select("*, game_modules(*)")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const getGameBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { data: game, error } = await supabase
      .from("games")
      .select("*, game_modules(*)")
      .eq("slug", data.slug)
      .eq("active", true)
      .single();
    if (error) throw new Error(error.message);
    return game;
  });

export const getGameProfile = createServerFn({ method: "GET" })
  .inputValidator((data) => gameProfileSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .ilike("username", data.username)
      .single();
    if (profileError) throw new Error(profileError.message);

    const game = GAMES.find((g) => g.slug === data.slug);
    if (!game) throw new Error("game_not_found");

    const { data: gameProfile, error: gpError } = await supabase
      .from("game_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .eq("game_id", game.id)
      .maybeSingle();
    if (gpError) throw new Error(gpError.message);

    return {
      profile,
      game,
      gameProfile: gameProfile ? { ...gameProfile, game_slug: game.slug } : null,
    };
  });

export const upsertGameProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => upsertGameProfileSchema.parse(data))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const { game_id, profile_data, visibility = "public" } = data;
    const jsonData = profile_data as unknown as Record<string, unknown>;

    const { data: existing } = await supabase
      .from("game_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("game_id", game_id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("game_profiles")
        .update({ profile_data: jsonData as any, visibility })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: inserted, error } = await supabase
      .from("game_profiles")
      .insert({ user_id: context.userId, game_id, profile_data: jsonData as any, visibility })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });
