import { CHILD_CORES } from "./core.ts";
import { aiReady, providerStatuses } from "./providers.ts";
import {
  PROJECT_PUBLISHABLE_KEY,
  handleDeleteThread,
  handleGuestSend,
  handleGuestStatus,
  handleMemberBootstrap,
  handleMemberMessages,
  handleMemberSend,
  handleMemberStatus,
  handleMemberThreads,
} from "./runtime.ts";

const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>();

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "X-Nexus-Runtime": "edge-v3",
  };
}

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function errorText(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

function cleanErrorCode(error: unknown) {
  const message = errorText(error);
  if (message.includes("NEXUS_GUEST_LIMIT_REACHED")) return "NEXUS_GUEST_LIMIT_REACHED";
  if (message.includes("NEXUS_GUEST_RATE_LIMIT")) return "NEXUS_GUEST_RATE_LIMIT";
  if (message.startsWith("NEXUS_")) return message.split(":")[0];
  return "NEXUS_RUNTIME_ERROR";
}

function hasValidProjectApiKey(req: Request) {
  const supplied = req.headers.get("apikey")?.trim();
  if (!supplied) return false;
  const anon = env("SUPABASE_ANON_KEY");
  const publishable = env("SUPABASE_PUBLISHABLE_KEY");
  return supplied === PROJECT_PUBLISHABLE_KEY || supplied === anon || supplied === publishable;
}

function clientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimitForAction(action: string) {
  if (action === "guest.send" || action === "member.send") return { bucket: "send", limit: 20 };
  if (action === "health") return { bucket: "health", limit: 180 };
  return { bucket: "read", limit: 120 };
}

function withinRateLimit(req: Request, action: string) {
  const now = Date.now();
  const { bucket, limit } = rateLimitForAction(action);
  const key = `${clientIp(req)}:${bucket}`;
  const current = RATE_BUCKETS.get(key);

  if (!current || current.resetAt <= now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

Deno.serve(async (req: Request) => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  if (req.method !== "POST") return reply({ error: "NEXUS_METHOD_NOT_ALLOWED" }, 405);
  if (!hasValidProjectApiKey(req)) return reply({ error: "NEXUS_PROJECT_KEY_INVALID" }, 401);
  if (Number(req.headers.get("content-length") ?? 0) > 96_000) {
    return reply({ error: "NEXUS_PAYLOAD_TOO_LARGE" }, 413);
  }

  try {
    const raw = await req.json() as Record<string, unknown>;
    const action =
      typeof raw.action === "string"
        ? raw.action
        : typeof raw.type === "string"
          ? raw.type
          : "";

    if (!withinRateLimit(req, action)) return reply({ error: "NEXUS_RATE_LIMIT" }, 429);

    if (action === "health") {
      const providers = providerStatuses();
      return reply({
        ready: aiReady(),
        aiReady: aiReady(),
        transport: "supabase-edge-v3",
        inferenceTransport: "supabase-edge-v3",
        providers,
        orchestrator: "nexus",
        childCores: CHILD_CORES,
      });
    }

    if (action === "guest.status") return reply(await handleGuestStatus(raw));
    if (action === "guest.send") return reply(await handleGuestSend(raw));
    if (action === "member.bootstrap") return reply(await handleMemberBootstrap(req));
    if (action === "member.status") return reply(await handleMemberStatus(req));
    if (action === "member.threads") return reply(await handleMemberThreads(req));
    if (action === "member.messages") return reply(await handleMemberMessages(req, raw));
    if (action === "member.delete-thread") return reply(await handleDeleteThread(req, raw));
    if (action === "member.send") return reply(await handleMemberSend(req, raw));

    if (action === "completion") return reply({ error: "NEXUS_LEGACY_COMPLETION_DISABLED" }, 410);
    return reply({ error: "NEXUS_ACTION_NOT_FOUND" }, 404);
  } catch (error) {
    const code = cleanErrorCode(error);
    console.error("[NEXUS]", code, `duration=${Date.now() - startedAt}ms`, errorText(error));

    const status =
      code === "NEXUS_AUTH_REQUIRED" || code === "NEXUS_AUTH_INVALID" ? 401 :
      code === "NEXUS_ADMIN_REQUIRED" ? 403 :
      code === "NEXUS_RATE_LIMIT" || code === "NEXUS_GUEST_RATE_LIMIT" ? 429 :
      code === "NEXUS_NO_PROVIDER" || code === "NEXUS_ALL_PROVIDERS_FAILED" ? 503 :
      code === "NEXUS_GUEST_LIMIT_REACHED" ? 402 :
      code === "NEXUS_INVALID_MESSAGE" || code === "NEXUS_THREAD_INVALID" ? 400 : 502;

    return reply(
      {
        error: code,
        retryable:
          code === "NEXUS_ALL_PROVIDERS_FAILED" ||
          code === "NEXUS_RUNTIME_ERROR" ||
          code === "NEXUS_RATE_LIMIT" ||
          code === "NEXUS_GUEST_RATE_LIMIT",
      },
      status,
    );
  }
});
