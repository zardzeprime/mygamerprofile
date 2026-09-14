import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const LFG_PAGE = 20;

export const listLfgPosts = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { gameId?: string; platform?: string; language?: string; status?: string; page?: number } }) => {
    const supabase = getSupabasePublic();
    let query = supabase
      .from("lfg_posts")
      .select("*, author:profiles(id, username, display_name, avatar_url), game:games(id, slug, name)")
      .order("created_at", { ascending: false })
      .range(
        ((data.page ?? 1) - 1) * LFG_PAGE,
        (data.page ?? 1) * LFG_PAGE - 1,
      );
    if (data.gameId) query = query.eq("game_id", data.gameId);
    if (data.platform) query = query.eq("platform", data.platform);
    if (data.language) query = query.eq("language", data.language);
    if (data.status) query = query.eq("status", data.status);
    const { data: posts, error } = await query;
    if (error) throw new Error(error.message);
    return posts ?? [];
  },
);

export const createLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const payload = data as {
      game_id: string;
      platform: string;
      region?: string;
      language?: string;
      mode?: string;
      description: string;
      mic_required?: boolean;
      slots_total?: number;
      slots_open?: number;
      expires_at?: string;
    };
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("lfg_posts")
      .insert({ ...payload, user_id: context.userId })
      .select("*, author:profiles(id, username, display_name, avatar_url), game:games(id, slug, name)")
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const updateLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id, ...updates } = data as { id: string } & Record<string, unknown>;
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("lfg_posts")
      .update(updates)
      .eq("id", id)
      .eq("user_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const closeLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id } = data as { id: string };
    const supabase = context.supabase;
    const { error } = await supabase
      .from("lfg_posts")
      .update({ status: "closed" })
      .eq("id", id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
