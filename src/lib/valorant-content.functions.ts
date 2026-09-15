import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localeSchema = z.object({ locale: z.enum(["pt-BR", "en", "es"]) });

type ProviderLocale = "pt-BR" | "en-US" | "es-MX";

function providerLocale(locale: "pt-BR" | "en" | "es"): ProviderLocale {
  if (locale === "pt-BR") return "pt-BR";
  if (locale === "es") return "es-MX";
  return "en-US";
}

async function fetchValorantApi<T>(path: string, locale: "pt-BR" | "en" | "es"): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://valorant-api.com/v1/${path}?language=${providerLocale(locale)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`valorant_content_provider_${response.status}`);
    const payload = (await response.json()) as { status: number; data: T };
    return payload.data;
  } finally {
    clearTimeout(timeout);
  }
}

export type ValorantAgent = {
  uuid: string;
  name: string;
  description: string;
  portrait: string | null;
  bustPortrait: string | null;
  background: string | null;
  role: { name: string; description: string; icon: string | null } | null;
  abilities: Array<{ slot: string; name: string; description: string; icon: string | null }>;
};

export type ValorantMap = {
  uuid: string;
  name: string;
  narrativeDescription: string | null;
  tacticalDescription: string | null;
  coordinates: string | null;
  splash: string | null;
  minimap: string | null;
};

export type ValorantWeapon = {
  uuid: string;
  name: string;
  icon: string | null;
  category: string;
  cost: number | null;
  fireRate: number | null;
  magazineSize: number | null;
  reloadTime: number | null;
  equipTime: number | null;
  wallPenetration: string | null;
  damageRanges: Array<{ start: number; end: number; head: number; body: number; legs: number }>;
};

export type ValorantSkinChroma = {
  uuid: string;
  name: string;
  fullRender: string | null;
  swatch: string | null;
  streamedVideo: string | null;
};

export type ValorantSkinLevel = {
  uuid: string;
  name: string;
  item: string | null;
  icon: string | null;
  streamedVideo: string | null;
};

export type ValorantSkin = {
  uuid: string;
  name: string;
  icon: string | null;
  wallpaper: string | null;
  rarity: string | null;
  rarityIcon: string | null;
  rarityColor: string | null;
  referenceVp: number | null;
  levels: ValorantSkinLevel[];
  chromas: ValorantSkinChroma[];
};

export type ValorantSkinWeapon = {
  uuid: string;
  name: string;
  icon: string | null;
  category: string;
  isMelee: boolean;
  skins: ValorantSkin[];
};

type AgentApi = {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string | null;
  fullPortrait: string | null;
  fullPortraitV2: string | null;
  background: string | null;
  isPlayableCharacter: boolean;
  role: { displayName: string; description: string; displayIcon: string | null } | null;
  abilities: Array<{ slot: string; displayName: string; description: string; displayIcon: string | null }>;
};

type MapApi = {
  uuid: string;
  displayName: string;
  narrativeDescription: string | null;
  tacticalDescription: string | null;
  coordinates: string | null;
  splash: string | null;
  displayIcon: string | null;
};

type WeaponSkinApi = {
  uuid: string;
  displayName: string;
  themeUuid: string | null;
  contentTierUuid: string | null;
  displayIcon: string | null;
  wallpaper: string | null;
  chromas: Array<{
    uuid: string;
    displayName: string;
    displayIcon: string | null;
    fullRender: string | null;
    swatch: string | null;
    streamedVideo: string | null;
  }>;
  levels: Array<{
    uuid: string;
    displayName: string;
    levelItem: string | null;
    displayIcon: string | null;
    streamedVideo: string | null;
  }>;
};

type WeaponApi = {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  category: string;
  shopData: { cost: number; category: string } | null;
  weaponStats: {
    fireRate: number;
    magazineSize: number;
    reloadTimeSeconds: number;
    equipTimeSeconds: number;
    wallPenetration: string;
    damageRanges: Array<{
      rangeStartMeters: number;
      rangeEndMeters: number;
      headDamage: number;
      bodyDamage: number;
      legDamage: number;
    }>;
  } | null;
  skins: WeaponSkinApi[];
};

type ContentTierApi = {
  uuid: string;
  displayName: string;
  devName: string;
  highlightColor: string;
  displayIcon: string | null;
};

export const getValorantAgents = createServerFn({ method: "GET" })
  .inputValidator((data) => localeSchema.parse(data))
  .handler(async ({ data }) => {
    const rows = await fetchValorantApi<AgentApi[]>("agents", data.locale);
    return rows
      .filter((agent) => agent.isPlayableCharacter)
      .map<ValorantAgent>((agent) => ({
        uuid: agent.uuid,
        name: agent.displayName,
        description: agent.description,
        portrait: agent.fullPortraitV2 ?? agent.fullPortrait ?? agent.displayIcon,
        bustPortrait: agent.displayIcon,
        background: agent.background,
        role: agent.role
          ? { name: agent.role.displayName, description: agent.role.description, icon: agent.role.displayIcon }
          : null,
        abilities: agent.abilities.map((ability) => ({
          slot: ability.slot,
          name: ability.displayName,
          description: ability.description,
          icon: ability.displayIcon,
        })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

export const getValorantMaps = createServerFn({ method: "GET" })
  .inputValidator((data) => localeSchema.parse(data))
  .handler(async ({ data }) => {
    const rows = await fetchValorantApi<MapApi[]>("maps", data.locale);
    return rows
      .filter((map) => map.splash && map.displayName && !map.displayName.toLowerCase().includes("range"))
      .map<ValorantMap>((map) => ({
        uuid: map.uuid,
        name: map.displayName,
        narrativeDescription: map.narrativeDescription,
        tacticalDescription: map.tacticalDescription,
        coordinates: map.coordinates,
        splash: map.splash,
        minimap: map.displayIcon,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

export const getValorantWeapons = createServerFn({ method: "GET" })
  .inputValidator((data) => localeSchema.parse(data))
  .handler(async ({ data }) => {
    const rows = await fetchValorantApi<WeaponApi[]>("weapons", data.locale);
    return rows
      .map<ValorantWeapon>((weapon) => ({
        uuid: weapon.uuid,
        name: weapon.displayName,
        icon: weapon.displayIcon,
        category: weapon.shopData?.category ?? weapon.category.replace("EEquippableCategory::", ""),
        cost: weapon.shopData?.cost ?? null,
        fireRate: weapon.weaponStats?.fireRate ?? null,
        magazineSize: weapon.weaponStats?.magazineSize ?? null,
        reloadTime: weapon.weaponStats?.reloadTimeSeconds ?? null,
        equipTime: weapon.weaponStats?.equipTimeSeconds ?? null,
        wallPenetration: weapon.weaponStats?.wallPenetration?.replace("EWallPenetrationDisplayType::", "") ?? null,
        damageRanges:
          weapon.weaponStats?.damageRanges.map((range) => ({
            start: range.rangeStartMeters,
            end: range.rangeEndMeters,
            head: range.headDamage,
            body: range.bodyDamage,
            legs: range.legDamage,
          })) ?? [],
      }))
      .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0) || a.name.localeCompare(b.name));
  });

export const getValorantSkins = createServerFn({ method: "GET" })
  .inputValidator((data) => localeSchema.parse(data))
  .handler(async ({ data }) => {
    const [weapons, tiers] = await Promise.all([
      fetchValorantApi<WeaponApi[]>("weapons", data.locale),
      fetchValorantApi<ContentTierApi[]>("contenttiers", data.locale),
    ]);
    const tierById = new Map(tiers.map((tier) => [tier.uuid, tier]));

    return weapons
      .map<ValorantSkinWeapon>((weapon) => {
        const category = weapon.shopData?.category ?? weapon.category.replace("EEquippableCategory::", "");
        const isMelee = category.toLowerCase().includes("melee") || weapon.displayName.toLowerCase().includes("melee");
        const skins = weapon.skins
          .filter((skin) => skin.displayName && skin.contentTierUuid)
          .map<ValorantSkin>((skin) => {
            const tier = skin.contentTierUuid ? tierById.get(skin.contentTierUuid) : undefined;
            return {
              uuid: skin.uuid,
              name: skin.displayName,
              icon: skin.displayIcon ?? skin.chromas[0]?.fullRender ?? skin.levels[0]?.displayIcon ?? null,
              wallpaper: skin.wallpaper,
              rarity: tier?.displayName ?? null,
              rarityIcon: tier?.displayIcon ?? null,
              rarityColor: tier?.highlightColor ?? null,
              referenceVp: tier ? referenceVpForTier(tier.devName, isMelee) : null,
              levels: skin.levels.map((level) => ({
                uuid: level.uuid,
                name: level.displayName,
                item: level.levelItem?.replace("EEquippableSkinLevelItem::", "") ?? null,
                icon: level.displayIcon,
                streamedVideo: level.streamedVideo,
              })),
              chromas: skin.chromas.map((chroma) => ({
                uuid: chroma.uuid,
                name: chroma.displayName,
                fullRender: chroma.fullRender,
                swatch: chroma.swatch,
                streamedVideo: chroma.streamedVideo,
              })),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          uuid: weapon.uuid,
          name: weapon.displayName,
          icon: weapon.displayIcon,
          category,
          isMelee,
          skins,
        };
      })
      .filter((weapon) => weapon.skins.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

function referenceVpForTier(tierName: string, isMelee: boolean): number | null {
  const normalized = tierName.toLowerCase();
  let base: number | null = null;
  if (normalized.includes("select")) base = 875;
  else if (normalized.includes("deluxe")) base = 1275;
  else if (normalized.includes("premium")) base = 1775;
  else if (normalized.includes("exclusive")) base = 2175;
  else if (normalized.includes("ultra")) base = 2475;
  if (base == null) return null;
  return isMelee ? base * 2 : base;
}
