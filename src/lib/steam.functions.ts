import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const DEFAULT_PUBLIC_APP_URL = "https://mgprofile.online";
const STEAM_LINK_TTL_MS = 10 * 60 * 1000;

const steamLookupSchema = z.object({
  value: z.string().trim().min(2).max(160),
  includeLibrary: z.boolean().default(false),
});

const steamCallbackSchema = z.object({
  state: z.string().trim().min(32).max(256),
  params: z.record(z.string(), z.string()),
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

function getPublicAppUrl() {
  return (process.env["PUBLIC_APP_URL"]?.trim() || DEFAULT_PUBLIC_APP_URL).replace(/\/$/, "");
}

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
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

async function getSteamSummary(steamId: string) {
  const key = getSteamKey();
  const summaries = await steamFetch<SteamSummariesResponse>(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
    { key, steamids: steamId },
  );
  return summaries.response?.players?.[0] ?? null;
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

export const beginSteamConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const state = randomState();
    const stateHash = await sha256(state);
    const expiresAt = new Date(Date.now() + STEAM_LINK_TTL_MS).toISOString();
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    await admin.from("steam_link_states").delete().lt("expires_at", new Date().toISOString());

    const { error } = await admin.from("steam_link_states").insert({
      state_hash: stateHash,
      user_id: context.userId,
      expires_at: expiresAt,
    });
    if (error) throw new Error("STEAM_LINK_STATE_FAILED");

    const appUrl = getPublicAppUrl();
    const returnTo = `${appUrl}/connect/steam/callback?state=${encodeURIComponent(state)}`;
    const url = new URL(STEAM_OPENID_ENDPOINT);
    url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    url.searchParams.set("openid.mode", "checkid_setup");
    url.searchParams.set("openid.return_to", returnTo);
    url.searchParams.set("openid.realm", `${appUrl}/`);
    url.searchParams.set(
      "openid.identity",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );
    url.searchParams.set(
      "openid.claimed_id",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );

    return { url: url.toString() };
  });

export const completeSteamConnection = createServerFn({ method: "POST" })
  .inputValidator((data) => steamCallbackSchema.parse(data))
  .handler(async ({ data }) => {
    const stateHash = await sha256(data.state);
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    const { data: linkState, error: stateError } = await admin
      .from("steam_link_states")
      .select("user_id,expires_at")
      .eq("state_hash", stateHash)
      .maybeSingle();

    if (stateError || !linkState) throw new Error("STEAM_LINK_STATE_INVALID");
    if (new Date(linkState.expires_at).getTime() <= Date.now()) {
      await admin.from("steam_link_states").delete().eq("state_hash", stateHash);
      throw new Error("STEAM_LINK_STATE_EXPIRED");
    }

    const appUrl = getPublicAppUrl();
    const expectedReturnTo = `${appUrl}/connect/steam/callback?state=${encodeURIComponent(data.state)}`;
    const mode = data.params["openid.mode"];
    const opEndpoint = data.params["openid.op_endpoint"];
    const returnTo = data.params["openid.return_to"];
    const claimedId = data.params["openid.claimed_id"];
    const identity = data.params["openid.identity"];

    if (mode !== "id_res") throw new Error("STEAM_OPENID_CANCELLED");
    if (opEndpoint !== STEAM_OPENID_ENDPOINT) throw new Error("STEAM_OPENID_ENDPOINT_INVALID");
    if (returnTo !== expectedReturnTo) throw new Error("STEAM_OPENID_RETURN_INVALID");
    if (!claimedId || identity !== claimedId) throw new Error("STEAM_OPENID_IDENTITY_INVALID");

    const identityMatch = claimedId.match(
      /^https:\/\/steamcommunity\.com\/openid\/id\/(7656119\d{10})$/,
    );
    const steamId = identityMatch?.[1];
    if (!steamId) throw new Error("STEAM_OPENID_IDENTITY_INVALID");

    const verification = new URLSearchParams();
    for (const [key, value] of Object.entries(data.params)) {
      if (key.startsWith("openid.")) verification.set(key, value);
    }
    verification.set("openid.mode", "check_authentication");

    const verifyResponse = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/plain",
      },
      body: verification.toString(),
      signal: AbortSignal.timeout(12_000),
    });
    if (!verifyResponse.ok) throw new Error("STEAM_OPENID_VERIFY_FAILED");
    const verifyText = await verifyResponse.text();
    if (!/(^|\n)is_valid:true(\n|$)/.test(verifyText)) {
      throw new Error("STEAM_OPENID_VERIFY_FAILED");
    }

    const { data: existing, error: existingError } = await admin
      .from("connected_accounts")
      .select("user_id")
      .eq("provider", "steam")
      .eq("provider_user_id", steamId)
      .maybeSingle();
    if (existingError) throw new Error("STEAM_LINK_LOOKUP_FAILED");
    if (existing && existing.user_id !== linkState.user_id) {
      throw new Error("STEAM_ACCOUNT_ALREADY_LINKED");
    }

    let player: SteamSummary | null = null;
    try {
      player = await getSteamSummary(steamId);
    } catch (error) {
      console.warn("[ÍMPAR Steam] Profile summary unavailable during OpenID link", error);
    }

    const now = new Date().toISOString();
    const publicMetadata = {
      profile_url: player?.profileurl ?? `https://steamcommunity.com/profiles/${steamId}/`,
      avatar_url: player?.avatarfull || player?.avatarmedium || player?.avatar || null,
      country_code: player?.loccountrycode ?? null,
      visibility:
        player?.communityvisibilitystate === 3 ? "public" : "private_or_limited",
    };

    const { error: upsertError } = await admin.from("connected_accounts").upsert(
      {
        user_id: linkState.user_id,
        provider: "steam",
        provider_user_id: steamId,
        display_name: player?.personaname ?? `Steam ${steamId.slice(-6)}`,
        status: "connected",
        granted_scopes: [],
        public_metadata: publicMetadata,
        connected_at: now,
        last_synced_at: now,
        disconnected_at: null,
      },
      { onConflict: "user_id,provider" },
    );

    if (upsertError) throw new Error("STEAM_LINK_SAVE_FAILED");

    await admin.from("steam_link_states").delete().eq("state_hash", stateHash);

    return {
      ok: true,
      steamId,
      displayName: player?.personaname ?? null,
    };
  });

export const disconnectSteamAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("connected_accounts")
      .delete()
      .eq("user_id", context.userId)
      .eq("provider", "steam");

    if (error) throw new Error("STEAM_DISCONNECT_FAILED");
    return { ok: true };
  });

export const getSteamApiReadiness = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(process.env["STEAM_WEB_API_KEY"]?.trim()),
  openIdReady: Boolean(getPublicAppUrl()),
}));
