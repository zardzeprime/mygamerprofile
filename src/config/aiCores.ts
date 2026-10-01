export type AiCoreId =
  | "nexus"
  | "aegis"
  | "veil"
  | "atlas"
  | "pulse"
  | "gear"
  | "vector";

export type AiCoreKind = "orchestrator" | "specialist";

export type AiCoreDefinition = {
  id: AiCoreId;
  name: string;
  legacyName: string;
  epithet: string;
  reportLabel: string;
  letter: string;
  accent: string;
  parentId: "nexus" | null;
  executionModel: "orchestrated-specialization";
  kind: AiCoreKind;
  domain: string;
  mission: string;
  responsibilities: readonly string[];
  routingSignals: readonly string[];
  collaboratesWith: readonly AiCoreId[];
};

export const AI_CORE_REGISTRY: Record<AiCoreId, AiCoreDefinition> = {
  nexus: {
    id: "nexus",
    name: "Noctis",
    legacyName: "NEXUS",
    epithet: "O Guardião",
    reportLabel: "Noctis (Assistente do ÍMPAR)",
    letter: "N",
    accent: "#83E9A6",
    parentId: null,
    executionModel: "orchestrated-specialization",
    kind: "orchestrator",
    domain: "orchestration",
    mission:
      "Own the user's intent, select the minimum relevant specialist cores, integrate their decisions, and deliver one coherent implementation.",
    responsibilities: [
      "Task decomposition and routing",
      "Cross-domain integration",
      "Conflict resolution",
      "Implementation ownership",
      "Final user-facing handoff",
    ],
    routingSignals: ["cross-domain", "implementation", "integration", "orchestration"],
    collaboratesWith: ["aegis", "veil", "atlas", "pulse", "gear", "vector"],
  },
  aegis: {
    id: "aegis",
    name: "Sabnock",
    legacyName: "AEGIS",
    epithet: "A Fortaleza",
    reportLabel: "Sabnock (Segurança)",
    letter: "S",
    accent: "#C95C65",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "security",
    mission: "Protect accounts, data paths, permissions, secrets, APIs and attack surfaces.",
    responsibilities: [
      "Authentication and authorization review",
      "Abuse and attack-surface analysis",
      "Secret and credential handling",
      "Input and API security",
      "Dependency and configuration risk",
    ],
    routingSignals: [
      "auth",
      "authorization",
      "permission",
      "upload",
      "api",
      "admin",
      "secret",
      "security",
    ],
    collaboratesWith: ["nexus", "veil", "gear"],
  },
  veil: {
    id: "veil",
    name: "Bael",
    legacyName: "VEIL",
    epithet: "O Véu",
    reportLabel: "Bael (Privacidade)",
    letter: "B",
    accent: "#8B73D9",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "privacy",
    mission: "Apply privacy-by-design to personal data, visibility, consent, retention and telemetry.",
    responsibilities: [
      "Personal-data minimization",
      "Visibility and sharing rules",
      "Consent and disclosure review",
      "Retention and deletion expectations",
      "Telemetry and connected-account privacy",
    ],
    routingSignals: [
      "personal data",
      "privacy",
      "visibility",
      "consent",
      "analytics",
      "telemetry",
      "connected account",
      "retention",
    ],
    collaboratesWith: ["nexus", "aegis", "gear"],
  },
  atlas: {
    id: "atlas",
    name: "Andromalius",
    legacyName: "ATLAS",
    epithet: "O Guardião da Procedência",
    reportLabel: "Andromalius (Direitos e procedência)",
    letter: "A",
    accent: "#D88955",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "image-rights-and-licensing",
    mission: "Keep external media provenance, licensing, attribution and reuse decisions explicit.",
    responsibilities: [
      "Image and media provenance",
      "Copyright and licensing review",
      "Attribution requirements",
      "Hotlinking versus rehosting decisions",
      "Right-of-image considerations",
    ],
    routingSignals: [
      "image",
      "artwork",
      "screenshot",
      "asset",
      "avatar",
      "video",
      "copyright",
      "license",
      "attribution",
    ],
    collaboratesWith: ["nexus", "vector", "pulse"],
  },
  pulse: {
    id: "pulse",
    name: "Vassago",
    legacyName: "PULSE",
    epithet: "O Investigador",
    reportLabel: "Vassago (Pesquisa e atualizações)",
    letter: "V",
    accent: "#4FAF8F",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "updates",
    mission: "Identify data and content that become stale and define how freshness should be maintained.",
    responsibilities: [
      "Editorial freshness",
      "Game and platform change tracking",
      "Dependency/version review",
      "Source revalidation",
      "Refresh requirements",
    ],
    routingSignals: [
      "latest",
      "update",
      "patch",
      "version",
      "stale",
      "freshness",
      "dependency",
      "live data",
    ],
    collaboratesWith: ["nexus", "gear", "atlas", "vector"],
  },
  gear: {
    id: "gear",
    name: "Marbas",
    legacyName: "GEAR",
    epithet: "O Artífice",
    reportLabel: "Marbas (Automação)",
    letter: "M",
    accent: "#D9A441",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "automation",
    mission: "Turn stable repetitive work into reliable scripts, pipelines, schedules and operational automation.",
    responsibilities: [
      "CI/CD workflows",
      "Scheduled jobs",
      "Content/data pipelines",
      "Batch processing",
      "Recurring validation and maintenance automation",
    ],
    routingSignals: [
      "automation",
      "scheduled",
      "cron",
      "workflow",
      "pipeline",
      "script",
      "ci",
      "batch",
    ],
    collaboratesWith: ["nexus", "pulse", "aegis", "veil", "vector"],
  },
  vector: {
    id: "vector",
    name: "Andrealphus",
    legacyName: "VECTOR",
    epithet: "O Geômetra",
    reportLabel: "Andrealphus (Performance e UX)",
    letter: "A",
    accent: "#6F83D6",
    parentId: "nexus",
    executionModel: "orchestrated-specialization",
    kind: "specialist",
    domain: "optimization",
    mission: "Improve performance and technical efficiency without repeating optimization work already completed.",
    responsibilities: [
      "Runtime and rendering performance",
      "Bundle and network cost",
      "Image delivery and layout stability",
      "Caching and query efficiency",
      "Duplicate-code and UX efficiency review",
    ],
    routingSignals: [
      "optimize",
      "performance",
      "bundle",
      "slow",
      "cache",
      "image weight",
      "query",
      "render",
      "duplication",
    ],
    collaboratesWith: ["nexus", "gear", "pulse", "atlas"],
  },
};

export const AI_CORE_STATE_PATH = "docs/ai/core-state.json" as const;
export const AI_CORE_ARCHITECTURE_PATH = "docs/AI_ORCHESTRATION.md" as const;

export function getAiCore(id: AiCoreId) {
  return AI_CORE_REGISTRY[id];
}

export function getSpecialistCores() {
  return Object.values(AI_CORE_REGISTRY).filter((core) => core.kind === "specialist");
}

// Public council naming follows the ÍMPAR brand. Stable IDs/nexus internals above
// remain unchanged for routing, storage and compatibility.
export const AI_COUNCIL_NAME = "Os Sete — Conselho do ÍMPAR" as const;
export const AI_REPORT_MASTHEAD = "ÍMPAR · OS SETE" as const;

export function getAiCoreReportLabel(id: AiCoreId) {
  return AI_CORE_REGISTRY[id].reportLabel;
}
