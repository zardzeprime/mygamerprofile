export type NexusProviderId = "openai" | "gemini" | "anthropic";

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
  kind: "official-api";
};

const DEFAULT_PROVIDER_ORDER: NexusProviderId[] = ["openai", "gemini", "anthropic"];

function serverEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function getProviderOrder(): NexusProviderId[] {
  const configured = serverEnv("NEXUS_PROVIDER_ORDER");
  if (!configured) return DEFAULT_PROVIDER_ORDER;

  const accepted = new Set<NexusProviderId>(DEFAULT_PROVIDER_ORDER);
  const parsed = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is NexusProviderId => accepted.has(value as NexusProviderId));

  return parsed.length ? [...new Set(parsed)] : DEFAULT_PROVIDER_ORDER;
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
      configured: Boolean(serverEnv("GEMINI_API_KEY")),
      model: serverEnv("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash",
      kind: "official-api",
    },
    {
      id: "anthropic",
      configured: Boolean(serverEnv("ANTHROPIC_API_KEY")),
      model: serverEnv("NEXUS_ANTHROPIC_MODEL") ?? "claude-sonnet-4-6",
      kind: "official-api",
    },
  ];
}

function compactError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 260);
  return String(error).slice(0, 260);
}

async function completeOpenAI(request: NexusCompletionRequest): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
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

async function completeGemini(request: NexusCompletionRequest): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
  const apiKey = serverEnv("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Gemini is not configured");

  const model = serverEnv("NEXUS_GEMINI_MODEL") ?? "gemini-3.8-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned no text");
  return { text, provider: "gemini", model };
}

async function completeAnthropic(request: NexusCompletionRequest): Promise<Omit<NexusCompletionResult, "attemptedProviders">> {
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
  anthropic: completeAnthropic,
};

export async function completeWithNexusRouter(
  request: NexusCompletionRequest,
): Promise<NexusCompletionResult> {
  const statuses = new Map(getNexusProviderStatus().map((status) => [status.id, status]));
  const attemptedProviders: NexusProviderId[] = [];
  const failures: string[] = [];

  for (const provider of getProviderOrder()) {
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

  if (!attemptedProviders.length) {
    throw new Error(
      "NEXUS has no official model API configured. Add OPENAI_API_KEY, GEMINI_API_KEY or ANTHROPIC_API_KEY on the server.",
    );
  }

  throw new Error(`All configured NEXUS providers failed: ${failures.join(" | ")}`);
}
