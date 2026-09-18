import { augmentSystemWithMgpContent } from "./content.ts";

export type ProviderId = "openai" | "gemini" | "groq" | "openrouter" | "anthropic";
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type CompletionRequest = {
  system: string;
  messages: ChatMessage[];
  effort?: "low" | "medium" | "high";
  maxOutputTokens?: number;
  providerOrder?: ProviderId[];
  timeoutMs?: number;
};

export type ProviderTiming = {
  provider: ProviderId;
  durationMs: number;
  ok: boolean;
};

const PROVIDERS: ProviderId[] = ["openai", "gemini", "groq", "openrouter", "anthropic"];

// Prefer the provider that has already been serving successful NEXUS traffic,
// then fail over to the other configured providers. OpenRouter/free stays last
// because free-router latency/availability can vary substantially.
const DEFAULT_ORDER: ProviderId[] = ["gemini", "groq", "openai", "anthropic", "openrouter"];
const PROVIDER_TIMEOUT_MS: Record<ProviderId, number> = {
  gemini: 15_000,
  groq: 10_000,
  openai: 18_000,
  anthropic: 18_000,
  openrouter: 10_000,
};
const OVERALL_PROVIDER_BUDGET_MS = 42_000;
const SINGLE_PROVIDER_RETRY_DELAY_MS = 300;

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function errorText(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

function requestSignal(timeoutMs: number) {
  return AbortSignal.timeout(Math.max(1_000, timeoutMs));
}

function isRetryableProviderFailure(error: unknown) {
  const message = errorText(error).toLowerCase();
  return (
    message.includes(" 429:") ||
    /\s5\d\d:/.test(message) ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("aborted") ||
    message.includes("network") ||
    message.includes("fetch failed")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function completeWithRetry(
  provider: ProviderId,
  request: CompletionRequest,
  allowSameProviderRetry: boolean,
  deadlineAt: number,
) {
  let lastError: unknown;
  const attempts = allowSameProviderRetry ? 2 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const remainingBudget = deadlineAt - Date.now();
    if (remainingBudget <= 1_000) throw new Error("NEXUS_PROVIDER_BUDGET_EXHAUSTED");

    const timeoutMs = Math.min(PROVIDER_TIMEOUT_MS[provider], remainingBudget);
    try {
      return await COMPLETERS[provider]({ ...request, timeoutMs });
    } catch (error) {
      lastError = error;
      if (
        attempt === attempts - 1 ||
        !isRetryableProviderFailure(error) ||
        deadlineAt - Date.now() <= SINGLE_PROVIDER_RETRY_DELAY_MS + 1_000
      ) {
        throw error;
      }
      await sleep(SINGLE_PROVIDER_RETRY_DELAY_MS);
    }
  }

  throw lastError;
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
      max_output_tokens: request.maxOutputTokens ?? 1200,
    }),
    signal: requestSignal(request.timeoutMs ?? PROVIDER_TIMEOUT_MS.openai),
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

  const primaryModel = env("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const models = [
    primaryModel,
    "gemini-3.7-flash",
    "gemini-3.6-flash",
  ].filter((model, index, all) => all.indexOf(model) === index);

  const providerBudgetMs = request.timeoutMs ?? PROVIDER_TIMEOUT_MS.gemini;
  const deadlineAt = Date.now() + providerBudgetMs;
  const failures: string[] = [];

  for (const model of models) {
    const remainingBudget = deadlineAt - Date.now();
    if (remainingBudget <= 1_000) break;

    const perModelTimeoutMs = Math.min(
      model === primaryModel ? 7_000 : 5_000,
      remainingBudget,
    );

    try {
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
            generationConfig: {
              maxOutputTokens: request.maxOutputTokens ?? 1200,
              thinkingConfig: {
                thinkingLevel: request.effort === "high" ? "high" : "low",
              },
            },
          }),
          signal: requestSignal(perModelTimeoutMs),
        },
      );

      if (!response.ok) {
        const body = (await response.text()).slice(0, 220);
        failures.push(`${model} ${response.status}: ${body}`);

        // Invalid auth/permission errors apply to the shared API key, so trying
        // sibling models would only add latency. Capacity/quota/server/model
        // errors may be model-specific and are eligible for fallback.
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini ${response.status}: ${body}`);
        }
        continue;
      }

      const data = await response.json() as {
        candidates?: Array<{
          finishReason?: string;
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
      if (!text) {
        const finishReason = data.candidates?.[0]?.finishReason;
        failures.push(`${model}: no text${finishReason ? ` (${finishReason})` : ""}`);
        continue;
      }

      return { text, provider: "gemini" as const, model };
    } catch (error) {
      const message = errorText(error);
      failures.push(`${model}: ${message}`);
      if (
        message.includes("Gemini 401:") ||
        message.includes("Gemini 403:")
      ) {
        throw error;
      }
    }
  }

  throw new Error(`Gemini model chain failed: ${failures.join(" | ").slice(0, 900)}`);
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
    headers["HTTP-Referer"] = env("PUBLIC_APP_URL") ?? "https://mgprofile.online";
    headers["X-OpenRouter-Title"] = "MG Profile NEXUS";
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: request.system }, ...request.messages],
      max_tokens: request.maxOutputTokens ?? 1200,
      temperature: 0.6,
    }),
    signal: requestSignal(request.timeoutMs ?? PROVIDER_TIMEOUT_MS[provider]),
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
      max_tokens: request.maxOutputTokens ?? 1200,
    }),
    signal: requestSignal(request.timeoutMs ?? PROVIDER_TIMEOUT_MS.anthropic),
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
  const providerState = new Map<ProviderId, ReturnType<typeof providerStatuses>[number]>(
    providerStatuses().map((entry) => [entry.id, entry]),
  );
  const orderedProviders = providerOrder(request.providerOrder).filter(
    (provider) => providerState.get(provider)?.configured,
  );

  if (!orderedProviders.length) throw new Error("NEXUS_NO_PROVIDER");

  const attemptedProviders: ProviderId[] = [];
  const providerTimings: ProviderTiming[] = [];
  const failures: string[] = [];
  const overallStartedAt = Date.now();
  const deadlineAt = overallStartedAt + OVERALL_PROVIDER_BUDGET_MS;

  const latestUserMessage =
    [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";

  let groundedSystem = request.system;
  try {
    groundedSystem = await augmentSystemWithMgpContent(request.system, latestUserMessage);
  } catch (error) {
    // Site-content grounding is useful context, but it must never prevent the
    // support AI from answering if the catalog/database is temporarily slow.
    console.warn("[NEXUS] content grounding skipped", errorText(error));
  }

  const groundedRequest: CompletionRequest = {
    ...request,
    system: groundedSystem,
  };

  const allowSameProviderRetry = orderedProviders.length === 1;

  for (const provider of orderedProviders) {
    if (Date.now() >= deadlineAt) break;

    attemptedProviders.push(provider);
    const startedAt = Date.now();

    try {
      const result = await completeWithRetry(
        provider,
        groundedRequest,
        allowSameProviderRetry,
        deadlineAt,
      );
      providerTimings.push({
        provider,
        durationMs: Date.now() - startedAt,
        ok: true,
      });
      return {
        ...result,
        attemptedProviders,
        providerTimings,
        latencyMs: Date.now() - overallStartedAt,
      };
    } catch (error) {
      providerTimings.push({
        provider,
        durationMs: Date.now() - startedAt,
        ok: false,
      });
      failures.push(`${provider}: ${errorText(error)}`);
    }
  }

  console.error("[NEXUS] all providers failed", failures.join(" | "));
  throw new Error("NEXUS_ALL_PROVIDERS_FAILED");
}
