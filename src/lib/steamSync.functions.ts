import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getSupabasePublicConfig } from "@/lib/supabase.server";

const CANONICAL_SUPABASE_URL = "https://gudvdgpjfapshzqyfcpj.supabase.co";
const CANONICAL_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

const SUPPORTED_INVENTORIES = [
  { appId: 730, contextId: "2", label: "Counter-Strike 2" },
  { appId: 570, contextId: "2", label: "Dota 2" },
  { appId: 440, contextId: "2", label: "Team Fortress 2" },
] as const;

const authTokenSchema = z.object({
  accessToken: z.string().min(20).max(4096),
});

const achievementBatchSchema = authTokenSchema.extend({
  afterAppId: z.number().int().nonnegative().default(0),
  batchSize: z.number().int().min(1).max(10).default(6),
});

const sharingSchema = authTokenSchema.extend({
  show_library: z.boolean().optional(),
  show_playtime: z.boolean().optional(),
  show_achievements: z.boolean().optional(),
  show_badges: z.boolean().optional(),
  show_inventory: z.boolean().optional(),
});

const publicShowcaseSchema = z.object({
  userId: z.string().uuid(),
});

type SteamSummary = {
  steamid?: string;
  personaname?: string;
  profileurl?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  communityvisibilitystate?: number;
  loccountrycode?: string;
};

type OwnedGame = {
  appid: number;
  name?: string;
  img_icon_url?: string;
  playtime_forever?: number;
  playtime_2weeks?: number;
  rtime_last_played?: number;
  has_community_visible_stats?: boolean;
};

type RecentGame = OwnedGame;

type Badge = {
  badgeid?: number;
  appid?: number;
  level?: number;
  completion_time?: number;
  xp?: number;
  scarcity?: number;
  communityitemid?: string;
  border_color?: number;
};

type PlayerAchievement = {
  apiname?: string;
  name?: string;
  description?: string;
  achieved?: number;
  unlocktime?: number;
};

type SchemaAchievement = {
  name?: string;
  displayName?: string;
  description?: string;
  icon?: string;
  icongray?: string;
};

type UserStat = {
  name?: string;
  value?: number;
};

export type PublicSteamShowcase = {
  connected: boolean;
  personaName: string | null;
  profileUrl: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  steamLevel: number | null;
  libraryVisible: boolean;
  inventoryVisible: boolean;
  lastSyncedAt: string | null;
  games: Array<{
    appId: number;
    name: string;
    iconUrl: string | null;
    playtimeMinutes: number | null;
    achievementsUnlocked: number | null;
    achievementsTotal: number | null;
    achievementPercent: number | null;
  }>;
  recentGames: Array<{
    appId: number;
    name: string;
    iconUrl: string | null;
    recentMinutes: number;
    playtimeMinutes: number;
    lastPlayedAt: string | null;
  }>;
  achievementSummary: {
    unlocked: number;
    total: number;
    gamesTracked: number;
  } | null;
  badgeCount: number | null;
  xp: number | null;
  inventoryItemCount: number | null;
};

function getSteamKey() {
  const key = process.env["STEAM_WEB_API_KEY"]?.trim();
  if (!key) throw new Error("STEAM_API_NOT_CONFIGURED");
  return key;
}

function createUserDb(accessToken: string) {
  return createClient(
    CANONICAL_SUPABASE_URL,
    CANONICAL_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

async function authenticateSyncRequest(accessToken: string) {
  const db = createUserDb(accessToken);
  const { data, error } = await db.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("STEAM_SYNC_AUTH_INVALID");
  return { db, userId: data.user.id };
}

async function steamApi<T>(
  path: string,
  params: Record<string, string | number | boolean>,
) {
  const url = new URL(`https://api.steampowered.com/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("STEAM_API_PRIVATE_OR_FORBIDDEN");
  }
  if (response.status === 429) throw new Error("STEAM_API_RATE_LIMIT");
  if (!response.ok) throw new Error(`STEAM_API_${response.status}`);

  return (await response.json()) as T;
}

async function optionalSteamApi<T>(
  path: string,
  params: Record<string, string | number | boolean>,
) {
  try {
    return await steamApi<T>(path, params);
  } catch (error) {
    console.warn("[MGP Steam Sync] optional endpoint failed", path, error);
    return null;
  }
}

function unixTimestamp(value?: number) {
  if (!value || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

function appIcon(appId: number, iconHash?: string) {
  if (!iconHash) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function getConnectedSteamAccount(
  db: ReturnType<typeof createUserDb>,
  userId: string,
) {
  const { data, error } = await db
    .from("connected_accounts")
    .select("provider_user_id,display_name,public_metadata,status")
    .eq("user_id", userId)
    .eq("provider", "steam")
    .eq("status", "connected")
    .maybeSingle();

  if (error) throw new Error("STEAM_CONNECTION_LOOKUP_FAILED");
  if (!data?.provider_user_id) throw new Error("STEAM_NOT_CONNECTED");
  return data;
}

async function fetchInventory(
  steamId: string,
  appId: number,
  contextId: string,
) {
  const assets: Array<Record<string, unknown>> = [];
  const descriptions = new Map<string, Record<string, unknown>>();
  let cursor: string | null = null;
  let pages = 0;

  while (pages < 5) {
    const url = new URL(
      `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}`,
    );
    url.searchParams.set("l", "brazilian");
    url.searchParams.set("count", "2000");
    if (cursor) url.searchParams.set("start_assetid", cursor);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MGProfile-SteamSync/1.0",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { visible: false, items: [] as Array<Record<string, unknown>> };
    }
    if (!response.ok) {
      console.warn("[MGP Steam Sync] inventory endpoint failed", appId, response.status);
      return { visible: false, items: [] as Array<Record<string, unknown>> };
    }

    const payload = (await response.json()) as {
      success?: number;
      assets?: Array<Record<string, unknown>>;
      descriptions?: Array<Record<string, unknown>>;
      more_items?: number;
      last_assetid?: string;
    };

    if (payload.success !== 1) {
      return { visible: false, items: [] as Array<Record<string, unknown>> };
    }

    for (const description of payload.descriptions ?? []) {
      const key = `${String(description.classid ?? "")}_${String(description.instanceid ?? "0")}`;
      descriptions.set(key, description);
    }
    assets.push(...(payload.assets ?? []));

    pages += 1;
    if (!payload.more_items || !payload.last_assetid) break;
    cursor = payload.last_assetid;
  }

  const items = assets.map((asset) => {
    const classId = String(asset.classid ?? "");
    const instanceId = String(asset.instanceid ?? "0");
    const description = descriptions.get(`${classId}_${instanceId}`) ?? {};
    const icon = typeof description.icon_url === "string" ? description.icon_url : null;

    return {
      app_id: appId,
      context_id: contextId,
      asset_id: String(asset.assetid ?? ""),
      class_id: classId || null,
      instance_id: instanceId || null,
      amount: Number(asset.amount ?? 1),
      name: typeof description.name === "string" ? description.name : null,
      market_name:
        typeof description.market_name === "string" ? description.market_name : null,
      market_hash_name:
        typeof description.market_hash_name === "string"
          ? description.market_hash_name
          : null,
      type: typeof description.type === "string" ? description.type : null,
      icon_url: icon
        ? `https://community.fastly.steamstatic.com/economy/image/${icon}`
        : null,
      tradable: Number(description.tradable ?? 0) === 1,
      marketable: Number(description.marketable ?? 0) === 1,
      tags: Array.isArray(description.tags) ? description.tags : [],
    };
  }).filter((item) => item.asset_id);

  return { visible: true, items };
}

export const syncSteamCore = createServerFn({ method: "POST" })
  .validator((data) => authTokenSchema.parse(data))
  .handler(async ({ data }) => {
    const key = getSteamKey();
    const { db, userId } = await authenticateSyncRequest(data.accessToken);
    const account = await getConnectedSteamAccount(db, userId);
    const steamId = account.provider_user_id;
    const now = new Date().toISOString();
    const warnings: string[] = [];

    await db.from("steam_profiles").upsert(
      {
        user_id: userId,
        steam_id: steamId,
        last_sync_status: "syncing",
        last_error: null,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );

    const [summaryPayload, ownedPayload, recentPayload, levelPayload, badgesPayload] =
      await Promise.all([
        optionalSteamApi<{ response?: { players?: SteamSummary[] } }>(
          "ISteamUser/GetPlayerSummaries/v2/",
          { key, steamids: steamId },
        ),
        optionalSteamApi<{ response?: { game_count?: number; games?: OwnedGame[] } }>(
          "IPlayerService/GetOwnedGames/v1/",
          {
            key,
            steamid: steamId,
            include_appinfo: true,
            include_played_free_games: true,
            format: "json",
          },
        ),
        optionalSteamApi<{ response?: { total_count?: number; games?: RecentGame[] } }>(
          "IPlayerService/GetRecentlyPlayedGames/v1/",
          { key, steamid: steamId, count: 20, format: "json" },
        ),
        optionalSteamApi<{ response?: { player_level?: number } }>(
          "IPlayerService/GetSteamLevel/v1/",
          { key, steamid: steamId },
        ),
        optionalSteamApi<{
          response?: {
            badges?: Badge[];
            player_xp?: number;
            player_level?: number;
          };
        }>("IPlayerService/GetBadges/v1/", { key, steamid: steamId }),
      ]);

    const player = summaryPayload?.response?.players?.[0] ?? null;
    const ownedGames = ownedPayload?.response?.games ?? [];
    const libraryVisible =
      typeof ownedPayload?.response?.game_count === "number" ||
      Array.isArray(ownedPayload?.response?.games);
    const recentGames = recentPayload?.response?.games ?? [];
    const level =
      levelPayload?.response?.player_level ??
      badgesPayload?.response?.player_level ??
      null;
    const badges = badgesPayload?.response?.badges ?? [];

    if (!player) warnings.push("profile_summary_unavailable");
    if (!libraryVisible) warnings.push("library_private_or_unavailable");
    if (!badgesPayload) warnings.push("badges_unavailable");

    const recentByApp = new Map(
      recentGames.map((game, index) => [
        game.appid,
        {
          rank: index + 1,
          recentMinutes: game.playtime_2weeks ?? 0,
          lastPlayed: game.rtime_last_played,
        },
      ]),
    );

    if (libraryVisible) {
      await db
        .from("steam_games")
        .update({ owned: false, recent_rank: null, playtime_2weeks: 0 })
        .eq("user_id", userId);

      const rows = ownedGames.map((game) => {
        const recent = recentByApp.get(game.appid);
        return {
          user_id: userId,
          app_id: game.appid,
          name: game.name ?? `App ${game.appid}`,
          icon_url: appIcon(game.appid, game.img_icon_url),
          playtime_forever: game.playtime_forever ?? 0,
          playtime_2weeks: recent?.recentMinutes ?? game.playtime_2weeks ?? 0,
          last_played_at: unixTimestamp(
            recent?.lastPlayed ?? game.rtime_last_played,
          ),
          recent_rank: recent?.rank ?? null,
          has_community_visible_stats:
            game.has_community_visible_stats === true,
          last_synced_at: now,
          owned: true,
        };
      });

      for (const rowsChunk of chunk(rows, 100)) {
        if (rowsChunk.length === 0) continue;
        const { error } = await db
          .from("steam_games")
          .upsert(rowsChunk, { onConflict: "user_id,app_id" });
        if (error) throw new Error("STEAM_GAMES_SAVE_FAILED");
      }
    }

    if (badgesPayload) {
      const { error: deleteBadgesError } = await db
        .from("steam_badges")
        .delete()
        .eq("user_id", userId);
      if (deleteBadgesError) warnings.push("badges_cleanup_failed");

      const badgeRows = badges
        .filter((badge) => typeof badge.badgeid === "number")
        .map((badge) => ({
          user_id: userId,
          badge_id: badge.badgeid,
          app_id: badge.appid ?? null,
          level: badge.level ?? 0,
          xp: badge.xp ?? 0,
          completion_time: unixTimestamp(badge.completion_time),
          scarcity: badge.scarcity ?? null,
          community_item_id: badge.communityitemid ?? null,
          border_color: badge.border_color ?? null,
          last_synced_at: now,
        }));

      for (const rowsChunk of chunk(badgeRows, 100)) {
        if (rowsChunk.length === 0) continue;
        const { error } = await db.from("steam_badges").insert(rowsChunk);
        if (error) warnings.push("badges_save_failed");
      }
    }

    let inventoryVisible = false;
    let inventoryItemCount = 0;
    const ownedAppIds = new Set(ownedGames.map((game) => game.appid));

    for (const inventory of SUPPORTED_INVENTORIES) {
      if (libraryVisible && !ownedAppIds.has(inventory.appId)) continue;
      const result = await fetchInventory(
        steamId,
        inventory.appId,
        inventory.contextId,
      );
      if (!result.visible) continue;

      inventoryVisible = true;
      const { error: deleteInventoryError } = await db
        .from("steam_inventory_items")
        .delete()
        .eq("user_id", userId)
        .eq("app_id", inventory.appId)
        .eq("context_id", inventory.contextId);
      if (deleteInventoryError) {
        warnings.push(`inventory_cleanup_${inventory.appId}`);
        continue;
      }

      const itemRows = result.items.map((item) => ({
        ...item,
        user_id: userId,
        last_synced_at: now,
      }));
      inventoryItemCount += itemRows.length;

      for (const rowsChunk of chunk(itemRows, 100)) {
        if (rowsChunk.length === 0) continue;
        const { error } = await db
          .from("steam_inventory_items")
          .upsert(rowsChunk, {
            onConflict: "user_id,app_id,context_id,asset_id",
          });
        if (error) warnings.push(`inventory_save_${inventory.appId}`);
      }
    }

    const profileUrl =
      player?.profileurl ??
      (account.public_metadata as Record<string, unknown> | null)?.profile_url ??
      `https://steamcommunity.com/profiles/${steamId}/`;
    const avatarUrl =
      player?.avatarfull ?? player?.avatarmedium ?? player?.avatar ?? null;
    const personaName =
      player?.personaname ?? account.display_name ?? `Steam ${steamId.slice(-6)}`;

    const syncStatus =
      warnings.length === 0 ? "ok" : warnings.length < 4 ? "partial" : "error";

    const { error: profileError } = await db.from("steam_profiles").upsert(
      {
        user_id: userId,
        steam_id: steamId,
        persona_name: personaName,
        profile_url: profileUrl,
        avatar_url: avatarUrl,
        country_code: player?.loccountrycode ?? null,
        community_visibility_state: player?.communityvisibilitystate ?? null,
        steam_level: level,
        badge_count: badges.length,
        xp: badgesPayload?.response?.player_xp ?? 0,
        library_visible: libraryVisible,
        inventory_visible: inventoryVisible,
        last_sync_status: syncStatus,
        last_error: warnings.length ? warnings.join(",") : null,
        last_synced_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );
    if (profileError) throw new Error("STEAM_PROFILE_SAVE_FAILED");

    await db
      .from("connected_accounts")
      .update({
        display_name: personaName,
        public_metadata: {
          profile_url: profileUrl,
          avatar_url: avatarUrl,
          country_code: player?.loccountrycode ?? null,
          visibility:
            player?.communityvisibilitystate === 3
              ? "public"
              : "private_or_limited",
        },
        last_synced_at: now,
      })
      .eq("user_id", userId)
      .eq("provider", "steam");

    const { count: achievementEligible } = await db
      .from("steam_games")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("owned", true)
      .eq("has_community_visible_stats", true);

    return {
      ok: true,
      steamId,
      personaName,
      libraryVisible,
      libraryGameCount: ownedGames.length,
      recentGameCount: recentGames.length,
      steamLevel: level,
      badgeCount: badges.length,
      inventoryVisible,
      inventoryItemCount,
      achievementEligible: achievementEligible ?? 0,
      warnings,
      syncedAt: now,
    };
  });

async function syncAchievementsForGame(
  key: string,
  steamId: string,
  appId: number,
) {
  const achievementsPayload = await optionalSteamApi<{
    playerstats?: {
      success?: boolean;
      achievements?: PlayerAchievement[];
    };
  }>("ISteamUserStats/GetPlayerAchievements/v1/", {
    key,
    steamid: steamId,
    appid: appId,
    l: "brazilian",
  });

  const achievements = achievementsPayload?.playerstats?.achievements ?? [];

  const schemaPayload =
    achievements.length > 0
      ? await optionalSteamApi<{
          game?: {
            availableGameStats?: {
              achievements?: SchemaAchievement[];
            };
          };
        }>("ISteamUserStats/GetSchemaForGame/v2/", {
          key,
          appid: appId,
          l: "brazilian",
        })
      : null;

  const statsPayload = await optionalSteamApi<{
    playerstats?: {
      stats?: UserStat[];
    };
  }>("ISteamUserStats/GetUserStatsForGame/v2/", {
    key,
    steamid: steamId,
    appid: appId,
  });

  const schemaMap = new Map(
    (schemaPayload?.game?.availableGameStats?.achievements ?? [])
      .filter((achievement) => achievement.name)
      .map((achievement) => [achievement.name as string, achievement]),
  );

  const achievementRows = achievements
    .filter((achievement) => achievement.apiname)
    .map((achievement) => {
      const schema = schemaMap.get(achievement.apiname as string);
      return {
        apiName: achievement.apiname as string,
        displayName:
          achievement.name ?? schema?.displayName ?? achievement.apiname ?? null,
        description: achievement.description ?? schema?.description ?? null,
        achieved: achievement.achieved === 1,
        unlockTime: unixTimestamp(achievement.unlocktime),
        iconUrl: schema?.icon ?? null,
        iconGrayUrl: schema?.icongray ?? null,
      };
    });

  const stats = Object.fromEntries(
    (statsPayload?.playerstats?.stats ?? [])
      .filter((stat) => stat.name && typeof stat.value === "number")
      .map((stat) => [stat.name as string, stat.value as number]),
  );

  return { achievementRows, stats };
}

export const syncSteamAchievementsBatch = createServerFn({ method: "POST" })
  .validator((data) => achievementBatchSchema.parse(data))
  .handler(async ({ data }) => {
    const key = getSteamKey();
    const { db, userId } = await authenticateSyncRequest(data.accessToken);
    const account = await getConnectedSteamAccount(db, userId);
    const steamId = account.provider_user_id;

    const { data: games, error } = await db
      .from("steam_games")
      .select("app_id,name")
      .eq("user_id", userId)
      .eq("owned", true)
      .eq("has_community_visible_stats", true)
      .gt("app_id", data.afterAppId)
      .order("app_id", { ascending: true })
      .limit(data.batchSize);

    if (error) throw new Error("STEAM_ACHIEVEMENT_QUEUE_FAILED");
    if (!games?.length) {
      return {
        ok: true,
        processed: 0,
        nextCursor: null,
        hasMore: false,
        unlocked: 0,
        total: 0,
      };
    }

    let unlocked = 0;
    let total = 0;
    const failures: number[] = [];

    for (const game of games) {
      const appId = Number(game.app_id);
      try {
        const result = await syncAchievementsForGame(key, steamId, appId);
        const now = new Date().toISOString();

        const { error: deleteError } = await db
          .from("steam_achievements")
          .delete()
          .eq("user_id", userId)
          .eq("app_id", appId);
        if (deleteError) throw deleteError;

        if (result.achievementRows.length > 0) {
          const rows = result.achievementRows.map((achievement) => ({
            user_id: userId,
            app_id: appId,
            api_name: achievement.apiName,
            display_name: achievement.displayName,
            description: achievement.description,
            achieved: achievement.achieved,
            unlock_time: achievement.unlockTime,
            icon_url: achievement.iconUrl,
            icon_gray_url: achievement.iconGrayUrl,
            last_synced_at: now,
          }));
          const { error: insertError } = await db
            .from("steam_achievements")
            .insert(rows);
          if (insertError) throw insertError;
        }

        const gameUnlocked = result.achievementRows.filter(
          (achievement) => achievement.achieved,
        ).length;
        const gameTotal = result.achievementRows.length;
        unlocked += gameUnlocked;
        total += gameTotal;

        const { error: updateError } = await db
          .from("steam_games")
          .update({
            achievements_unlocked: gameUnlocked,
            achievements_total: gameTotal,
            achievement_percent:
              gameTotal > 0
                ? Number(((gameUnlocked / gameTotal) * 100).toFixed(2))
                : 0,
            stats: result.stats,
            achievements_synced_at: now,
          })
          .eq("user_id", userId)
          .eq("app_id", appId);
        if (updateError) throw updateError;
      } catch (achievementError) {
        console.warn(
          "[MGP Steam Sync] achievement sync failed",
          appId,
          achievementError,
        );
        failures.push(appId);
      }
    }

    const nextCursor = Number(games.at(-1)?.app_id ?? 0);

    return {
      ok: true,
      processed: games.length,
      nextCursor,
      hasMore: games.length === data.batchSize,
      unlocked,
      total,
      failures,
    };
  });

export const getSteamSyncStatus = createServerFn({ method: "POST" })
  .validator((data) => authTokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { db, userId } = await authenticateSyncRequest(data.accessToken);

    const [
      profileResult,
      gamesResult,
      achievementsResult,
      badgesResult,
      inventoryResult,
    ] = await Promise.all([
      db
        .from("steam_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      db
        .from("steam_games")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("owned", true),
      db
        .from("steam_achievements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      db
        .from("steam_badges")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      db
        .from("steam_inventory_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    if (profileResult.error) throw new Error("STEAM_SYNC_STATUS_FAILED");

    return {
      profile: profileResult.data,
      counts: {
        games: gamesResult.count ?? 0,
        achievements: achievementsResult.count ?? 0,
        badges: badgesResult.count ?? 0,
        inventoryItems: inventoryResult.count ?? 0,
      },
    };
  });

export const updateSteamSharing = createServerFn({ method: "POST" })
  .validator((data) => sharingSchema.parse(data))
  .handler(async ({ data }) => {
    const { db, userId } = await authenticateSyncRequest(data.accessToken);
    const {
      accessToken: _accessToken,
      ...sharing
    } = data;
    const payload = {
      ...sharing,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await db
      .from("steam_profiles")
      .update(payload)
      .eq("user_id", userId)
      .select("show_library,show_playtime,show_achievements,show_badges,show_inventory")
      .maybeSingle();

    if (error) throw new Error("STEAM_SHARING_UPDATE_FAILED");
    return updated;
  });

export const getPublicSteamShowcase = createServerFn({ method: "GET" })
  .validator((data) => publicShowcaseSchema.parse(data))
  .handler(async ({ data }) => {
    const { url, publishableKey } = getSupabasePublicConfig();
    const endpoint = new URL(
      "/rest/v1/rpc/get_public_steam_showcase",
      url,
    );

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ target_user_id: data.userId }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      console.warn("[MGP Steam] public showcase lookup failed", response.status);
      return null;
    }

    return (await response.json()) as PublicSteamShowcase | null;
  });
