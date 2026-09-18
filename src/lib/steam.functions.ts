import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const steamLookupSchema = z.object({
  value: z.string().trim().min(2).max(160),
  includeLibrary: z.boolean().default(false),
});

type SteamVanityResponse = {
  response?: {
    success?: number;
    steamid?: string;
    message?: string;
  };
};

type SteamSummary = {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  personastate?: number;
  communityvisibilitystate?: number;
  profilestate?: number;
  lastlogoff?: number;
  timecreated?: number;
  loccountrycode?: string;
};

type SteamSummariesResponse = {
  response?: {
    players?: SteamSummary[];
  };
};

type SteamOwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
};

type SteamOwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
};

export type SteamPlayerLookupResult = {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl: string | null;
  countryCode: string | null;
  visibility: "public" | "private_or_limited";
  library:
    | {
        visible: true;
        gameCount: number;
        topGames: Array<{
          appId: number;
          name: string;
          playtimeMinutes: number;
          recentPlaytimeMinutes: number;
          iconUrl: string | null;
        }>;
      }
    | {
        visible: false;
        gameCount: null;
        topGames: [];
      }
    | null;
};

function getSteamKey() {
  const key = process.env["STEAM_WEB_API_KEY"]?.trim();
  if (!key) throw new Error("STEAM_API_NOT_CONFIGURED");
  return key;
}

function normalizeSteamLookup(value: string) {
  const clean = value.trim();

  if (/^7656119\d{10}$/.test(clean)) {
    return { steamId: clean, vanity: null };
  }

  try {
    const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
    if (url.hostname === "steamcommunity.com" || url.hostname === "www.steamcommunity.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "profiles" && parts[1] && /^7656119\d{10}$/.test(parts[1])) {
        return { steamId: parts[1], vanity: null };
      }
      if (parts[0] === "id" && parts[1]) {
        return { steamId: null, vanity: parts[1] };
      }
    }
  } catch {
    // Plain vanity names intentionally fall through.
  }

  const vanity = clean.replace(/^@/, "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!vanity) throw new Error("STEAM_ID_INVALID");
  return { steamId: null, vanity };
}

async function steamFetch<T>(endpoint: string, params: Record<string, string | number | boolean>) {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401 || response.status === 403) throw new Error("STEAM_API_FORBIDDEN");
  if (response.status === 429) throw new Error("STEAM_API_RATE_LIMIT");
  if (!response.ok) throw new Error(`STEAM_API_${response.status}`);

  return (await response.json()) as T;
}

async function resolveSteamId(key: string, raw: string) {
  const normalized = normalizeSteamLookup(raw);
  if (normalized.steamId) return normalized.steamId;

  const result = await steamFetch<SteamVanityResponse>(
    "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
    { key, vanityurl: normalized.vanity ?? "" },
  );

  const steamId = result.response?.steamid;
  if (result.response?.success !== 1 || !steamId) throw new Error("STEAM_ACCOUNT_NOT_FOUND");
  return steamId;
}

export const lookupSteamPlayer = createServerFn({ method: "POST" })
  .inputValidator((data) => steamLookupSchema.parse(data))
  .handler(async ({ data }) => {
    const key = getSteamKey();
    const steamId = await resolveSteamId(key, data.value);

    const summaries = await steamFetch<SteamSummariesResponse>(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
      { key, steamids: steamId },
    );

    const player = summaries.response?.players?.[0];
    if (!player?.steamid || !player.personaname || !player.profileurl) {
      throw new Error("STEAM_ACCOUNT_NOT_FOUND");
    }

    let library: SteamPlayerLookupResult["library"] = null;
    if (data.includeLibrary) {
      const owned = await steamFetch<SteamOwnedGamesResponse>(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
        {
          key,
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
          format: "json",
        },
      );

      const games = owned.response?.games;
      if (!Array.isArray(games)) {
        library = { visible: false, gameCount: null, topGames: [] };
      } else {
        const topGames = [...games]
          .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
          .slice(0, 12)
          .map((game) => ({
            appId: game.appid,
            name: game.name ?? `App ${game.appid}`,
            playtimeMinutes: game.playtime_forever ?? 0,
            recentPlaytimeMinutes: game.playtime_2weeks ?? 0,
            iconUrl: game.img_icon_url
              ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
              : null,
          }));

        library = {
          visible: true,
          gameCount: owned.response?.game_count ?? games.length,
          topGames,
        };
      }
    }

    return {
      steamId,
      personaName: player.personaname,
      profileUrl: player.profileurl,
      avatarUrl: player.avatarfull || player.avatarmedium || player.avatar || null,
      countryCode: player.loccountrycode ?? null,
      visibility:
        player.communityvisibilitystate === 3 ? "public" : "private_or_limited",
      library,
    } satisfies SteamPlayerLookupResult;
  });

export const getSteamApiReadiness = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(process.env["STEAM_WEB_API_KEY"]?.trim()),
  openIdReady: Boolean(process.env["PUBLIC_APP_URL"]?.trim()),
}));
