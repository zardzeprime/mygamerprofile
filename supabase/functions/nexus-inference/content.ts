export type MgpContentMatch = {
  contentKey: string;
  gameSlug?: string;
  moduleKey?: string;
  title: string;
  description: string;
  path: string;
  score: number;
};

type CatalogRow = {
  content_key: string;
  game_slug: string | null;
  module_key: string | null;
  title: string;
  description: string;
  path: string;
  keywords: string[] | null;
};

type GameRow = {
  slug: string;
  name: string;
  description: string | null;
};

const CATALOG_CACHE_TTL_MS = 90_000;
const CATALOG_STALE_TTL_MS = 10 * 60_000;
const CATALOG_FETCH_TIMEOUT_MS = 2_500;

let catalogCache:
  | { rows: CatalogRow[]; freshUntil: number; staleUntil: number }
  | undefined;
let catalogLoadInFlight: Promise<CatalogRow[]> | null = null;

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function serverHeaders(serviceRole: string) {
  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    Accept: "application/json",
  };
}

async function fetchJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(CATALOG_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`MGP catalog HTTP ${response.status}`);
  return await response.json() as T;
}

async function refreshCatalog(): Promise<CatalogRow[]> {
  const url = env("SUPABASE_URL");
  const serviceRole = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return catalogCache?.rows ?? [];

  const headers = serverHeaders(serviceRole);
  const [catalogResult, gamesResult] = await Promise.allSettled([
    fetchJson<CatalogRow[]>(
      `${url}/rest/v1/mgp_content_catalog?published=eq.true&select=content_key,game_slug,module_key,title,description,path,keywords`,
      headers,
    ),
    fetchJson<GameRow[]>(
      `${url}/rest/v1/games?active=eq.true&select=slug,name,description`,
      headers,
    ),
  ]);

  if (catalogResult.status !== "fulfilled") {
    console.warn("[NEXUS] MGP content catalog unavailable", String(catalogResult.reason).slice(0, 180));
    return catalogCache?.rows ?? [];
  }

  const catalog = catalogResult.value;

  // Fail closed for game-specific recommendations when live game availability
  // cannot be refreshed, but keep global catalog rows available.
  if (gamesResult.status !== "fulfilled") {
    console.warn("[NEXUS] active MGP game catalog unavailable", String(gamesResult.reason).slice(0, 180));
    return catalog.filter((row) => !row.game_slug);
  }

  const activeGames = gamesResult.value;
  const activeSlugs = new Set(activeGames.map((game) => game.slug));
  const publishedForActiveGames = catalog.filter(
    (row) => !row.game_slug || activeSlugs.has(row.game_slug),
  );

  const syntheticGameRows: CatalogRow[] = activeGames
    .filter((game) => !publishedForActiveGames.some(
      (row) => row.game_slug === game.slug && row.module_key === "overview",
    ))
    .map((game) => ({
      content_key: `game:${game.slug}:overview`,
      game_slug: game.slug,
      module_key: "overview",
      title: `${game.name} no MG Profile`,
      description: game.description?.trim() || `Hub ativo de ${game.name} no MG Profile.`,
      path: `/games/${game.slug}`,
      keywords: [game.name, game.slug, "jogo", "game", "hub"],
    }));

  return [...publishedForActiveGames, ...syntheticGameRows];
}

async function loadCatalog(): Promise<CatalogRow[]> {
  const now = Date.now();
  if (catalogCache && catalogCache.freshUntil > now) return catalogCache.rows;
  if (catalogLoadInFlight) return catalogLoadInFlight;

  catalogLoadInFlight = refreshCatalog()
    .then((rows) => {
      const refreshedAt = Date.now();
      if (rows.length || !catalogCache) {
        catalogCache = {
          rows,
          freshUntil: refreshedAt + CATALOG_CACHE_TTL_MS,
          staleUntil: refreshedAt + CATALOG_STALE_TTL_MS,
        };
        return rows;
      }
      return catalogCache.rows;
    })
    .catch((error) => {
      console.warn("[NEXUS] MGP catalog refresh failed", String(error).slice(0, 180));
      if (catalogCache && catalogCache.staleUntil > Date.now()) return catalogCache.rows;
      return [];
    })
    .finally(() => {
      catalogLoadInFlight = null;
    });

  return catalogLoadInFlight;
}

export async function findMgpContent(query: string, limit = 4): Promise<MgpContentMatch[]> {
  const queryNorm = normalize(query);
  const queryTokens = new Set(tokens(query));
  if (!queryTokens.size) return [];

  const rows = await loadCatalog();
  return rows
    .map((row) => {
      const title = normalize(row.title);
      const description = normalize(row.description);
      const keywords = (row.keywords ?? []).map(normalize);
      const haystack = `${title} ${description} ${keywords.join(" ")} ${normalize(row.game_slug ?? "")} ${normalize(row.module_key ?? "")}`;
      let score = 0;
      for (const token of queryTokens) {
        if (title.includes(token)) score += 5;
        if (keywords.some((keyword) => keyword === token || keyword.includes(token) || token.includes(keyword))) score += 4;
        if (haystack.includes(token)) score += 1;
      }
      if (keywords.some((keyword) => keyword.length >= 4 && queryNorm.includes(keyword))) score += 5;
      return {
        contentKey: row.content_key,
        gameSlug: row.game_slug ?? undefined,
        moduleKey: row.module_key ?? undefined,
        title: row.title,
        description: row.description,
        path: row.path,
        score,
      } satisfies MgpContentMatch;
    })
    .filter((match) => match.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 6)));
}

export async function augmentSystemWithMgpContent(system: string, query: string) {
  const matches = await findMgpContent(query);
  const rules = [
    "MGP CONTENT GROUNDING:",
    "The live MGP games table and the published MGP content catalog are the availability source of truth for this turn.",
    "Only claim that MGP has a guide, page, module, database entry or feature when it is explicitly listed below for this turn.",
    "Never advertise content for a paused or inactive game.",
    "If nothing relevant is listed, answer the user's question normally but do not advertise or invent MGP content.",
    "When a listed item is genuinely relevant, you may naturally mention that MGP has it and give its real path/module.",
  ];

  if (!matches.length) {
    rules.push("Relevant currently available MGP content for this turn: none found.");
    return `${system}\n\n${rules.join("\n")}`;
  }

  rules.push("Relevant currently available MGP content for this turn:");
  for (const match of matches) {
    rules.push(
      `- ${match.title} | module=${match.moduleKey ?? "overview"} | path=${match.path} | ${match.description}`,
    );
  }
  return `${system}\n\n${rules.join("\n")}`;
}
