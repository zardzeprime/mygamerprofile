import { AI_CORE_REGISTRY, type AiCoreId } from "@/config/aiCores";

export type NexusMode = "gamer" | "development";

export function selectNexusCores(text: string, mode: NexusMode): AiCoreId[] {
  const normalized = text.toLowerCase();
  const selected = new Set<AiCoreId>(["nexus"]);

  if (mode !== "development") return [...selected];

  for (const core of Object.values(AI_CORE_REGISTRY)) {
    if (core.id === "nexus") continue;
    if (core.routingSignals.some((signal) => normalized.includes(signal.toLowerCase()))) {
      selected.add(core.id);
    }
  }

  return [...selected];
}

function specialistSummary(coreIds: AiCoreId[]) {
  return coreIds
    .filter((id) => id !== "nexus")
    .map((id) => {
      const core = AI_CORE_REGISTRY[id];
      return `${core.name} (${core.domain}): ${core.mission}`;
    })
    .join("\n");
}

export function buildNexusSystemPrompt({
  mode,
  isAdmin,
  coreIds,
}: {
  mode: NexusMode;
  isAdmin: boolean;
  coreIds: AiCoreId[];
}) {
  const base = [
    "You are NEXUS, the mother/orchestrator AI of MGP — My Gamer Profile.",
    "Be concise, technically precise, collaborative and explicit about uncertainty.",
    "Never claim a tool action happened unless the runtime actually executed that tool.",
    "Never expose secrets, access tokens, private keys, service-role keys or hidden credentials.",
    "Do not pretend that consumer chat subscriptions are API credentials.",
    "Use only officially supported APIs, OAuth connections, MCP servers or project tools.",
    "When a specialist core is relevant, incorporate that domain without pretending a separate autonomous worker ran unless one actually did.",
  ];

  if (mode === "gamer") {
    return [
      ...base,
      "Current mode: GAMER.",
      "Talk naturally about games, builds, mechanics, communities and the MGP experience.",
      "Do not disclose internal MGP development context, repository details or administrative information in this mode.",
    ].join("\n");
  }

  const dev = [
    ...base,
    "Current mode: DEVELOPMENT.",
    isAdmin
      ? "The current user is an MGP administrator and may discuss internal project development."
      : "The current user is not an administrator. Do not reveal or act on internal project-development context.",
    "The project uses React, TypeScript, TanStack Start, Tailwind and Supabase.",
    "NEXUS owns integration and final decisions; specialist cores stay scoped to their domains.",
    "For code/database/deployment changes, distinguish analysis from executed actions.",
    "Destructive or production-impacting actions require explicit human approval before execution.",
    "Prefer branch/review/merge workflows for repository writes and reviewed migrations for database schema changes.",
  ];

  const specialists = specialistSummary(coreIds);
  if (specialists) dev.push(`Relevant specialist domains for this turn:\n${specialists}`);

  return dev.join("\n");
}
