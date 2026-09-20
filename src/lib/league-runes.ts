import type { Locale } from "@/i18n";

export const LEAGUE_DDRAGON = "https://ddragon.leagueoflegends.com";

export type LeagueRunePerk = {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
};

export type LeagueRuneSlot = {
  runes: LeagueRunePerk[];
};

export type LeagueRuneStyle = {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: LeagueRuneSlot[];
};

export type LeagueRunePageSelection = {
  primaryStyleId: number | null;
  primaryPerkIds: number[];
  secondaryStyleId: number | null;
  secondaryPerkIds: number[];
  statShards: [string, string, string];
};

export type LeagueStatShardOption = {
  key: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const LEAGUE_STAT_SHARDS: readonly (readonly LeagueStatShardOption[])[] = [
  [
    {
      key: "adaptive-force",
      name: { "pt-BR": "Força Adaptativa", en: "Adaptive Force", es: "Fuerza adaptable" },
      description: { "pt-BR": "+9 de Força Adaptativa", en: "+9 Adaptive Force", es: "+9 de Fuerza adaptable" },
    },
    {
      key: "attack-speed",
      name: { "pt-BR": "Velocidade de Ataque", en: "Attack Speed", es: "Velocidad de ataque" },
      description: { "pt-BR": "+10% de Velocidade de Ataque", en: "+10% Attack Speed", es: "+10% de Velocidad de ataque" },
    },
    {
      key: "ability-haste",
      name: { "pt-BR": "Aceleração de Habilidade", en: "Ability Haste", es: "Aceleración de habilidad" },
      description: { "pt-BR": "+8 de Aceleração de Habilidade", en: "+8 Ability Haste", es: "+8 de Aceleración de habilidad" },
    },
  ],
  [
    {
      key: "adaptive-force",
      name: { "pt-BR": "Força Adaptativa", en: "Adaptive Force", es: "Fuerza adaptable" },
      description: { "pt-BR": "+9 de Força Adaptativa", en: "+9 Adaptive Force", es: "+9 de Fuerza adaptable" },
    },
    {
      key: "move-speed",
      name: { "pt-BR": "Velocidade de Movimento", en: "Move Speed", es: "Velocidad de movimiento" },
      description: { "pt-BR": "+2,5% de Velocidade de Movimento", en: "+2.5% Move Speed", es: "+2,5% de Velocidad de movimiento" },
    },
    {
      key: "scaling-health",
      name: { "pt-BR": "Vida Escalável", en: "Scaling Health", es: "Vida progresiva" },
      description: { "pt-BR": "Vida adicional que aumenta com o nível", en: "Bonus health that scales with level", es: "Vida adicional que aumenta con el nivel" },
    },
  ],
  [
    {
      key: "flat-health",
      name: { "pt-BR": "Vida", en: "Health", es: "Vida" },
      description: { "pt-BR": "+65 de Vida", en: "+65 Health", es: "+65 de Vida" },
    },
    {
      key: "tenacity",
      name: { "pt-BR": "Tenacidade", en: "Tenacity", es: "Tenacidad" },
      description: { "pt-BR": "+15% de Tenacidade e Resistência a Lentidão", en: "+15% Tenacity and Slow Resist", es: "+15% de Tenacidad y Resistencia a ralentización" },
    },
    {
      key: "scaling-health",
      name: { "pt-BR": "Vida Escalável", en: "Scaling Health", es: "Vida progresiva" },
      description: { "pt-BR": "Vida adicional que aumenta com o nível", en: "Bonus health that scales with level", es: "Vida adicional que aumenta con el nivel" },
    },
  ],
] as const;

export const DEFAULT_LEAGUE_STAT_SHARDS: [string, string, string] = [
  "adaptive-force",
  "adaptive-force",
  "flat-health",
];

export function leagueRuneIcon(icon: string) {
  return `${LEAGUE_DDRAGON}/cdn/img/${icon}`;
}

export function createDefaultRunePage(styles: LeagueRuneStyle[]): LeagueRunePageSelection {
  const primary = styles[0] ?? null;
  const secondary = styles.find((style) => style.id !== primary?.id) ?? null;

  return {
    primaryStyleId: primary?.id ?? null,
    primaryPerkIds: primary?.slots.map((slot) => slot.runes[0]?.id).filter((id): id is number => typeof id === "number") ?? [],
    secondaryStyleId: secondary?.id ?? null,
    secondaryPerkIds:
      secondary?.slots
        .slice(1)
        .slice(0, 2)
        .map((slot) => slot.runes[0]?.id)
        .filter((id): id is number => typeof id === "number") ?? [],
    statShards: [...DEFAULT_LEAGUE_STAT_SHARDS],
  };
}

export function findLeagueRune(styles: LeagueRuneStyle[], runeId: number) {
  for (const style of styles) {
    for (const slot of style.slots) {
      const rune = slot.runes.find((entry) => entry.id === runeId);
      if (rune) return { rune, style };
    }
  }
  return null;
}

export function stripLeagueMarkup(value?: string) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadLeagueRuneStyles(version: string, locale: Locale) {
  const language: Record<Locale, string> = {
    "pt-BR": "pt_BR",
    en: "en_US",
    es: "es_ES",
  };

  const response = await fetch(
    `${LEAGUE_DDRAGON}/cdn/${version}/data/${language[locale]}/runesReforged.json`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error(`LEAGUE_RUNES_${response.status}`);
  return (await response.json()) as LeagueRuneStyle[];
}
