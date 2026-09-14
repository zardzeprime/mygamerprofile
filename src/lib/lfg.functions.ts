import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const listLfgSchema = z.object({
  gameId: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  status: z.string().optional(),
  page: z.number().default(1),
});
const createLfgSchema = z.object({
  game_id: z.string(),
  platform: z.string(),
  region: z.string().optional(),
  language: z.string().optional(),
  mode: z.string().optional(),
  description: z.string(),
  mic_required: z.boolean().optional(),
  slots_total: z.number().optional(),
  slots_open: z.number().optional(),
  expires_at: z.string().optional(),
});
const updateLfgSchema = z.object({ id: z.string() }).catchall(z.unknown());
const closeLfgSchema = z.object({ id: z.string() });

export const listLfgPosts = createServerFn({ method: "GET" })
  .inputValidator((data) => listLfgSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const pageSize = 20;
    const from = ((data.page ?? 1) - 1) * pageSize;
    let query = supabase
      .from("lfg_posts")
      .select(
        "*, game:games!lfg_posts_game_id_fkey(id, name, slug), author:profiles!lfg_posts_user_id_fkey(id, username, display_name, avatar_url)",
      )
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (data.gameId) query = query.eq("game_id", data.gameId);
    if (data.platform) query = query.eq("platform", data.platform);
    if (data.language) query = query.eq("language", data.language);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows;
  });

export const createLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createLfgSchema.parse(data))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("lfg_posts")
      .insert({
        user_id: context.userId,
        game_id: data.game_id,
        platform: data.platform,
        region: data.region ?? null,
        language: data.language ?? null,
        mode: data.mode ?? null,
        description: data.description,
        mic_required: data.mic_required ?? false,
        slots_total: data.slots_total ?? 1,
        slots_open: data.slots_open ?? data.slots_total ?? 1,
        expires_at: data.expires_at ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const updateLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateLfgSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...updates } = data as Record<string, unknown> & { id: string };
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("lfg_posts")
      .update(updates as any)
      .eq("id", id)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const closeLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => closeLfgSchema.parse(data))
  .handler(async ({ context, data }) => {
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("lfg_posts")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });
