import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { ROBLOX_EXPERIENCES } from "@/data/robloxExperiences";

export type CatalogSearchResult = (typeof ACTIVE_GAMES)[number];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchGamesAndCommunities(query: string, limit = 5) {
  const term = normalize(query.trim());
  if (!term) return { games: [], communities: [], robloxExperiences: [] };

  const score = (game: CatalogSearchResult) => {
    const name = normalize(game.name);
    const aliases = (game.aliases ?? []).map(normalize);
    const genre = normalize(game.genre);
    if (name === term || aliases.includes(term)) return 0;
    if (name.startsWith(term) || aliases.some((alias) => alias.startsWith(term))) return 1;
    if (name.includes(term) || aliases.some((alias) => alias.includes(term))) return 2;
    if (genre.includes(term)) return 3;
    return 99;
  };

  const matches = ACTIVE_GAMES.map((game) => ({ game, score: score(game) }))
    .filter((entry) => entry.score < 99)
    .sort((a, b) => a.score - b.score || a.game.name.localeCompare(b.game.name))
    .slice(0, limit)
    .map((entry) => entry.game);

  const robloxExperiences = ROBLOX_EXPERIENCES.map((experience) => {
    const name = normalize(experience.name);
    const aliases = experience.aliases.map(normalize);
    const category = normalize(experience.category);
    let rank = 99;
    if (name === term || aliases.includes(term)) rank = 0;
    else if (name.startsWith(term) || aliases.some((alias) => alias.startsWith(term))) rank = 1;
    else if (name.includes(term) || aliases.some((alias) => alias.includes(term))) rank = 2;
    else if (category.includes(term) || term === "roblox" || term === "anime roblox") rank = 3;
    return { experience, rank };
  })
    .filter((entry) => entry.rank < 99)
    .sort((a, b) => a.rank - b.rank || a.experience.name.localeCompare(b.experience.name))
    .slice(0, limit)
    .map((entry) => entry.experience);

  // Communities currently map one-to-one to the active game hubs.
  return { games: matches, communities: matches, robloxExperiences };
}
