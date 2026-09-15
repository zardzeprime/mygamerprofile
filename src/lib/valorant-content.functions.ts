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
      .filter((weapon) => weapon.weaponStats || weapon.shopData)
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
