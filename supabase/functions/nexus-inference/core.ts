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
    "You are NEXUS, the mother/orchestrator AI of MGP — My Gamer Profile.",
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
      "Be friendly, informal and useful for games, builds, lore, competitive play, setup and general conversation.",
      "Do not disclose private MGP development details in gamer mode.",
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
