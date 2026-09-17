import type { PlayerObservation } from "./types";

// Agent classes: https://playvalorant.com/en-us/agents/ (2026-09-17).
const CLASSES: Record<string, string> = Object.fromEntries([
  ...["jett", "neon", "phoenix", "raze", "reyna", "yoru", "iso", "waylay"].map((agent) => [agent, "Duelista"]),
  ...["astra", "brimstone", "clove", "harbor", "omen", "viper", "miks"].map((agent) => [agent, "Controlador"]),
  ...["breach", "fade", "gekko", "kayo", "skye", "sova", "tejo"].map((agent) => [agent, "Iniciador"]),
  ...["chamber", "cypher", "deadlock", "killjoy", "sage", "vyse", "veto"].map((agent) => [agent, "Sentinela"]),
]);

/** Class of the most-used agent(s), not a claim about an official roster role. */
export function observedRole(observation?: PlayerObservation): string | undefined {
  if (!observation?.agents.length) return undefined;
  const maximum = Math.max(...observation.agents.map((agent) => agent.maps));
  const roles = [...new Set(observation.agents.filter((agent) => agent.maps === maximum)
    .map((agent) => CLASSES[agent.agent]).filter(Boolean))];
  return roles.length ? roles.join(" / ") : undefined;
}
