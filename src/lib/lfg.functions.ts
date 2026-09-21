import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublic } from "./supabase.server";

const LFG_STATUSES = ["open", "closed", "expired"] as const;

const listLfgSchema = z.object({
  gameId: z.string().uuid().optional(),
  platform: z.string().trim().max(40).optional(),
  language: z.string().trim().max(16).optional(),
  status: z.enum(LFG_STATUSES).optional(),
  page: z.number().int().min(1).default(1),
});

const createLfgSchema = z
  .object({
    game_id: z.string().uuid().nullable().optional(),
    external_game_source: z.enum(["steam", "riot"]).nullable().optional(),
    external_game_id: z.string().trim().max(120).nullable().optional(),
    external_game_name: z.string().trim().max(160).nullable().optional(),
    external_game_image_url: z.string().trim().url().max(1000).nullable().optional(),
    title: z.string().trim().min(3).max(120),
    platform: z.string().trim().min(1).max(40),
    region: z.string().trim().max(80).optional(),
    language: z.string().trim().max(16).optional(),
    mode: z.string().trim().max(80).optional(),
    description: z.string().trim().min(1).max(1000),
    mic_required: z.boolean().optional(),
    slots_total: z.number().int().min(2).max(99),
    scheduled_for: z.string().datetime().nullable().optional(),
    min_age: z.number().int().min(13).max(99),
    max_age: z.number().int().min(13).max(99),
    expires_at: z.string().datetime().optional(),
  })
  .refine((data) => data.min_age <= data.max_age, { message: "invalid_age_range" })
  .refine(
    (data) =>
      Boolean(
        data.game_id ||
          (data.external_game_source && data.external_game_id && data.external_game_name),
      ),
    { message: "game_reference_required" },
  );

const updateLfgSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(120).optional(),
  platform: z.string().trim().min(1).max(40).optional(),
  region: z.string().trim().max(80).nullable().optional(),
  language: z.string().trim().max(16).nullable().optional(),
  mode: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  mic_required: z.boolean().optional(),
  slots_total: z.number().int().min(2).max(99).optional(),
  slots_open: z.number().int().min(0).max(99).optional(),
  scheduled_for: z.string().datetime().nullable().optional(),
  min_age: z.number().int().min(13).max(99).optional(),
  max_age: z.number().int().min(13).max(99).optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

const closeLfgSchema = z.object({ id: z.string().uuid() });
const requestMatchSchema = z.object({
  postId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
const respondMatchSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
});
const cancelMatchSchema = z.object({ applicationId: z.string().uuid() });
const messageListSchema = z.object({ applicationId: z.string().uuid() });
const sendMessageSchema = z.object({
  applicationId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

async function readVerifiedAge(db: unknown, userId: string) {
  const typedDb = db as {
    from: (table: "account_age_verifications" | "account_age_data") => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
        };
      };
    };
  };

  const [verificationResult, ageResult] = await Promise.all([
    typedDb
      .from("account_age_verifications")
      .select("status,verified_at,expires_at,provider_name")
      .eq("user_id", userId)
      .maybeSingle(),
    typedDb
      .from("account_age_data")
      .select("birth_date,age_assurance_method")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (verificationResult.error || ageResult.error) {
    throw new Error("LFG_VERIFICATION_LOOKUP_FAILED");
  }

  const verification = verificationResult.data;
  const ageData = ageResult.data;
  const expiresAt =
    typeof verification?.["expires_at"] === "string" ? new Date(verification["expires_at"]) : null;
  const verified =
    verification?.["status"] === "verified" &&
    typeof verification?.["verified_at"] === "string" &&
    (!expiresAt || expiresAt.getTime() > Date.now()) &&
    ageData?.["age_assurance_method"] === "provider_assured";

  const birthDate =
    typeof ageData?.["birth_date"] === "string" ? new Date(ageData["birth_date"] + "T00:00:00Z") : null;
  let age: number | null = null;
  if (birthDate && Number.isFinite(birthDate.getTime())) {
    const now = new Date();
    age = now.getUTCFullYear() - birthDate.getUTCFullYear();
    const birthdayPassed =
      now.getUTCMonth() > birthDate.getUTCMonth() ||
      (now.getUTCMonth() === birthDate.getUTCMonth() &&
        now.getUTCDate() >= birthDate.getUTCDate());
    if (!birthdayPassed) age -= 1;
  }

  return {
    verified,
    age,
    provider:
      typeof verification?.["provider_name"] === "string"
        ? verification["provider_name"]
        : null,
  };
}

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

export const getLfgVerificationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readVerifiedAge(context.supabase, context.userId));

export const createLfgPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createLfgSchema.parse(data))
  .handler(async ({ context, data }) => {
    const slotsTotal = data.slots_total;
    const slotsOpen = Math.max(0, slotsTotal - 1);
    const { data: post, error } = await context.supabase
      .from("lfg_posts")
      .insert({
        user_id: context.userId,
        game_id: data.game_id ?? null,
        external_game_source: data.game_id ? null : data.external_game_source ?? null,
        external_game_id: data.game_id ? null : data.external_game_id ?? null,
        external_game_name: data.game_id ? null : data.external_game_name ?? null,
        external_game_image_url: data.game_id ? null : data.external_game_image_url ?? null,
        title: data.title,
        platform: data.platform,
        region: data.region || null,
        language: data.language || null,
        mode: data.mode || null,
        description: data.description,
        mic_required: data.mic_required ?? false,
        slots_total: slotsTotal,
        slots_open: slotsOpen,
        scheduled_for: data.scheduled_for ?? null,
        min_age: data.min_age,
        max_age: data.max_age,
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
    if (
      updates.slots_total !== undefined &&
      updates.slots_open !== undefined &&
      updates.slots_open > updates.slots_total
    ) {
      throw new Error("invalid_slot_count");
    }
    if (
      updates.min_age !== undefined &&
      updates.max_age !== undefined &&
      updates.min_age > updates.max_age
    ) {
      throw new Error("invalid_age_range");
    }

    const updatePayload: Database["public"]["Tables"]["lfg_posts"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.platform !== undefined) updatePayload.platform = updates.platform;
    if (updates.region !== undefined) updatePayload.region = updates.region;
    if (updates.language !== undefined) updatePayload.language = updates.language;
    if (updates.mode !== undefined) updatePayload.mode = updates.mode;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.mic_required !== undefined) updatePayload.mic_required = updates.mic_required;
    if (updates.slots_total !== undefined) updatePayload.slots_total = updates.slots_total;
    if (updates.slots_open !== undefined) updatePayload.slots_open = updates.slots_open;
    if (updates.scheduled_for !== undefined) updatePayload.scheduled_for = updates.scheduled_for;
    if (updates.min_age !== undefined) updatePayload.min_age = updates.min_age;
    if (updates.max_age !== undefined) updatePayload.max_age = updates.max_age;
    if (updates.expires_at !== undefined) updatePayload.expires_at = updates.expires_at;

    const { data: post, error } = await context.supabase
      .from("lfg_posts")
      .update(updatePayload)
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

export const requestLfgMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => requestMatchSchema.parse(data))
  .handler(async ({ context, data }) => {
    const verification = await readVerifiedAge(context.supabase, context.userId);
    if (!verification.verified || verification.age === null) {
      throw new Error("LFG_VERIFICATION_REQUIRED");
    }

    const { data: post, error: postError } = await context.supabase
      .from("lfg_posts")
      .select("id,user_id,status,slots_open,min_age,max_age")
      .eq("id", data.postId)
      .maybeSingle();
    if (postError || !post) throw new Error("LFG_POST_NOT_FOUND");
    if (post.user_id === context.userId) throw new Error("LFG_CANNOT_MATCH_OWN_GROUP");
    if (post.status !== "open" || post.slots_open <= 0) throw new Error("LFG_GROUP_UNAVAILABLE");
    if (verification.age < post.min_age || verification.age > post.max_age) {
      throw new Error("LFG_AGE_MISMATCH");
    }

    const { data: application, error } = await context.supabase
      .from("lfg_applications")
      .insert({
        lfg_post_id: data.postId,
        applicant_user_id: context.userId,
        note: data.note || null,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("LFG_MATCH_ALREADY_REQUESTED");
      throw new Error(error.message);
    }
    return application;
  });

export const listMyLfgApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const selectShape =
      "*, applicant:profiles!lfg_applications_applicant_user_id_fkey(id,username,display_name,avatar_url), post:lfg_posts!lfg_applications_lfg_post_id_fkey(id,user_id,title,platform,region,language,mode,description,scheduled_for,min_age,max_age,slots_total,slots_open,status,external_game_name,external_game_image_url,game:games!lfg_posts_game_id_fkey(id,name,slug),author:profiles!lfg_posts_user_id_fkey(id,username,display_name,avatar_url))";

    const { data: ownPosts, error: postsError } = await context.supabase
      .from("lfg_posts")
      .select("id")
      .eq("user_id", context.userId);
    if (postsError) throw new Error(postsError.message);

    const incomingPromise = ownPosts?.length
      ? context.supabase
          .from("lfg_applications")
          .select(selectShape)
          .in("lfg_post_id", ownPosts.map((post) => post.id))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const outgoingPromise = context.supabase
      .from("lfg_applications")
      .select(selectShape)
      .eq("applicant_user_id", context.userId)
      .order("created_at", { ascending: false });

    const [incoming, outgoing] = await Promise.all([incomingPromise, outgoingPromise]);
    if (incoming.error) throw new Error(incoming.error.message);
    if (outgoing.error) throw new Error(outgoing.error.message);

    return {
      incoming: incoming.data ?? [],
      outgoing: outgoing.data ?? [],
    };
  });

export const respondLfgApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => respondMatchSchema.parse(data))
  .handler(async ({ context, data }) => {
    const verification = await readVerifiedAge(context.supabase, context.userId);
    if (!verification.verified) throw new Error("LFG_VERIFICATION_REQUIRED");

    const { data: application, error: appError } = await context.supabase
      .from("lfg_applications")
      .select("id,lfg_post_id,status")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (appError || !application) throw new Error("LFG_APPLICATION_NOT_FOUND");
    if (application.status !== "pending") throw new Error("LFG_APPLICATION_FINAL");

    const { data: post, error: postError } = await context.supabase
      .from("lfg_posts")
      .select("id,user_id")
      .eq("id", application.lfg_post_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (postError || !post) throw new Error("LFG_OWNER_REQUIRED");

    const { data: updated, error } = await context.supabase
      .from("lfg_applications")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.applicationId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const cancelLfgApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => cancelMatchSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: updated, error } = await context.supabase
      .from("lfg_applications")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", data.applicationId)
      .eq("applicant_user_id", context.userId)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const listLfgMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => messageListSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("lfg_dm_messages")
      .select("*")
      .eq("application_id", data.applicationId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);

    await context.supabase
      .from("lfg_dm_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("application_id", data.applicationId)
      .eq("recipient_user_id", context.userId)
      .is("read_at", null);

    return rows ?? [];
  });

export const sendLfgMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => sendMessageSchema.parse(data))
  .handler(async ({ context, data }) => {
    const verification = await readVerifiedAge(context.supabase, context.userId);
    if (!verification.verified) throw new Error("LFG_VERIFICATION_REQUIRED");

    const { data: application, error: appError } = await context.supabase
      .from("lfg_applications")
      .select("id,lfg_post_id,applicant_user_id,status")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (appError || !application || application.status !== "accepted") {
      throw new Error("LFG_MATCH_REQUIRED");
    }

    const { data: post, error: postError } = await context.supabase
      .from("lfg_posts")
      .select("user_id")
      .eq("id", application.lfg_post_id)
      .maybeSingle();
    if (postError || !post) throw new Error("LFG_POST_NOT_FOUND");

    let recipientUserId: string;
    if (context.userId === application.applicant_user_id) {
      recipientUserId = post.user_id;
    } else if (context.userId === post.user_id) {
      recipientUserId = application.applicant_user_id;
    } else {
      throw new Error("LFG_MATCH_REQUIRED");
    }

    const { data: message, error } = await context.supabase
      .from("lfg_dm_messages")
      .insert({
        application_id: application.id,
        sender_user_id: context.userId,
        recipient_user_id: recipientUserId,
        body: data.body,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return message;
  });
