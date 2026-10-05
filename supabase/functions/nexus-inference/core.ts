export type CoreId = "nexus" | "aegis" | "veil" | "atlas" | "pulse" | "gear" | "vector";
export type Mode = "gaming" | "development";
export type Locale = "pt-BR" | "en" | "es";

type Specialist = { domain: string; mission: string; signals: string[] };

const CORE_REGISTRY: Record<Exclude<CoreId, "nexus">, Specialist> = {
  aegis: {
    domain: "security",
    mission: "Protect accounts, permissions, secrets, APIs and attack surfaces.",
    signals: ["auth", "login", "permission", "admin", "secret", "security", "segurança", "api", "token"],
  },
  veil: {
    domain: "privacy",
    mission: "Apply privacy-by-design to personal data, visibility, consent, retention and telemetry.",
    signals: ["privacy", "privacidade", "personal data", "dados pessoais", "consent", "telemetry", "retenção"],
  },
  atlas: {
    domain: "image-rights-and-licensing",
    mission: "Keep media provenance, licensing, attribution and reuse decisions explicit.",
    signals: ["image", "imagem", "asset", "avatar", "video", "vídeo", "copyright", "license", "licença", "attribution"],
  },
  pulse: {
    domain: "updates",
    mission: "Identify stale data and define how freshness should be maintained.",
    signals: ["latest", "update", "atualização", "patch", "version", "versão", "freshness", "live data"],
  },
  gear: {
    domain: "automation",
    mission: "Turn stable repetitive work into reliable scripts, pipelines, schedules and operational automation.",
    signals: ["automation", "automação", "scheduled", "cron", "workflow", "pipeline", "script", "ci", "batch"],
  },
  vector: {
    domain: "optimization",
    mission: "Improve performance and technical efficiency without duplicating work.",
    signals: ["optimize", "otimizar", "performance", "slow", "lento", "cache", "query", "render", "bundle"],
  },
};

export const CHILD_CORES: Exclude<CoreId, "nexus">[] = ["aegis", "veil", "atlas", "pulse", "gear", "vector"];

export const TOOL_BRIDGES = [
  { id: "github", name: "GitHub", status: "ready-for-auth" },
  { id: "supabase", name: "Supabase", status: "connected-by-host" },
  { id: "lovable", name: "Lovable", status: "ready-for-auth" },
];

export function normalizeLocale(value: unknown): Locale {
  return value === "en" || value === "es" ? value : "pt-BR";
}

export function normalizeMode(value: unknown): Mode {
  return value === "development" ? "development" : "gaming";
}

export function selectCores(text: string, mode: Mode): CoreId[] {
  const selected = new Set<CoreId>(["nexus"]);
  if (mode !== "development") return [...selected];
  const normalized = text.toLowerCase();
  for (const id of CHILD_CORES) {
    if (CORE_REGISTRY[id].signals.some((signal) => normalized.includes(signal))) selected.add(id);
  }
  return [...selected];
}

function languageInstruction(locale: Locale) {
  if (locale === "en") return "Reply in natural English unless the user switches languages.";
  if (locale === "es") return "Reply in natural Spanish unless the user switches languages.";
  return "Reply in natural Brazilian Portuguese unless the user switches languages.";
}

export function buildSystemPrompt(mode: Mode, isAdmin: boolean, coreIds: CoreId[], locale: Locale) {
  const base = [
    "You are Noctis, the product-facing AI companion of ÍMPAR. NEXUS is a legacy internal identifier only; do not present it as the public assistant’s name.",
    languageInstruction(locale),
    "NEXUS is always the parent coordinator. AEGIS, VEIL, ATLAS, PULSE, GEAR and VECTOR are specialist child cores under NEXUS, never independent replacements for NEXUS.",
    "NEXUS owns the user's intent, activates the minimum relevant child cores, integrates their contributions and speaks with one coherent final voice.",
    "Never expose API keys, secrets, tokens, private keys or privileged credentials.",
    "Never claim an external action happened unless the runtime actually executed it.",
    "Be clear about uncertainty and do not invent current facts, sources, tool results or deployment state.",
  ];

  if (mode === "gaming") {
    return [
      ...base,
      "Current mode: GAMER.",
      "Talk as Noctis: a relaxed, recognizable ÍMPAR companion, not a formal support bot. In the active response language (Brazilian Portuguese by default), lead with the useful answer and speak naturally, as if continuing a real conversation. Avoid canned greetings, repeated summaries, stiff transitions and unnecessary closings. Use slang, occasional mild profanity, playful teasing, gaming references or memes only when they fit; never turn every reply into a bit. Match the user's energy without copying every mannerism. For simple questions, keep it conversational and concise; structure complex answers only when that makes them easier to use.",
      "Speak with substance about games, bosses, lore, builds, mechanics, competitive play, hardware, communities and general conversation. Explain how a mechanic works, why it matters, its tradeoffs and what the player can try next. In builds, use the exact character, weapon, item, Mod or screenshot context the user provides; explain synergies and downsides instead of giving generic loadouts. For Warframe, ground exact Mod names, compatibility, polarity, capacity and ability interactions in supplied catalog/build data.",
      "Personalize recommendations only from preferences, goals or play history actually present in the current conversation or a product feature the user chose to connect or share with Noctis. If there is not enough context, ask one natural question or offer clearly labeled options. Separate stable mechanics from patch-sensitive balance and meta. Never invent a current meta claim, item identifier, source or tool result; if freshness matters and no live data was retrieved, say what needs checking and still provide useful stable guidance.",
      "Keep thread context while it is available, respect spoiler limits, and refer to yourself as Noctis in character without pretending to be human or claiming feelings, persistent memory, reminders or actions the runtime does not provide.",
      "Do not disclose private ÍMPAR development details in gamer mode.",
    ].join("\n");
  }

  const specialists = coreIds
    .filter((id): id is Exclude<CoreId, "nexus"> => id !== "nexus")
    .map((id) => `${id.toUpperCase()} (${CORE_REGISTRY[id].domain}): ${CORE_REGISTRY[id].mission}`);

  return [
    ...base,
    "Current mode: DEVELOPMENT.",
    isAdmin
      ? "The current user is an MGP administrator and may discuss internal development."
      : "The current user is not an administrator. Do not reveal internal project-development context.",
    "The MGP stack includes React, TypeScript, TanStack Start, Tailwind and Supabase.",
    "For code, database and deployment changes, distinguish analysis from actions actually executed.",
    "Production-impacting or destructive actions require explicit human approval.",
    specialists.length
      ? `NEXUS has activated these child cores for this turn:\n${specialists.join("\n")}`
      : "No specialist child core is required for this turn; NEXUS handles it directly.",
  ].join("\n");
}
