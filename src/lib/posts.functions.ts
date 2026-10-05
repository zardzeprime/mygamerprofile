import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabasePublic } from "./supabase.server";

const listPostsSchema = z.object({
  gameId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
});
const createPostSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  game_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
});
const updatePostSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});
const deletePostSchema = z.object({ id: z.string().uuid() });
const listCommentsSchema = z.object({ postId: z.string().uuid() });
const createCommentSchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});
const deleteCommentSchema = z.object({ id: z.string().uuid() });
const reactionSchema = z.object({ post_id: z.string().uuid() });

export const listPosts = createServerFn({ method: "GET" })
  .validator((data) => listPostsSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const pageSize = 20;
    const from = ((data.page ?? 1) - 1) * pageSize;
    let query = supabase
      .from("posts")
      .select(
        "*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url), game:games!posts_game_id_fkey(id, name, slug), reactions:reactions(user_id, reaction_type)",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (data.gameId) query = query.eq("game_id", data.gameId);
    if (data.authorId) query = query.eq("author_id", data.authorId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows;
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => createPostSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: post, error } = await context.supabase
      .from("posts")
      .insert({
        author_id: context.userId,
        body: data.body,
        game_id: data.game_id ?? null,
        image_url: data.image_url ?? null,
      })
      .select(
        "*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url), game:games!posts_game_id_fkey(id, name, slug), reactions:reactions(user_id, reaction_type)",
      )
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => updatePostSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: post, error } = await context.supabase
      .from("posts")
      .update({ body: data.body, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return post;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => deletePostSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("posts")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listComments = createServerFn({ method: "GET" })
  .validator((data) => listCommentsSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabasePublic();
    const { data: rows, error } = await supabase
      .from("comments")
      .select("*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)")
      .eq("post_id", data.postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows;
  });

export const createComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => createCommentSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: comment, error } = await context.supabase
      .from("comments")
      .insert({
        post_id: data.post_id,
        author_id: context.userId,
        body: data.body,
      })
      .select("*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)")
      .single();
    if (error) throw new Error(error.message);
    return comment;
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => deleteCommentSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleReaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => reactionSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: existing, error: lookupError } = await context.supabase
      .from("reactions")
      .select("id")
      .eq("post_id", data.post_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);

    if (existing) {
      const { error } = await context.supabase.from("reactions").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    }

    const { error } = await context.supabase.from("reactions").insert({
      post_id: data.post_id,
      user_id: context.userId,
      reaction_type: "like",
    });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

export const getUserReactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => reactionSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("reactions")
      .select("post_id")
      .eq("user_id", context.userId)
      .eq("post_id", data.post_id);
    if (error) throw new Error(error.message);
    return { liked: rows.length > 0 };
  });
