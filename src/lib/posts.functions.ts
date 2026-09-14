import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const POSTS_PAGE = 20;

export const listPosts = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { gameId?: string; page?: number } }) => {
    const supabase = getSupabasePublic();
    let query = supabase
      .from("posts")
      .select(
        "*, author:profiles(id, username, display_name, avatar_url), game:games(id, slug, name), reactions(count)",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(
        ((data.page ?? 1) - 1) * POSTS_PAGE,
        (data.page ?? 1) * POSTS_PAGE - 1,
      );
    if (data.gameId) query = query.eq("game_id", data.gameId);
    const { data: posts, error } = await query;
    if (error) throw new Error(error.message);
    return posts ?? [];
  },
);

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { body, game_id, image_url } = data as {
      body: string;
      game_id?: string;
      image_url?: string;
    };
    if (!body || body.length > 2000) throw new Error("invalid_body");
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("posts")
      .insert({ author_id: context.userId, body, game_id: game_id ?? null, image_url: image_url ?? null })
      .select(
        "*, author:profiles(id, username, display_name, avatar_url), game:games(id, slug, name)",
      )
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id, body } = data as { id: string; body: string };
    if (!body || body.length > 2000) throw new Error("invalid_body");
    const supabase = context.supabase;
    const { data: post, error } = await supabase
      .from("posts")
      .update({ body })
      .eq("id", id)
      .eq("author_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id } = data as { id: string };
    const supabase = context.supabase;
    const { error } = await supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listComments = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: { postId: string } }) => {
    const supabase = getSupabasePublic();
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*, author:profiles(id, username, display_name, avatar_url)")
      .eq("post_id", data.postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return comments ?? [];
  },
);

export const createComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { post_id, body } = data as { post_id: string; body: string };
    if (!body || body.length > 1000) throw new Error("invalid_body");
    const supabase = context.supabase;
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ post_id, author_id: context.userId, body })
      .select("*, author:profiles(id, username, display_name, avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    return comment;
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { id } = data as { id: string };
    const supabase = context.supabase;
    const { error } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { post_id, reaction_type = "like" } = data as {
      post_id: string;
      reaction_type?: string;
    };
    const supabase = context.supabase;
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("user_id", context.userId)
      .eq("post_id", post_id)
      .eq("reaction_type", reaction_type)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    }

    const { error } = await supabase
      .from("reactions")
      .insert({ user_id: context.userId, post_id, reaction_type });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

export const getUserReactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { post_ids } = data as { post_ids: string[] };
    const supabase = context.supabase;
    const { data: rows, error } = await supabase
      .from("reactions")
      .select("post_id, reaction_type")
      .eq("user_id", context.userId)
      .in("post_id", post_ids);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
