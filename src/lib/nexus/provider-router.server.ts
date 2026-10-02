import { getSupabasePublicConfig } from "@/lib/supabase.server";

export type NexusProviderId = "openai" | "gemini" | "groq" | "openrouter" | "anthropic";

export type NexusChatRole = "user" | "assistant";

export type NexusChatMessage = {
  role: NexusChatRole;
  content: string;
};

export type NexusReasoningEffort = "low" | "medium" | "high";

export type NexusCompletionRequest = {
  system: string;
  messages: NexusChatMessage[];
  effort?: NexusReasoningEffort;
  maxOutputTokens?: number;
  providerOrder?: NexusProviderId[];
};

export type NexusCompletionResult = {
  text: string;
  provider: NexusProviderId;
  model: string;
  attemptedProviders: NexusProviderId[];
};

export type NexusProviderStatus = {
  id: NexusProviderId;
  configured: boolean;
  model: string;
  kind: "official-api" | "router-api";
};

export type NexusRuntimeHealth = {
  ready: boolean;
  transport: "supabase-edge" | "direct-server";
  providers: Array<Pick<NexusProviderStatus, "id" | "configured" | "model">>;
};

const ALL_PROVIDERS: NexusProviderId[] = ["openai", "gemini", "groq", "openrouter", "anthropic"];
const DEFAULT_PROVIDER_ORDER: NexusProviderId[] = [
  "gemini",
  "groq",
  "openai",
  "anthropic",
  "openrouter",
];
const DIRECT_PROVIDER_TIMEOUT_MS = 18_000;
const DEFAULT_GUEST_PROVIDER_ORDER: NexusProviderId[] = [
  "gemini",
  "groq",
  "openrouter",
  "openai",
  "anthropic",
];

function serverEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function publicSupabaseConfig() {
  const { url, publishableKey } = getSupabasePublicConfig();
  if (!url || !publishableKey) return null;
  return {
    url: String(url).replace(/\/$/, ""),
    publishableKey: String(publishableKey),
  };
}

function parseProviderOrder(name: string, fallback: NexusProviderId[]) {
  const configured = serverEnv(name);
  if (!configured) return fallback;

  const accepted = new Set<NexusProviderId>(ALL_PROVIDERS);
  const parsed = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is NexusProviderId => accepted.has(value as NexusProviderId));

  return parsed.length ? [...new Set(parsed)] : fallback;
}

function getProviderOrder() {
  return parseProviderOrder("NEXUS_PROVIDER_ORDER", DEFAULT_PROVIDER_ORDER);
}

export function getNexusGuestProviderOrder() {
  return parseProviderOrder("NEXUS_GUEST_PROVIDER_ORDER", DEFAULT_GUEST_PROVIDER_ORDER);
}

export function getNexusProviderStatus(): NexusProviderStatus[] {
  return [
    {
      id: "openai",
      configured: Boolean(serverEnv("OPENAI_API_KEY")),
      model: serverEnv("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol",
      kind: "official-api",
    },
    {
      id: "gemini",
      configured: Boolean(serverEnv("GEMINI_API_KEY") || serverEnv("GOOGLE_API_KEY")),
      model: serverEnv("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash",
      kind: "official-api",
    },
    {
      id: "groq",
      configured: Boolean(serverEnv("GROQ_API_KEY")),
      model: serverEnv("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b",
      kind: "official-api",
    },
    {
      id: "openrouter",
      configured: Boolean(serverEnv("OPENROUTER_API_KEY")),
      model: serverEnv("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free",
      kind: "router-api",
    },
    {
      id: "anthropic",
      configured: Boolean(serverEnv("ANTHROPIC_API_KEY")),
      model: serverEnv("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6",
      kind: "official-api",
    },
  ];
}

export function hasNexusInferenceTransport() {
  return (
    Boolean(publicSupabaseConfig()) ||
    getNexusProviderStatus().some((provider) => provider.configured)
  );
}

function compactError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 260);
  return String(error).slice(0, 260);
}

async function callNexusEdge(body: Record<string, unknown>) {
  const config = publicSupabaseConfig();
  if (!config) throw new Error("NEXUS Edge transport is not configured");

  const response = await fetch(`${config.url}/functions/v1/nexus-inference`, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    throw new Error(`NEXUS Edge ${response.status}: invalid JSON response`);
  }

  if (!response.ok) {
    const message = typeof data["error"] === "string" ? data["error"] : text.slice(0, 180);
    throw new Error(`NEXUS Edge ${response.status}: ${message}`);
  }

  return data;
}

async function completeViaEdge(request: NexusCompletionRequest): Promise<NexusCompletionResult> {
  const data = await callNexusEdge({
    type: "completion",
    system: request.system,
    messages: request.messages,
    effort: request.effort,
    maxOutputTokens: request.maxOutputTokens,
    providerOrder: request.providerOrder,
  });

  const provider = data["provider"];
  const attemptedProviders = Array.isArray(data["attemptedProviders"])
    ? data["attemptedProviders"].filter(
        (value): value is NexusProviderId =>
          typeof value === "string" && ALL_PROVIDERS.includes(value as NexusProviderId),
      )
    : [];

  if (
    typeof data["text"] !== "string" ||
    !data["text"].trim() ||
    typeof provider !== "string" ||
    !ALL_PROVIDERS.includes(provider as NexusProviderId) ||
    typeof data["model"] !== "string"
  ) {
    throw new Error("NEXUS Edge returned an invalid completion payload");
  }

  return {
    text: data["text"].trim(),
    provider: provider as NexusProviderId,
    model: data["model"],
    attemptedProviders,
  };
}

export async function getNexusRuntimeHealth(): Promise<NexusRuntimeHealth> {
  if (publicSupabaseConfig()) {
    try {
      const data = await callNexusEdge({ type: "health" });
      const providers = Array.isArray(data["providers"])
        ? data["providers"].flatMap((raw) => {
            if (!raw || typeof raw !== "object") return [];
            const item = raw as Record<string, unknown>;
            if (
              typeof item["id"] !== "string" ||
              !ALL_PROVIDERS.includes(item["id"] as NexusProviderId) ||
              typeof item["configured"] !== "boolean" ||
              typeof item["model"] !== "string"
            ) {
              return [];
            }
            return [
              {
                id: item["id"] as NexusProviderId,
                configured: item["configured"],
                model: item["model"],
              },
            ];
          })
        : [];

      return {
        ready: data["ready"] === true,
        transport: "supabase-edge",
        providers,
      };
    } catch (error) {
      console.warn(
        "[NEXUS] Edge health check failed; checking direct server providers.",
        compactError(error),
      );
    }
  }

  const providers = getNexusProviderStatus().map(({ id, configured, model }) => ({
    id,
    configured,
    model,
  }));
  return {
    ready: providers.some((provider) => provider.configured),
    transport: "direct-server",
    providers,
  };
}

async function completeOpenAI(
  request: NexusCompletionRequest,
): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OpenAI is not configured");

  const model = serverEnv("NEXUS_OPENAI_MODEL") ?? "gpt-5.6-sol";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: request.system,
      input: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      reasoning: { effort: request.effort ?? "medium" },
      max_output_tokens: request.maxOutputTokens ?? 1800,
    }),
    signal: AbortSignal.timeout(DIRECT_PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  const text =
    data.output_text?.trim() ||
    data.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && item.text)
      .map((item) => item.text)
      .join("\n")
      .trim();

  if (!text) throw new Error("OpenAI returned no text");
  return { text, provider: "openai", model };
}

async function completeGemini(
  request: NexusCompletionRequest,
): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("GEMINI_API_KEY") ?? serverEnv("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("Gemini is not configured");

  const model = serverEnv("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: request.system }] },
      contents: request.messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        maxOutputTokens: request.maxOutputTokens ?? 1800,
      },
    }),
    signal: AbortSignal.timeout(DIRECT_PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned no text");
  return { text, provider: "gemini", model };
}

async function completeCompatibleChat({
  request,
  apiKey,
  endpoint,
  provider,
  model,
  extraHeaders = {},
}: {
  request: NexusCompletionRequest;
  apiKey: string;
  endpoint: string;
  provider: "groq" | "openrouter";
  model: string;
  extraHeaders?: Record<string, string>;
}): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: request.system }, ...request.messages],
      max_tokens: request.maxOutputTokens ?? 1800,
    }),
    signal: AbortSignal.timeout(DIRECT_PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider} ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
    model?: string;
  };
  const raw = data.choices?.[0]?.message?.content;
  const text =
    typeof raw === "string"
      ? raw.trim()
      : raw
          ?.map((part) => part.text ?? "")
          .join("\n")
          .trim();
  if (!text) throw new Error(`${provider} returned no text`);
  return { text, provider, model: data.model ?? model };
}

async function completeGroq(
  request: NexusCompletionRequest,
): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("GROQ_API_KEY");
  if (!apiKey) throw new Error("Groq is not configured");
  return completeCompatibleChat({
    request,
    apiKey,
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    provider: "groq",
    model: serverEnv("NEXUS_GROQ_MODEL") ?? "openai/gpt-oss-120b",
  });
}

async function completeOpenRouter(
  request: NexusCompletionRequest,
): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("OPENROUTER_API_KEY");
  if (!apiKey) throw new Error("OpenRouter is not configured");

  const appUrl = serverEnv("PUBLIC_APP_URL");
  return completeCompatibleChat({
    request,
    apiKey,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    provider: "openrouter",
    model: serverEnv("NEXUS_OPENROUTER_MODEL") ?? "openrouter/free",
    extraHeaders: {
      ...(appUrl ? { "HTTP-Referer": appUrl } : {}),
      "X-OpenRouter-Title": "ÍMPAR NEXUS",
    },
  });
}

async function completeAnthropic(
  request: NexusCompletionRequest,
): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("Anthropic is not configured");

  const model = serverEnv("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: request.system,
      messages: request.messages,
      max_tokens: request.maxOutputTokens ?? 1800,
    }),
    signal: AbortSignal.timeout(DIRECT_PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = data.content
    ?.filter((item) => item.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Anthropic returned no text");
  return { text, provider: "anthropic", model };
}

const COMPLETERS: Record<
  NexusProviderId,
  (request: NexusCompletionRequest) => Promise<Omit<NexusCompletionResult, "attemptedProviders">>
> = {
  openai: completeOpenAI,
  gemini: completeGemini,
  groq: completeGroq,
  openrouter: completeOpenRouter,
  anthropic: completeAnthropic,
};

export async function completeWithNexusRouter(
  request: NexusCompletionRequest,
): Promise<NexusCompletionResult> {
  const failures: string[] = [];

  // The public Edge gateway intentionally disables raw "completion" requests.
  // Only opt into the legacy completion route when a deployment explicitly
  // re-enables that contract; normal in-product NEXUS chat uses guest/member actions.
  if (publicSupabaseConfig() && serverEnv("NEXUS_ALLOW_LEGACY_EDGE_COMPLETION") === "true") {
    try {
      return await completeViaEdge(request);
    } catch (error) {
      failures.push(`edge: ${compactError(error)}`);
    }
  }

  const statuses = new Map(getNexusProviderStatus().map((status) => [status.id, status]));
  const attemptedProviders: NexusProviderId[] = [];

  for (const provider of request.providerOrder ?? getProviderOrder()) {
    const status = statuses.get(provider);
    if (!status?.configured) continue;

    attemptedProviders.push(provider);
    try {
      const result = await COMPLETERS[provider](request);
      return { ...result, attemptedProviders };
    } catch (error) {
      failures.push(`${provider}: ${compactError(error)}`);
    }
  }

  if (!attemptedProviders.length && !publicSupabaseConfig()) {
    throw new Error(
      "NEXUS has no inference transport configured. Connect Supabase or add a server-side model provider key.",
    );
  }

  throw new Error(`NEXUS inference failed: ${failures.join(" | ")}`);
}
