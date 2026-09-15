import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GAMES } from "@/config/games";
import { getSupabasePublic } from "./supabase.server";

const slugSchema = z.object({ slug: z.string().trim().min(1).max(100) });
const gameProfileSchema = z.object({
  username: z.string().trim().min(3).max(20),
  slug: z.string().trim().min(1).max(100),
});
const upsertGameProfileSchema = z.object({
  game_id: z.string().uuid(),
  profile_data: z.record(z.unknown()),
  visibility: z.enum(["public", "private"]).optional(),
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

    const configuredGame = GAMES.find((candidate) => candidate.slug === data.slug);
    if (!configuredGame) throw new Error("game_not_found");

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id,slug,name")
      .eq("slug", configuredGame.slug)
      .eq("active", true)
      .maybeSingle();
    if (gameError) throw new Error(gameError.message);
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
    const { game_id, profile_data, visibility = "public" } = data;

    const { data: databaseGame, error: gameError } = await context.supabase
      .from("games")
      .select("id,slug")
      .eq("id", game_id)
      .eq("active", true)
      .maybeSingle();
    if (gameError) throw new Error(gameError.message);

    const configuredGame = GAMES.find((game) => game.slug === databaseGame?.slug);
    if (!configuredGame || !databaseGame) throw new Error("game_not_supported");

    const allowedKeys = new Set(configuredGame.profileFields.map((field) => field.key));
    const sanitizedData = Object.fromEntries(
      Object.entries(profile_data).filter(([key]) => allowedKeys.has(key)),
    );

    const { data: existing, error: existingError } = await context.supabase
      .from("game_profiles")
      .select("id,profile_data")
      .eq("user_id", context.userId)
      .eq("game_id", game_id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    const existingData =
      existing?.profile_data &&
      typeof existing.profile_data === "object" &&
      !Array.isArray(existing.profile_data)
        ? existing.profile_data
        : {};

    if (existing) {
      const { data: updated, error } = await context.supabase
        .from("game_profiles")
        .update({
          profile_data: { ...existingData, ...sanitizedData },
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("user_id", context.userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: inserted, error } = await context.supabase
      .from("game_profiles")
      .insert({
        user_id: context.userId,
        game_id,
        profile_data: sanitizedData,
        visibility,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });
