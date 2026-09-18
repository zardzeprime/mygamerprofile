import { createClient } from "npm:@supabase/supabase-js@2.116.0";

import {
  CHILD_CORES,
  TOOL_BRIDGES,
  buildSystemPrompt,
  normalizeLocale,
  normalizeMode,
  selectCores,
  type Mode,
} from "./core.ts";
import { aiReady, complete, providerStatuses, type ChatMessage } from "./providers.ts";

export const PROJECT_PUBLISHABLE_KEY = "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requireMessage(value: unknown, max: number) {
  if (typeof value !== "string") throw new Error("NEXUS_INVALID_MESSAGE");
  const message = value.trim();
  if (!message || message.length > max) throw new Error("NEXUS_INVALID_MESSAGE");
  return message;
}

function adminDb() {
  const url = env("SUPABASE_URL");
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) throw new Error("NEXUS_BACKEND_NOT_READY");
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as any;
}

export async function authenticatedUser(req: Request) {
  const authorization = req.headers.get("authorization")?.trim();
  if (!authorization?.toLowerCase().startsWith("bearer ")) throw new Error("NEXUS_AUTH_REQUIRED");
  const token = authorization.slice(7).trim();
  if (!token || token === PROJECT_PUBLISHABLE_KEY) throw new Error("NEXUS_AUTH_REQUIRED");

  const url = env("SUPABASE_URL");
  if (!url) throw new Error("NEXUS_BACKEND_NOT_READY");
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: PROJECT_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("NEXUS_AUTH_INVALID");
  const user = await response.json() as { id?: string };
  if (!user.id) throw new Error("NEXUS_AUTH_INVALID");
  return user.id;
}

async function isAdmin(db: any, userId: string) {
  const { data, error } = await db
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("NEXUS_ROLE_CHECK_FAILED");
  return Boolean(data);
}

async function ensureGuest(db: any, requestedGuestId?: unknown) {
  const guestId = validUuid(requestedGuestId) ? requestedGuestId : null;
  const { data, error } = await db.rpc("ensure_nexus_guest_session", { p_session_id: guestId });
  if (error) throw new Error("NEXUS_GUEST_SESSION_FAILED");
  const guest = data?.[0];
  if (!guest?.session_id) throw new Error("NEXUS_GUEST_SESSION_FAILED");
  return guest as {
    session_id: string;
    responses_used: number;
    max_responses: number;
    expires_at: string;
  };
}

async function guestMessages(db: any, guestId: string, limit = 40) {
  const { data, error } = await db.rpc("list_nexus_guest_messages", {
    p_session_id: guestId,
    p_limit: limit,
  });
  if (error) throw new Error("NEXUS_GUEST_HISTORY_FAILED");
  return data ?? [];
}

export async function handleGuestStatus(raw: Record<string, unknown>) {
  const db = adminDb();
  const guest = await ensureGuest(db, raw.guestId);
  const messages = await guestMessages(db, guest.session_id, 40);
  const responsesUsed = Number(guest.responses_used ?? 0);
  const maxResponses = Number(guest.max_responses ?? 10);
  const remaining = Math.max(0, maxResponses - responsesUsed);
  return {
    guestId: guest.session_id,
    responsesUsed,
    maxResponses,
    remaining,
    locked: remaining <= 0,
    aiReady: aiReady(),
    inferenceTransport: "supabase-edge-v2",
    providers: providerStatuses(),
    messages,
  };
}

export async function handleGuestSend(raw: Record<string, unknown>) {
  const db = adminDb();
  const guest = await ensureGuest(db, raw.guestId);
  const message = requireMessage(raw.message, 2500);
  const locale = normalizeLocale(raw.locale);
  const responsesUsed = Number(guest.responses_used ?? 0);
  const maxResponses = Number(guest.max_responses ?? 10);

  if (responsesUsed >= maxResponses) {
    return {
      guestId: guest.session_id,
      locked: true,
      remaining: 0,
      maxResponses,
      aiReady: aiReady(),
      message: null,
    };
  }
  if (!aiReady()) throw new Error("NEXUS_NO_PROVIDER");

  const coreIds = selectCores(message, "gaming");
  const rows = await guestMessages(db, guest.session_id, 20);
  const history: ChatMessage[] = rows
    .filter((row: any) => row.role === "user" || row.role === "assistant")
    .map((row: any) => ({ role: row.role, content: String(row.content) }));
  history.push({ role: "user", content: message });

  const completion = await complete({
    system: buildSystemPrompt("gaming", false, coreIds, locale),
    messages: history,
    effort: "low",
    maxOutputTokens: 1000,
  });

  const { data: quotaRows, error } = await db.rpc("record_nexus_guest_exchange", {
    p_session_id: guest.session_id,
    p_user_content: message,
    p_assistant_content: completion.text,
    p_core_ids: coreIds,
    p_provider: completion.provider,
    p_model: completion.model,
    p_metadata: {
      mode: "gaming",
      locale,
      anonymousTrial: true,
      attemptedProviders: completion.attemptedProviders,
      runtime: "edge-v2",
      orchestrator: "nexus",
    },
  });
  if (error) throw new Error(error.message);

  const quota = quotaRows?.[0];
  const remaining = Number(quota?.remaining_count ?? 0);
  return {
    guestId: guest.session_id,
    locked: remaining <= 0,
    remaining,
    maxResponses,
    aiReady: true,
    message: {
      id: quota?.message_id,
      role: "assistant",
      content: completion.text,
      core_ids: coreIds,
      provider: completion.provider,
      model: completion.model,
    },
    provider: completion.provider,
    model: completion.model,
    attemptedProviders: completion.attemptedProviders,
    coreIds,
  };
}

export async function handleMemberStatus(req: Request) {
  const userId = await authenticatedUser(req);
  const db = adminDb();
  const admin = await isAdmin(db, userId);
  return {
    isAdmin: admin,
    aiReady: aiReady(),
    inferenceTransport: "supabase-edge-v2",
    providers: providerStatuses(),
    tools: admin ? TOOL_BRIDGES : [],
    orchestrator: "nexus",
    childCores: CHILD_CORES,
  };
}

export async function handleMemberThreads(req: Request) {
  const userId = await authenticatedUser(req);
  const db = adminDb();
  const { data, error } = await db
    .from("nexus_threads")
    .select("id,title,mode,created_at,updated_at,last_message_at")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false })
    .limit(30);
  if (error) throw new Error("NEXUS_THREADS_FAILED");
  return data ?? [];
}

async function ownedThread(db: any, userId: string, threadId: unknown) {
  if (!validUuid(threadId)) throw new Error("NEXUS_THREAD_INVALID");
  const { data, error } = await db
    .from("nexus_threads")
    .select("id,mode")
    .eq("id", threadId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("NEXUS_THREAD_LOOKUP_FAILED");
  if (!data) throw new Error("NEXUS_THREAD_NOT_FOUND");
  return data as { id: string; mode: Mode };
}

export async function handleMemberMessages(req: Request, raw: Record<string, unknown>) {
  const userId = await authenticatedUser(req);
  const db = adminDb();
  const thread = await ownedThread(db, userId, raw.threadId);
  const { data, error } = await db
    .from("nexus_messages")
    .select("id,role,content,core_ids,provider,model,created_at")
    .eq("thread_id", thread.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error("NEXUS_MESSAGES_FAILED");
  return data ?? [];
}

export async function handleDeleteThread(req: Request, raw: Record<string, unknown>) {
  const userId = await authenticatedUser(req);
  const db = adminDb();
  const thread = await ownedThread(db, userId, raw.threadId);
  const { error } = await db
    .from("nexus_threads")
    .delete()
    .eq("id", thread.id)
    .eq("user_id", userId);
  if (error) throw new Error("NEXUS_THREAD_DELETE_FAILED");
  return { ok: true };
}

function titleFromMessage(message: string) {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > 72 ? `${oneLine.slice(0, 69)}...` : oneLine;
}

async function enforceMemberRateLimit(db: any, userId: string) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await db
    .from("nexus_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);
  if (error) throw new Error("NEXUS_RATE_CHECK_FAILED");
  if ((count ?? 0) >= 12) throw new Error("NEXUS_RATE_LIMIT");
}

export async function handleMemberSend(req: Request, raw: Record<string, unknown>) {
  const userId = await authenticatedUser(req);
  const db = adminDb();
  const admin = await isAdmin(db, userId);
  const requestedMode = normalizeMode(raw.mode);
  const locale = normalizeLocale(raw.locale);
  const message = requireMessage(raw.message, 6000);

  if (requestedMode === "development" && !admin) throw new Error("NEXUS_ADMIN_REQUIRED");
  if (!aiReady()) throw new Error("NEXUS_NO_PROVIDER");
  await enforceMemberRateLimit(db, userId);

  let threadId: string;
  let threadMode: Mode = requestedMode;
  let newThread = false;

  if (raw.threadId) {
    const thread = await ownedThread(db, userId, raw.threadId);
    threadId = thread.id;
    threadMode = thread.mode;
    if (threadMode === "development" && !admin) throw new Error("NEXUS_ADMIN_REQUIRED");
  } else {
    const { data: thread, error } = await db
      .from("nexus_threads")
      .insert({ user_id: userId, title: titleFromMessage(message), mode: requestedMode })
      .select("id,mode")
      .single();
    if (error || !thread) throw new Error("NEXUS_THREAD_CREATE_FAILED");
    threadId = thread.id;
    threadMode = thread.mode as Mode;
    newThread = true;
  }

  try {
    const { data: historyRows, error: historyError } = await db
      .from("nexus_messages")
      .select("role,content")
      .eq("thread_id", threadId)
      .eq("user_id", userId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(23);
    if (historyError) throw new Error("NEXUS_HISTORY_FAILED");

    const history: ChatMessage[] = (historyRows ?? [])
      .reverse()
      .map((row: any) => ({
        role: row.role === "assistant" ? "assistant" : "user",
        content: String(row.content),
      }));
    history.push({ role: "user", content: message });

    const coreIds = selectCores(message, threadMode);
    const completion = await complete({
      system: buildSystemPrompt(threadMode, admin, coreIds, locale),
      messages: history,
      effort: threadMode === "development" ? "high" : "low",
      maxOutputTokens: threadMode === "development" ? 2400 : 1600,
    });

    const { error: userMessageError } = await db.from("nexus_messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content: message,
      core_ids: coreIds,
      metadata: { mode: threadMode, locale, runtime: "edge-v2", orchestrator: "nexus" },
    });
    if (userMessageError) throw new Error("NEXUS_USER_MESSAGE_WRITE_FAILED");

    const { data: assistantMessage, error: assistantError } = await db
      .from("nexus_messages")
      .insert({
        thread_id: threadId,
        user_id: userId,
        role: "assistant",
        content: completion.text,
        core_ids: coreIds,
        provider: completion.provider,
        model: completion.model,
        metadata: {
          mode: threadMode,
          locale,
          runtime: "edge-v2",
          orchestrator: "nexus",
          attemptedProviders: completion.attemptedProviders,
        },
      })
      .select("id,role,content,core_ids,provider,model,created_at")
      .single();
    if (assistantError) throw new Error("NEXUS_ASSISTANT_MESSAGE_WRITE_FAILED");

    await db
      .from("nexus_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId)
      .eq("user_id", userId);

    return {
      threadId,
      isNewThread: newThread,
      mode: threadMode,
      message: assistantMessage,
      provider: completion.provider,
      model: completion.model,
      attemptedProviders: completion.attemptedProviders,
      coreIds,
      orchestrator: "nexus",
    };
  } catch (error) {
    if (newThread) {
      await db.from("nexus_threads").delete().eq("id", threadId).eq("user_id", userId);
    }
    throw error;
  }
}
