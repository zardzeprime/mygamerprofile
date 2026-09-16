import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildNexusSystemPrompt, selectNexusCores } from "@/lib/nexus/prompt";
import {
  completeWithNexusRouter,
  getNexusProviderStatus,
  type NexusChatMessage,
} from "@/lib/nexus/provider-router.server";
import { NEXUS_TOOL_BRIDGES } from "@/lib/nexus/tool-bridges";

const modeSchema = z.enum(["gaming", "development"]);
const threadSchema = z.object({ threadId: z.string().uuid() });
const sendSchema = z.object({
  threadId: z.string().uuid().optional(),
  mode: modeSchema.default("gaming"),
  message: z.string().trim().min(1).max(6000),
});

async function isAdmin(db: any, userId: string) {
  const { data, error } = await db
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function enforceNexusRateLimit(db: any, userId: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await db
    .from("nexus_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);

  if (error) throw new Error(error.message);
  if ((count ?? 0) >= 12) {
    throw new Error("NEXUS rate limit reached. Wait a moment before sending another message.");
  }
}

function titleFromMessage(message: string) {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > 72 ? `${oneLine.slice(0, 69)}...` : oneLine;
}

export const getNexusStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as any;
    const admin = await isAdmin(db, context.userId);
    const providers = getNexusProviderStatus().map((provider) => ({
      id: provider.id,
      configured: provider.configured,
      model: provider.model,
    }));

    return {
      isAdmin: admin,
      providers,
      tools: admin
        ? Object.values(NEXUS_TOOL_BRIDGES).map((tool) => ({
            id: tool.id,
            name: tool.name,
            transport: tool.transport,
            status: tool.status,
            destructiveActionsRequireApproval: tool.destructiveActionsRequireApproval,
          }))
        : [],
    };
  });

export const listNexusThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase as any;
    const { data, error } = await db
      .from("nexus_threads")
      .select("id,title,mode,created_at,updated_at,last_message_at")
      .eq("user_id", context.userId)
      .order("last_message_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listNexusMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => threadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const db = context.supabase as any;
    const { data: thread, error: threadError } = await db
      .from("nexus_threads")
      .select("id")
      .eq("id", data.threadId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (threadError) throw new Error(threadError.message);
    if (!thread) throw new Error("NEXUS thread not found");

    const { data: messages, error } = await db
      .from("nexus_messages")
      .select("id,role,content,core_ids,provider,model,created_at")
      .eq("thread_id", data.threadId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return messages ?? [];
  });

export const deleteNexusThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => threadSchema.parse(data))
  .handler(async ({ context, data }) => {
    const db = context.supabase as any;
    const { error } = await db
      .from("nexus_threads")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendNexusMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => sendSchema.parse(data))
  .handler(async ({ context, data }) => {
    const db = context.supabase as any;
    const admin = await isAdmin(db, context.userId);
    if (data.mode === "development" && !admin) {
      throw new Error("Development mode is restricted to MGP administrators.");
    }

    await enforceNexusRateLimit(db, context.userId);

    let threadId = data.threadId;
    let threadMode = data.mode;
    let isNewThread = false;

    if (threadId) {
      const { data: thread, error } = await db
        .from("nexus_threads")
        .select("id,mode")
        .eq("id", threadId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!thread) throw new Error("NEXUS thread not found");
      threadMode = thread.mode as "gaming" | "development";
      if (threadMode === "development" && !admin) {
        throw new Error("Development mode is restricted to MGP administrators.");
      }
    } else {
      const { data: thread, error } = await db
        .from("nexus_threads")
        .insert({
          user_id: context.userId,
          title: titleFromMessage(data.message),
          mode: data.mode,
        })
        .select("id,mode")
        .single();
      if (error) throw new Error(error.message);
      threadId = thread.id;
      threadMode = thread.mode;
      isNewThread = true;
    }

    const promptMode = threadMode === "development" ? "development" : "gamer";
    const coreIds = selectNexusCores(data.message, promptMode);

    const { error: userMessageError } = await db.from("nexus_messages").insert({
      thread_id: threadId,
      user_id: context.userId,
      role: "user",
      content: data.message,
      core_ids: coreIds,
      metadata: { mode: threadMode },
    });
    if (userMessageError) throw new Error(userMessageError.message);

    const { data: historyRows, error: historyError } = await db
      .from("nexus_messages")
      .select("role,content")
      .eq("thread_id", threadId)
      .eq("user_id", context.userId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(24);
    if (historyError) throw new Error(historyError.message);

    const history: NexusChatMessage[] = (historyRows ?? [])
      .reverse()
      .map((row: { role: string; content: string }) => ({
        role: row.role === "assistant" ? "assistant" : "user",
        content: row.content,
      }));

    const system = buildNexusSystemPrompt({
      mode: promptMode,
      isAdmin: admin,
      coreIds,
    });

    const completion = await completeWithNexusRouter({
      system,
      messages: history,
      effort: threadMode === "development" ? "high" : "medium",
      maxOutputTokens: threadMode === "development" ? 2400 : 1600,
    });

    const { data: assistantMessage, error: assistantError } = await db
      .from("nexus_messages")
      .insert({
        thread_id: threadId,
        user_id: context.userId,
        role: "assistant",
        content: completion.text,
        core_ids: coreIds,
        provider: completion.provider,
        model: completion.model,
        metadata: {
          mode: threadMode,
          attemptedProviders: completion.attemptedProviders,
        },
      })
      .select("id,role,content,core_ids,provider,model,created_at")
      .single();
    if (assistantError) throw new Error(assistantError.message);

    const now = new Date().toISOString();
    const updatePayload: Record<string, string> = {
      updated_at: now,
      last_message_at: now,
    };
    if (isNewThread) updatePayload.title = titleFromMessage(data.message);

    const { error: threadUpdateError } = await db
      .from("nexus_threads")
      .update(updatePayload)
      .eq("id", threadId)
      .eq("user_id", context.userId);
    if (threadUpdateError) throw new Error(threadUpdateError.message);

    return {
      threadId,
      mode: threadMode,
      isAdmin: admin,
      message: assistantMessage,
      provider: completion.provider,
      model: completion.model,
      coreIds,
      attemptedProviders: completion.attemptedProviders,
    };
  });
