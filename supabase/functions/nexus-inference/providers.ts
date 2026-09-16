import { augmentSystemWithMgpContent } from "./content.ts";

export type ProviderId = "openai" | "gemini" | "groq" | "openrouter" | "anthropic";
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type CompletionRequest = {
  system: string;
  messages: ChatMessage[];
  effort?: "low" | "medium" | "high";
  maxOutputTokens?: number;
  providerOrder?: ProviderId[];
};

const PROVIDERS: ProviderId[] = ["openai", "gemini", "groq", "openrouter", "anthropic"];
const DEFAULT_ORDER: ProviderId[] = ["gemini", "openai", "groq", "openrouter", "anthropic"];
const PROVIDER_TIMEOUT_MS = 16_000;

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function errorText(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

async function withTimeout<T>(promise: Promise<T>, provider: ProviderId): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${provider} timed out`)), PROVIDER_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export function providerStatuses() {
  return [
    { id: "openai" as const, configured: Boolean(env("OPENAI_API_KEY")), model: env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol" },
    { id: "gemini" as const, configured: Boolean(env("GEMINI_API_KEY") || env("GOOGLE_API_KEY")), model: env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash" },
    { id: "groq" as const, configured: Boolean(env("GROQ_API_KEY")), model: env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b" },
    { id: "openrouter" as const, configured: Boolean(env("OPENROUTER_API_KEY")), model: env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free" },
    { id: "anthropic" as const, configured: Boolean(env("ANTHROPIC_API_KEY")), model: env("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6" },
  ];
}

export function aiReady() {
  return providerStatuses().some((provider) => provider.configured);
}

function providerOrder(requested?: ProviderId[]): ProviderId[] {
  const configuredOrder = env("NEXUS_PROVIDER_ORDER")
    ?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is ProviderId => PROVIDERS.includes(value as ProviderId));
  const base: ProviderId[] = requested?.length
    ? requested
    : configuredOrder?.length
      ? configuredOrder
      : DEFAULT_ORDER;
  return [...new Set<ProviderId>(base)];
}

async function openai(request: CompletionRequest) {
  const key = env("OPENAI_API_KEY");
  if (!key) throw new Error("OpenAI is not configured");
  const model = env("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: request.system,
      input: request.messages,
      reasoning: { effort: request.effort ?? "medium" },
      max_output_tokens: request.maxOutputTokens ?? 1600,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const data = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const text = data.output_text?.trim() || data.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("OpenAI returned no text");
  return { text, provider: "openai" as const, model };
}

async function gemini(request: CompletionRequest) {
  const key = env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY");
  if (!key) throw new Error("Gemini is not configured");
  const model = env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.system }] },
        contents: request.messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { maxOutputTokens: request.maxOutputTokens ?? 1600 },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return { text, provider: "gemini" as const, model };
}

async function compatible(request: CompletionRequest, provider: "groq" | "openrouter") {
  const isGroq = provider === "groq";
  const key = env(isGroq ? "GROQ_API_KEY" : "OPENROUTER_API_KEY");
  if (!key) throw new Error(`${provider} is not configured`);
  const model = isGroq
    ? env("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b"
    : env("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free";
  const endpoint = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (!isGroq) {
    headers["HTTP-Referer"] = env("PUBLIC_APP_URL") ?? "https://mygamerprofile.lovable.app";
    headers["X-OpenRouter-Title"] = "MG Profile NEXUS";
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: request.system }, ...request.messages],
      max_tokens: request.maxOutputTokens ?? 1600,
    }),
  });
  if (!response.ok) throw new Error(`${provider} ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    model?: string;
  };
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
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: request.system,
      messages: request.messages,
      max_tokens: request.maxOutputTokens ?? 1600,
    }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 220)}`);
  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content
    ?.filter((item) => item.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Anthropic returned no text");
  return { text, provider: "anthropic" as const, model };
}

const COMPLETERS: Record<
  ProviderId,
  (request: CompletionRequest) => Promise<{ text: string; provider: ProviderId; model: string }>
> = {
  openai,
  gemini,
  groq: (request) => compatible(request, "groq"),
  openrouter: (request) => compatible(request, "openrouter"),
  anthropic,
};

export async function complete(request: CompletionRequest) {
  const state = new Map<ProviderId, ReturnType<typeof providerStatuses>[number]>(
    providerStatuses().map((entry) => [entry.id, entry]),
  );
  const attemptedProviders: ProviderId[] = [];
  const failures: string[] = [];
  const latestUserMessage = [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const groundedRequest: CompletionRequest = {
    ...request,
    system: await augmentSystemWithMgpContent(request.system, latestUserMessage),
  };

  for (const provider of providerOrder(request.providerOrder)) {
    if (!state.get(provider)?.configured) continue;
    attemptedProviders.push(provider);
    try {
      const result = await withTimeout(COMPLETERS[provider](groundedRequest), provider);
      return { ...result, attemptedProviders };
    } catch (error) {
      failures.push(`${provider}: ${errorText(error)}`);
    }
  }

  if (!attemptedProviders.length) throw new Error("NEXUS_NO_PROVIDER");
  console.error("[NEXUS] all providers failed", failures.join(" | "));
  throw new Error("NEXUS_ALL_PROVIDERS_FAILED");
}
