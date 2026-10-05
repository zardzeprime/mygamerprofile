import { GAMES, type GameConfig } from "@/config/games";

export type GameAvailabilityState = "active" | "paused";

export const ACTIVE_GAME_SLUGS = [
  "dark-souls-remastered",
  "dark-souls-iii",
  "warframe",
  "valorant",
  "league-of-legends",
] as const;

const ACTIVE_GAME_SLUG_SET = new Set<string>(ACTIVE_GAME_SLUGS);

export const ACTIVE_GAMES: GameConfig[] = GAMES.filter((game) =>
  ACTIVE_GAME_SLUG_SET.has(game.slug),
);

export const PAUSED_GAMES: GameConfig[] = GAMES.filter(
  (game) => !ACTIVE_GAME_SLUG_SET.has(game.slug),
);

export function isGameActive(slug: string) {
  return ACTIVE_GAME_SLUG_SET.has(slug);
}

export function getGameAvailability(slug: string): GameAvailabilityState {
  return isGameActive(slug) ? "active" : "paused";
}
