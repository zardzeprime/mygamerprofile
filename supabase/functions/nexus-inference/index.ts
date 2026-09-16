type ProviderId = "openai" | "gemini" | "groq" | "openrouter" | "anthropic";
type ChatMessage = { role: "user" | "assistant"; content: string };
type CompletionRequest = {
  system: string;
  messages: ChatMessage[];
  effort?: "low" | "medium" | "high";
  maxOutputTokens?: number;
  providerOrder?: ProviderId[];
};

const PROVIDERS: ProviderId[] = ["openai", "gemini", "groq", "openrouter", "anthropic"];
const DEFAULT_ORDER: ProviderId[] = ["gemini", "groq", "openrouter", "openai", "anthropic"];
const ALLOWED_ORIGINS = new Set([
  "https://mygamerprofile.lovable.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
// Supabase publishable keys are intentionally public project identifiers, not secrets.
// Edge Runtime automatically exposes the legacy anon key, but does not always expose
// the newer sb_publishable_* key. Pin this project's public key so requests emitted by
// the generated Lovable/Supabase client can be authenticated without weakening the endpoint.
const PROJECT_PUBLISHABLE_KEY = "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function reply(data: unknown, status = 200, req?: Request) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  const origin = req?.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function errorText(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 240);
}

function hasValidProjectApiKey(req: Request) {
  const supplied = req.headers.get("apikey")?.trim();
  if (!supplied) return false;
  const anon = env("SUPABASE_ANON_KEY");
  const publishable = env("SUPABASE_PUBLISHABLE_KEY");
  return supplied === anon || supplied === publishable || supplied === PROJECT_PUBLISHABLE_KEY;
}

function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function withinRateLimit(req: Request) {
  const now = Date.now();
  const ip = clientIp(req);
  const current = rateBuckets.get(ip);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 30) return false;
  current.count += 1;
  return true;
}

function statuses() {
  return [
    { id: "openai" as const, configured: Boolean(env("OPENAI_API_KEY")), model: env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol" },
    { id: "gemini" as const, configured: Boolean(env("GEMINI_API_KEY") || env("GOOGLE_API_KEY")), model: env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash" },
    { id: "groq" as const, configured: Boolean(env("GROQ_API_KEY")), model: env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b" },
    { id: "openrouter" as const, configured: Boolean(env("OPENROUTER_API_KEY")), model: env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free" },
    { id: "anthropic" as const, configured: Boolean(env("ANTHROPIC_API_KEY")), model: env("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6" },
  ];
}

function order(requested?: ProviderId[]) {
  const configuredOrder = env("NEXUS_PROVIDER_ORDER")
    ?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is ProviderId => PROVIDERS.includes(value as ProviderId));
  return [...new Set(requested?.length ? requested : configuredOrder?.length ? configuredOrder : DEFAULT_ORDER)];
}

function validate(raw: unknown): CompletionRequest {
  if (!raw || typeof raw !== "object") throw new Error("invalid_request");
  const data = raw as Record<string, unknown>;
  if (typeof data.system !== "string" || data.system.length < 1 || data.system.length > 16_000) throw new Error("invalid_system_prompt");
  if (!Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > 30) throw new Error("invalid_messages");
  const messages = data.messages.map((item) => {
    if (!item || typeof item !== "object") throw new Error("invalid_message");
    const message = item as Record<string, unknown>;
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string" || message.content.length < 1 || message.content.length > 8_000) throw new Error("invalid_message");
    return { role: message.role, content: message.content } as ChatMessage;
  });
  const requested = Array.isArray(data.providerOrder)
    ? data.providerOrder.filter((value): value is ProviderId => typeof value === "string" && PROVIDERS.includes(value as ProviderId))
    : undefined;
  return {
    system: data.system,
    messages,
    effort: data.effort === "low" || data.effort === "high" ? data.effort : "medium",
    maxOutputTokens: Math.min(Math.max(Number(data.maxOutputTokens ?? 1800), 128), 2600),
    providerOrder: requested,
  };
}

async function openai(request: CompletionRequest) {
  const key = env("OPENAI_API_KEY");
  if (!key) throw new Error("OpenAI is not configured");
  const model = env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, instructions: request.system, input: request.messages, reasoning: { effort: request.effort ?? "medium" }, max_output_tokens: request.maxOutputTokens ?? 1800 }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const text = data.output_text?.trim() || data.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text" && item.text).map((item) => item.text).join("\n").trim();
  if (!text) throw new Error("OpenAI returned no text");
  return { text, provider: "openai" as const, model };
}

async function gemini(request: CompletionRequest) {
  const key = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");
  if (!key) throw new Error("Gemini is not configured");
  const model = env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: request.system }] }, contents: request.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })), generationConfig: { maxOutputTokens: request.maxOutputTokens ?? 1800 } }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return { text, provider: "gemini" as const, model };
}

async function compatible(request: CompletionRequest, provider: "groq" | "openrouter") {
  const groq = provider === "groq";
  const key = env(groq ? "GROQ_API_KEY" : "OPENROUTER_API_KEY");
  if (!key) throw new Error(`${provider} is not configured`);
  const model = groq ? env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b" : env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free";
  const endpoint = groq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  if (!groq) {
    headers["HTTP-Referer"] = env("PUBLIC_APP_URL") ?? "https://mygamerprofile.lovable.app";
    headers["X-OpenRouter-Title"] = "MG Profile NEXUS";
  }
  const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ model, messages: [{ role: "system", content: request.system }, ...request.messages], max_tokens: request.maxOutputTokens ?? 1800 }) });
  if (!response.ok) throw new Error(`${provider} ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>; model?: string };
  const raw = data.choices?.[0]?.message?.content;
  const text = typeof raw === "string" ? raw.trim() : raw?.map((part) => part.text ?? "").join("\n").trim();
  if (!text) throw new Error(`${provider} returned no text`);
  return { text, provider, model: data.model ?? model };
}

async function anthropic(request: CompletionRequest) {
  const key = env("ANTHROPIC_API_KEY");
  if (!key) throw new Error("Anthropic is not configured");
  const model = env("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model, system: request.system, messages: request.messages, max_tokens: request.maxOutputTokens ?? 1800 }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content?.filter((item) => item.type === "text" && item.text).map((item) => item.text).join("\n").trim();
  if (!text) throw new Error("Anthropic returned no text");
  return { text, provider: "anthropic" as const, model };
}

const completers = {
  openai,
  gemini,
  groq: (request: CompletionRequest) => compatible(request, "groq"),
  openrouter: (request: CompletionRequest) => compatible(request, "openrouter"),
  anthropic,
} satisfies Record<ProviderId, (request: CompletionRequest) => Promise<{ text: string; provider: ProviderId; model: string }>>;

async function complete(request: CompletionRequest) {
  const state = new Map(statuses().map((entry) => [entry.id, entry]));
  const attemptedProviders: ProviderId[] = [];
  const failures: string[] = [];
  for (const provider of order(request.providerOrder)) {
    if (!state.get(provider)?.configured) continue;
    attemptedProviders.push(provider);
    try {
      return { ...(await completers[provider](request)), attemptedProviders };
    } catch (error) {
      failures.push(`${provider}: ${errorText(error)}`);
    }
  }
  if (!attemptedProviders.length) throw new Error("NEXUS_NO_PROVIDER");
  throw new Error(`NEXUS_ALL_PROVIDERS_FAILED: ${failures.join(" | ")}`);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return reply({ error: "origin_not_allowed" }, 403, req);
  if (req.method === "OPTIONS") {
    const headers = new Headers({ "Access-Control-Allow-Headers": "apikey, authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" });
    if (origin && ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") return reply({ error: "method_not_allowed" }, 405, req);
  if (!hasValidProjectApiKey(req)) return reply({ error: "invalid_project_key" }, 401, req);
  if (!withinRateLimit(req)) return reply({ error: "rate_limited" }, 429, req);
  if (Number(req.headers.get("content-length") ?? 0) > 64_000) return reply({ error: "payload_too_large" }, 413, req);

  try {
    const raw = await req.json();
    if (raw?.type === "health") {
      const providers = statuses();
      return reply({ ready: providers.some((provider) => provider.configured), transport: "supabase-edge", providers }, 200, req);
    }
    return reply(await complete(validate(raw)), 200, req);
  } catch (error) {
    const message = errorText(error);
    return reply({ error: message }, message === "NEXUS_NO_PROVIDER" ? 503 : message.startsWith("invalid_") ? 400 : 502, req);
  }
});
