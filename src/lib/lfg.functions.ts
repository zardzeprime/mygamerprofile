import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const LFG_STATUSES = ["open", "closed", "expired"] as const;

const listLfgSchema = z.object({
  gameId: z.string().uuid().optional(),
  platform: z.string().trim().max(40).optional(),
  language: z.string().trim().max(16).optional(),
  status: z.enum(LFG_STATUSES).optional(),
  page: z.number().int().min(1).default(1),
});
const createLfgSchema = z.object({
  game_id: z.string().uuid(),
  platform: z.string().trim().min(1).max(40),
  region: z.string().trim().max(80).optional(),
  language: z.string().trim().max(16).optional(),
  mode: z.string().trim().max(80).optional(),
  description: z.string().trim().min(1).max(1000),
  mic_required: z.boolean().optional(),
  slots_total: z.number().int().min(1).max(99).optional(),
  slots_open: z.number().int().min(0).max(99).optional(),
  expires_at: z.string().datetime().optional(),
});
const updateLfgSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().trim().min(1).max(40).optional(),
  region: z.string().trim().max(80).nullable().optional(),
  language: z.string().trim().max(16).nullable().optional(),
  mode: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  mic_required: z.boolean().optional(),
  slots_total: z.number().int().min(1).max(99).optional(),
  slots_open: z.number().int().min(0).max(99).optional(),
  expires_at: z.string().datetime().nullable().optional(),
});
const closeLfgSchema = z.object({ id: z.string().uuid() });

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
    const slotsTotal = data.slots_total ?? 1;
    const slotsOpen = Math.min(data.slots_open ?? slotsTotal, slotsTotal);
    const { data: post, error } = await context.supabase
      .from("lfg_posts")
      .insert({
        user_id: context.userId,
        game_id: data.game_id,
        platform: data.platform,
        region: data.region || null,
        language: data.language || null,
        mode: data.mode || null,
        description: data.description,
        mic_required: data.mic_required ?? false,
        slots_total: slotsTotal,
        slots_open: slotsOpen,
        expires_at: data.expires_at ?? null,
      })
      .select(
        "*, game:games!lfg_posts_game_id_fkey(id, name, slug), author:profiles!lfg_posts_user_id_fkey(id, username, display_name, avatar_url)",
      )
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const updateLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateLfgSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...updates } = data;
    if (updates.slots_total !== undefined && updates.slots_open !== undefined && updates.slots_open > updates.slots_total) {
      throw new Error("invalid_slot_count");
    }
    const { data: post, error } = await context.supabase
      .from("lfg_posts")
      .update({ ...updates, updated_at: new Date().toISOString() })
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
    const { data: post, error } = await context.supabase
      .from("lfg_posts")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });
