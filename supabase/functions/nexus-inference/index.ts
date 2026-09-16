type ProviderId = "openai" | "gemini" | "groq" | "openrouter" | "anthropic";
type ChatMessage = { role: "user" | "assistant"; content: string };
type CompletionRequest = {
  type?: "completion";
  system: string;
  messages: ChatMessage[];
  effort?: "low" | "medium" | "high";
  maxOutputTokens?: number;
  providerOrder?: ProviderId[];
};

type CompletionResult = {
  text: string;
  provider: ProviderId;
  model: string;
  attemptedProviders: ProviderId[];
};

const ALL_PROVIDERS: ProviderId[] = ["openai", "gemini", "groq", "openrouter", "anthropic"];
const DEFAULT_ORDER: ProviderId[] = ["gemini", "groq", "openrouter", "openai", "anthropic"];
const ALLOWED_ORIGINS = new Set([
  "https://mygamerprofile.lovable.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_IP = 90;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function json(data: unknown, status = 200, req?: Request) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  const origin = req?.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function compactError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 240);
  return String(error).slice(0, 240);
}

function providerOrder(raw?: ProviderId[]) {
  const configured = env("NEXUS_PROVIDER_ORDER")
    ?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is ProviderId => ALL_PROVIDERS.includes(value as ProviderId));
  const requested = raw?.filter((value) => ALL_PROVIDERS.includes(value));
  return [...new Set(requested?.length ? requested : configured?.length ? configured : DEFAULT_ORDER)];
}

function providerStatus() {
  return [
    { id: "openai" as const, configured: Boolean(env("OPENAI_API_KEY")), model: env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol" },
    { id: "gemini" as const, configured: Boolean(env("GEMINI_API_KEY") || env("GOOGLE_API_KEY")), model: env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash" },
    { id: "groq" as const, configured: Boolean(env("GROQ_API_KEY")), model: env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b" },
    { id: "openrouter" as const, configured: Boolean(env("OPENROUTER_API_KEY")), model: env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free" },
    { id: "anthropic" as const, configured: Boolean(env("ANTHROPIC_API_KEY")), model: env("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6" },
  ];
}

function clientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function checkRateLimit(req: Request) {
  const now = Date.now();
  const key = clientIp(req);
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_PER_IP) return false;
  current.count += 1;
  return true;
}

function validateCompletionRequest(value: unknown): CompletionRequest {
  if (!value || typeof value !== "object") throw new Error("invalid_request");
  const raw = value as Record<string, unknown>;
  if (typeof raw.system !== "string" || raw.system.length < 1 || raw.system.length > 16_000) {
    throw new Error("invalid_system_prompt");
  }
  if (!Array.isArray(raw.messages) || raw.messages.length < 1 || raw.messages.length > 30) {
    throw new Error("invalid_messages");
  }
  const messages = raw.messages.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("invalid_message");
    const message = entry as Record<string, unknown>;
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string") {
      throw new Error("invalid_message");
    }
    if (message.content.length < 1 || message.content.length > 8_000) throw new Error("invalid_message_length");
    return { role: message.role, content: message.content } as ChatMessage;
  });
  const maxOutputTokens = Math.min(Math.max(Number(raw.maxOutputTokens ?? 1800), 128), 2600);
  const effort = raw.effort === "low" || raw.effort === "high" ? raw.effort : "medium";
  const requestedOrder = Array.isArray(raw.providerOrder)
    ? raw.providerOrder.filter((item): item is ProviderId => typeof item === "string" && ALL_PROVIDERS.includes(item as ProviderId))
    : undefined;
  return { system: raw.system, messages, maxOutputTokens, effort, providerOrder: requestedOrder };
}

async function completeOpenAI(request: CompletionRequest) {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OpenAI is not configured");
  const model = env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: request.system,
      input: request.messages,
      reasoning: { effort: request.effort ?? "medium" },
      max_output_tokens: request.maxOutputTokens ?? 1800,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const text = data.output_text?.trim() || data.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text" && item.text).map((item) => item.text).join("\n").trim();
  if (!text) throw new Error("OpenAI returned no text");
  return { text, provider: "openai" as const, model };
}

async function completeGemini(request: CompletionRequest) {
  const apiKey = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("Gemini is not configured");
  const model = env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: request.system }] },
      contents: request.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
      generationConfig: { maxOutputTokens: request.maxOutputTokens ?? 1800 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return { text, provider: "gemini" as const, model };
}

async function completeCompatible(request: CompletionRequest, provider: "groq" | "openrouter") {
  const isGroq = provider === "groq";
  const apiKey = env(isGroq ? "GROQ_API_KEY" : "OPENROUTER_API_KEY");
  if (!apiKey) throw new Error(`${provider} is not configured`);
  const model = isGroq ? env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b" : env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free";
  const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  if (!isGroq) {
    const appUrl = env("PUBLIC_APP_URL") ?? "https://mygamerprofile.lovable.app";
    headers["HTTP-Referer"] = appUrl;
    headers["X-OpenRouter-Title"] = "MG Profile NEXUS";
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages: [{ role: "system", content: request.system }, ...request.messages], max_tokens: request.maxOutputTokens ?? 1800 }),
  });
  if (!response.ok) throw new Error(`${provider} ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>; model?: string };
  const raw = data.choices?.[0]?.message?.content;
  const text = typeof raw === "string" ? raw.trim() : raw?.map((part) => part.text ?? "").join("\n").trim();
  if (!text) throw new Error(`${provider} returned no text`);
  return { text, provider, model: data.model ?? model };
}

async function completeAnthropic(request: CompletionRequest) {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("Anthropic is not configured");
  const model = env("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model, system: request.system, messages: request.messages, max_tokens: request.maxOutputTokens ?? 1800 }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 160)}`);
  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content?.filter((item) => item.type === "text" && item.text).map((item) => item.text).join("\n").trim();
  if (!text) throw new Error("Anthropic returned no text");
  return { text, provider: "anthropic" as const, model };
}

const completers: Record<ProviderId, (request: CompletionRequest) => Promise<{ text: string; provider: ProviderId; model: string }>> = {
  openai: completeOpenAI,
  gemini: completeGemini,
  groq: (request) => completeCompatible(request, "groq"),
  openrouter: (request) => completeCompatible(request, "openrouter"),
  anthropic: completeAnthropic,
};

async function complete(request: CompletionRequest): Promise<CompletionResult> {
  const statuses = new Map(providerStatus().map((status) => [status.id, status]));
  const attemptedProviders: ProviderId[] = [];
  const failures: string[] = [];
  for (const provider of providerOrder(request.providerOrder)) {
    if (!statuses.get(provider)?.configured) continue;
    attemptedProviders.push(provider);
    try {
      const result = await completers[provider](request);
      return { ...result, attemptedProviders };
    } catch (error) {
      failures.push(`${provider}: ${compactError(error)}`);
    }
  }
  if (!attemptedProviders.length) throw new Error("NEXUS_NO_PROVIDER");
  throw new Error(`NEXUS_ALL_PROVIDERS_FAILED: ${failures.join(" | ")}`);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "origin_not_allowed" }, 403, req);
  if (req.method === "OPTIONS") {
    const headers = new Headers({ "Access-Control-Allow-Headers": "apikey, authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" });
    if (origin && ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, req);
  if (!checkRateLimit(req)) return json({ error: "rate_limited" }, 429, req);

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) return json({ error: "payload_too_large" }, 413, req);

  try {
    const raw = await req.json();
    if (raw?.type === "health") {
      const providers = providerStatus();
      return json({
        ready: providers.some((provider) => provider.configured),
        transport: "supabase-edge",
        providers: providers.map(({ id, configured, model }) => ({ id, configured, model })),
      }, 200, req);
    }
    const request = validateCompletionRequest(raw);
    const result = await complete(request);
    return json(result, 200, req);
  } catch (error) {
    const message = compactError(error);
    const status = message === "NEXUS_NO_PROVIDER" ? 503 : message.startsWith("invalid_") ? 400 : 502;
    return json({ error: message }, status, req);
  }
});
