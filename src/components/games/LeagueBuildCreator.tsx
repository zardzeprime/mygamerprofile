import {
  ArrowRight,
  Eye,
  EyeOff,
  Footprints,
  Layers3,
  Loader2,
  PackagePlus,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Tags,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LeagueRuneSelector } from "@/components/games/LeagueRuneSelector";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import type { LeagueBuildResponse } from "@/lib/league-builds";
import {
  LEAGUE_DDRAGON,
  findLeagueRune,
  leagueRuneIcon,
  loadLeagueRuneStyles,
  type LeagueRunePageSelection,
  type LeagueRuneStyle,
} from "@/lib/league-runes";
import { cn } from "@/lib/utils";

export type LeagueBuildChampionSummary = {
  id: string;
  key: string;
  name: string;
  tags: string[];
  image: { full: string };
};

export type LeagueBuildItemSummary = {
  name: string;
  plaintext?: string;
  description?: string;
  image?: { full?: string };
  gold?: { total?: number; purchasable?: boolean };
  maps?: Record<string, boolean>;
  into?: string[];
  from?: string[];
  tags?: string[];
};

type SummonerSpell = {
  id: string;
  name: string;
  description?: string;
  modes?: string[];
  image: { full: string };
};

type SaveBuildRpcClient = {
  rpc: (
    fn: "save_user_build_v1",
    args: {
      p_game_slug: string;
      p_subject_key: string;
      p_title: string;
      p_build_data: Record<string, unknown>;
      p_source_context: Record<string, unknown>;
      p_visibility: "public" | "private";
    },
  ) => Promise<{ data: string | null; error: { message?: string } | null }>;
};

type PickerTarget = "core" | "situational" | "boots";
type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Fill";
type SkillKey = "Q" | "W" | "E";

const STANDARD_SUMMONERS = new Set([
  "SummonerFlash",
  "SummonerTeleport",
  "SummonerSmite",
  "SummonerDot",
  "SummonerExhaust",
  "SummonerHeal",
  "SummonerBarrier",
  "SummonerBoost",
  "SummonerHaste",
]);

const ROLE_OPTIONS: Role[] = ["Top", "Jungle", "Mid", "ADC", "Support", "Fill"];
const SKILLS: SkillKey[] = ["Q", "W", "E"];

function stripMarkup(value?: string) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function itemIcon(version: string, itemId: string, item?: LeagueBuildItemSummary) {
  const file = item?.image?.full || `${itemId}.png`;
  return `${LEAGUE_DDRAGON}/cdn/${version}/img/item/${file}`;
}

function spellIcon(version: string, spell: SummonerSpell) {
  return `${LEAGUE_DDRAGON}/cdn/${version}/img/spell/${spell.image.full}`;
}

function championIcon(version: string, champion: LeagueBuildChampionSummary) {
  return `${LEAGUE_DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`;
}

export function LeagueBuildCreator({
  locale,
  version,
  champion,
  items,
  buildData,
}: {
  locale: Locale;
  version: string;
  champion: LeagueBuildChampionSummary | null;
  items: Record<string, LeagueBuildItemSummary>;
  buildData: LeagueBuildResponse | null;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [role, setRole] = useState<Role>("Mid");
  const [patchLabel, setPatchLabel] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  const [bootsId, setBootsId] = useState<string | null>(null);
  const [coreItems, setCoreItems] = useState<string[]>([]);
  const [situationalItems, setSituationalItems] = useState<string[]>([]);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("core");
  const [itemSearch, setItemSearch] = useState("");

  const [summoners, setSummoners] = useState<SummonerSpell[]>([]);
  const [selectedSummoners, setSelectedSummoners] = useState<string[]>([]);
  const [skillOrder, setSkillOrder] = useState<[SkillKey, SkillKey, SkillKey]>(["Q", "W", "E"]);
  const [runePage, setRunePage] = useState<LeagueRunePageSelection | null>(null);
  const [runeStyles, setRuneStyles] = useState<LeagueRuneStyle[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login" | "error">("idle");

  useEffect(() => {
    if (!champion) return;
    setTitle("");
    setNotes("");
    setTagsText("");
    setBootsId(null);
    setCoreItems([]);
    setSituationalItems([]);
    setSelectedSummoners([]);
    setSkillOrder(["Q", "W", "E"]);
    setSaveStatus("idle");
  }, [champion?.id]);

  useEffect(() => {
    let active = true;
    const language: Record<Locale, string> = {
      "pt-BR": "pt_BR",
      en: "en_US",
      es: "es_ES",
    };

    void Promise.all([
      fetch(`${LEAGUE_DDRAGON}/cdn/${version}/data/${language[locale]}/summoner.json`).then(
        (response) => response.json() as Promise<{ data: Record<string, SummonerSpell> }>,
      ),
      loadLeagueRuneStyles(version, locale),
    ])
      .then(([spellPayload, styles]) => {
        if (!active) return;
        const nextSpells = Object.values(spellPayload.data)
          .filter((spell) => STANDARD_SUMMONERS.has(spell.id))
          .sort((a, b) => a.name.localeCompare(b.name, locale));
        setSummoners(nextSpells);
        setRuneStyles(styles);
      })
      .catch((error) => {
        console.warn("[LeagueBuildCreator] static League data failed", error);
      });

    return () => {
      active = false;
    };
  }, [locale, version]);

  const selectedItemIds = useMemo(
    () => new Set([...(bootsId ? [bootsId] : []), ...coreItems, ...situationalItems]),
    [bootsId, coreItems, situationalItems],
  );

  const selectableItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();

    return Object.entries(items)
      .filter(([, item]) => item.maps?.["11"] !== false)
      .filter(([, item]) => item.gold?.purchasable !== false)
      .filter(([, item]) => {
        const isBoots = item.tags?.includes("Boots") ?? false;
        if (pickerTarget === "boots") return isBoots;
        return !isBoots && !item.tags?.includes("Consumable") && !item.tags?.includes("Trinket");
      })
      .filter(([, item]) => pickerTarget === "boots" || !item.into?.length)
      .filter(([, item]) => {
        if (!query) return true;
        return `${item.name} ${stripMarkup(item.plaintext || item.description)}`
          .toLowerCase()
          .includes(query);
      })
      .sort(([, a], [, b]) => (b.gold?.total ?? 0) - (a.gold?.total ?? 0))
      .slice(0, 48);
  }, [itemSearch, items, pickerTarget]);

  const chooseItem = (itemId: string) => {
    if (selectedItemIds.has(itemId)) return;

    if (pickerTarget === "boots") {
      setBootsId(itemId);
      return;
    }

    if (pickerTarget === "core") {
      setCoreItems((current) => (current.length >= 3 ? current : [...current, itemId]));
      return;
    }

    setSituationalItems((current) => (current.length >= 2 ? current : [...current, itemId]));
  };

  const toggleSummoner = (spellId: string) => {
    setSelectedSummoners((current) => {
      if (current.includes(spellId)) return current.filter((id) => id !== spellId);
      if (current.length >= 2) return [current[1]!, spellId];
      return [...current, spellId];
    });
  };

  const updateSkillOrder = (index: number, skill: SkillKey) => {
    setSkillOrder((current) => {
      const next = [...current] as [SkillKey, SkillKey, SkillKey];
      const otherIndex = next.findIndex(
        (entry, entryIndex) => entry === skill && entryIndex !== index,
      );
      if (otherIndex >= 0) {
        const previous = next[index];
        if (!previous) return current;
        next[otherIndex] = previous;
      }
      next[index] = skill;
      return next;
    });
  };

  const tags = tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);

  const selectedPrimaryStyle = runeStyles.find((style) => style.id === runePage?.primaryStyleId);
  const runeComplete =
    Boolean(runePage?.primaryStyleId) &&
    Boolean(selectedPrimaryStyle) &&
    (runePage?.primaryPerkIds.length ?? 0) === (selectedPrimaryStyle?.slots.length ?? 0) &&
    Boolean(runePage?.secondaryStyleId) &&
    (runePage?.secondaryPerkIds.length ?? 0) === 2 &&
    (runePage?.statShards.length ?? 0) === 3;

  const canSave =
    Boolean(champion) &&
    coreItems.length > 0 &&
    selectedSummoners.length === 2 &&
    runeComplete &&
    !saving;

  const saveBuild = async () => {
    if (!champion || !canSave || !runePage) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setSaveStatus("login");
        return;
      }

      const finalTitle =
        title.trim() ||
        copy(
          `${champion.name} · ${role}`,
          `${champion.name} · ${role}`,
          `${champion.name} · ${role}`,
        );

      const primaryStyle = runeStyles.find((style) => style.id === runePage.primaryStyleId);
      const secondaryStyle = runeStyles.find((style) => style.id === runePage.secondaryStyleId);
      const runePayload = {
        ...runePage,
        primaryStyleName: primaryStyle?.name ?? null,
        secondaryStyleName: secondaryStyle?.name ?? null,
        primaryRunes: runePage.primaryPerkIds.map((id) => {
          const match = findLeagueRune(runeStyles, id);
          return { id, name: match?.rune.name ?? null, icon: match?.rune.icon ?? null };
        }),
        secondaryRunes: runePage.secondaryPerkIds.map((id) => {
          const match = findLeagueRune(runeStyles, id);
          return { id, name: match?.rune.name ?? null, icon: match?.rune.icon ?? null };
        }),
      };

      const spellPayload = selectedSummoners.map((id) => {
        const spell = summoners.find((entry) => entry.id === id);
        return {
          id,
          name: spell?.name ?? id,
          icon: spell?.image.full ?? null,
        };
      });

      const buildItems = {
        boots: bootsId ? { id: bootsId, name: items[bootsId]?.name ?? bootsId } : null,
        core: coreItems.map((id, index) => ({
          id,
          name: items[id]?.name ?? id,
          order: index + 1,
        })),
        situational: situationalItems.map((id) => ({
          id,
          name: items[id]?.name ?? id,
        })),
      };

      const rpc = supabase as unknown as SaveBuildRpcClient;
      const { error } = await rpc.rpc("save_user_build_v1", {
        p_game_slug: "league-of-legends",
        p_subject_key: champion.id,
        p_title: finalTitle,
        p_build_data: {
          schemaVersion: 2,
          championId: champion.id,
          championName: champion.name,
          role,
          patchLabel: patchLabel.trim() || null,
          dataDragonVersion: version,
          items: buildItems,
          runes: runePayload,
          summonerSpells: spellPayload,
          skillOrder,
          tags,
          notes: notes.trim(),
        },
        p_source_context: {
          verifiedPatch: buildData?.patch ?? null,
          verifiedSource: buildData?.source?.label ?? null,
          verifiedSourceUrl: buildData?.source?.url ?? null,
          crossChecks: buildData?.crossChecks ?? [],
          createdWith: "mgp-league-builder-v2",
        },
        p_visibility: visibility,
      });

      if (error) throw new Error(error.message || "SAVE_BUILD_FAILED");
      setSaveStatus("saved");
    } catch (error) {
      console.error("[LeagueBuildCreator] save build failed", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const primaryStyle = runeStyles.find((style) => style.id === runePage?.primaryStyleId);
  const keystoneId = runePage?.primaryPerkIds[0];
  const keystone = keystoneId ? findLeagueRune(runeStyles, keystoneId)?.rune : null;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">BUILD CREATOR 2.0</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                {copy(
                  "Crie uma build completa",
                  "Create a complete build",
                  "Crea una build completa",
                )}
              </h3>
            </div>
            <span className="rounded-full border border-border bg-muted/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Data Dragon · {version}
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Agora a build inclui rota, itens core e situacionais, botas, runas, feitiços de invocador, prioridade de habilidades, tags, notas e visibilidade.",
              "Builds now include role, core and situational items, boots, runes, summoner spells, skill priority, tags, notes and visibility.",
              "Ahora la build incluye rol, objetos core y situacionales, botas, runas, hechizos de invocador, prioridad de habilidades, etiquetas, notas y visibilidad.",
            )}
          </p>
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                {copy("Nome da build", "Build name", "Nombre de la build")}
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                className="mt-2"
                placeholder={
                  champion
                    ? copy(
                        `Ex.: ${champion.name} para SoloQ`,
                        `Example: ${champion.name} SoloQ`,
                        `Ej.: ${champion.name} para SoloQ`,
                      )
                    : undefined
                }
              />
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                {copy(
                  "Patch / versão (opcional)",
                  "Patch / version (optional)",
                  "Parche / versión (opcional)",
                )}
              </span>
              <Input
                value={patchLabel}
                onChange={(event) => setPatchLabel(event.target.value)}
                maxLength={24}
                className="mt-2"
                placeholder={buildData?.patch ? `Ex.: ${buildData.patch}` : `Ex.: ${version}`}
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
              {copy("Rota / função", "Role / lane", "Rol / línea")}
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                    role === option
                      ? "border-gold/45 bg-gold/10 text-foreground"
                      : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <PackagePlus className="size-4 text-gold-strong" />
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    {copy("Itens", "Items", "Objetos")}
                  </h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy(
                    "Até 3 itens core, 2 situacionais e 1 par de botas.",
                    "Up to 3 core items, 2 situational items and 1 pair of boots.",
                    "Hasta 3 objetos core, 2 situacionales y 1 par de botas.",
                  )}
                </p>
              </div>
              <div className="flex rounded-xl border border-border bg-muted/10 p-1">
                {(
                  [
                    ["core", copy("Core", "Core", "Core")],
                    ["situational", copy("Situacionais", "Situational", "Situacionales")],
                    ["boots", copy("Botas", "Boots", "Botas")],
                  ] as const
                ).map(([target, label]) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setPickerTarget(target)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                      pickerTarget === target
                        ? "bg-gold/15 text-gold-strong"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ItemGroup
                title={copy("Core", "Core", "Core")}
                icon={Layers3}
                ids={coreItems}
                max={3}
                items={items}
                version={version}
                onRemove={(id) =>
                  setCoreItems((current) => current.filter((entry) => entry !== id))
                }
              />
              <ItemGroup
                title={copy("Situacionais", "Situational", "Situacionales")}
                icon={ShieldCheck}
                ids={situationalItems}
                max={2}
                items={items}
                version={version}
                onRemove={(id) =>
                  setSituationalItems((current) => current.filter((entry) => entry !== id))
                }
              />
              <ItemGroup
                title={copy("Botas", "Boots", "Botas")}
                icon={Footprints}
                ids={bootsId ? [bootsId] : []}
                max={1}
                items={items}
                version={version}
                onRemove={() => setBootsId(null)}
              />
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={itemSearch}
                onChange={(event) => setItemSearch(event.target.value)}
                className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                placeholder={copy(
                  pickerTarget === "boots" ? "Buscar botas…" : "Buscar item…",
                  pickerTarget === "boots" ? "Search boots…" : "Search item…",
                  pickerTarget === "boots" ? "Buscar botas…" : "Buscar objeto…",
                )}
              />
            </label>

            <div className="mgp-media-rail mt-3 grid max-h-[22rem] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 lg:grid-cols-8">
              {selectableItems.map(([id, item]) => {
                const selected = selectedItemIds.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={selected}
                    onClick={() => chooseItem(id)}
                    title={stripMarkup(item.description || item.plaintext || item.name)}
                    className="group min-w-0 rounded-xl border border-border bg-muted/10 p-2 text-center transition hover:border-gold/35 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <img
                      src={itemIcon(version, id, item)}
                      alt=""
                      loading="lazy"
                      className="mx-auto size-12 rounded-lg object-cover"
                    />
                    <p className="mt-2 truncate text-[0.66rem] font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[0.58rem] text-muted-foreground">
                      {item.gold?.total ? `${item.gold.total}g` : "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <LeagueRuneSelector
              version={version}
              locale={locale}
              value={runePage}
              onChange={setRunePage}
            />
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Swords className="size-4 text-gold-strong" />
              <h4 className="font-display text-lg font-semibold text-foreground">
                {copy("Feitiços de invocador", "Summoner spells", "Hechizos de invocador")}
              </h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy(
                "Escolha exatamente dois feitiços.",
                "Choose exactly two spells.",
                "Elige exactamente dos hechizos.",
              )}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {summoners.map((spell) => {
                const selected = selectedSummoners.includes(spell.id);
                return (
                  <button
                    key={spell.id}
                    type="button"
                    onClick={() => toggleSummoner(spell.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-gold/45 bg-gold/10"
                        : "border-border bg-muted/10 hover:border-gold/25",
                    )}
                  >
                    <img
                      src={spellIcon(version, spell)}
                      alt=""
                      className="size-10 rounded-lg border border-border object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-foreground">
                        {spell.name}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[0.64rem] leading-4 text-muted-foreground">
                        {stripMarkup(spell.description)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <ArrowRight className="size-4 text-gold-strong" />
              <h4 className="font-display text-lg font-semibold text-foreground">
                {copy("Prioridade de habilidades", "Skill priority", "Prioridad de habilidades")}
              </h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy(
                "Defina a ordem de maximização de Q, W e E.",
                "Set the Q, W and E max order.",
                "Define el orden para maximizar Q, W y E.",
              )}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {skillOrder.map((skill, index) => (
                <label key={index}>
                  <span className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                    {index + 1}º
                  </span>
                  <select
                    value={skill}
                    onChange={(event) => updateSkillOrder(index, event.target.value as SkillKey)}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-black text-foreground outline-none focus:border-gold/50"
                  >
                    {SKILLS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-2">
            <label>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                <Tags className="size-3.5" />
                {copy("Tags", "Tags", "Etiquetas")}
              </span>
              <Input
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                maxLength={120}
                className="mt-2"
                placeholder={copy(
                  "burst, scaling, anti-tank…",
                  "burst, scaling, anti-tank…",
                  "burst, scaling, anti-tank…",
                )}
              />
              <span className="mt-1 block text-[0.62rem] text-muted-foreground">
                {copy(
                  "Separe por vírgulas. Máximo de 6.",
                  "Comma-separated. Maximum 6.",
                  "Separadas por comas. Máximo 6.",
                )}
              </span>
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                {copy("Visibilidade", "Visibility", "Visibilidad")}
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold",
                    visibility === "private"
                      ? "border-gold/45 bg-gold/10 text-foreground"
                      : "border-border bg-muted/10 text-muted-foreground",
                  )}
                >
                  <EyeOff className="size-3.5" />
                  {copy("Privada", "Private", "Privada")}
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-xs font-bold",
                    visibility === "public"
                      ? "border-gold/45 bg-gold/10 text-foreground"
                      : "border-border bg-muted/10 text-muted-foreground",
                  )}
                >
                  <Eye className="size-3.5" />
                  {copy("Pública", "Public", "Pública")}
                </button>
              </div>
            </label>
          </div>

          <label className="block border-t border-border pt-6">
            <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
              {copy(
                "Descrição / como jogar",
                "Description / how to play",
                "Descripción / cómo jugar",
              )}
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1600}
              className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background p-3 text-sm leading-6 text-foreground outline-none focus:border-gold/50"
              placeholder={copy(
                "Explique pico de poder, quando trocar itens situacionais, matchups e objetivo da build…",
                "Explain power spikes, when to swap situational items, matchups and the build's goal…",
                "Explica picos de poder, cuándo cambiar objetos situacionales, matchups y el objetivo de la build…",
              )}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="button"
              disabled={!canSave}
              onClick={() => void saveBuild()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-gold-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {saving
                ? copy("Salvando…", "Saving…", "Guardando…")
                : copy("Salvar build", "Save build", "Guardar build")}
            </button>
            <p className="text-xs leading-5 text-muted-foreground">
              {saveStatus === "saved"
                ? copy(
                    visibility === "public"
                      ? "Build pública salva no seu perfil."
                      : "Build privada salva no seu perfil.",
                    visibility === "public"
                      ? "Public build saved to your profile."
                      : "Private build saved to your profile.",
                    visibility === "public"
                      ? "Build pública guardada en tu perfil."
                      : "Build privada guardada en tu perfil.",
                  )
                : saveStatus === "login"
                  ? copy(
                      "Entre na sua conta para salvar.",
                      "Sign in to save.",
                      "Inicia sesión para guardar.",
                    )
                  : saveStatus === "error"
                    ? copy(
                        "Não foi possível salvar agora.",
                        "Could not save right now.",
                        "No se pudo guardar ahora.",
                      )
                    : !coreItems.length
                      ? copy(
                          "Adicione pelo menos um item core.",
                          "Add at least one core item.",
                          "Añade al menos un objeto core.",
                        )
                      : selectedSummoners.length !== 2
                        ? copy(
                            "Escolha dois feitiços de invocador.",
                            "Choose two summoner spells.",
                            "Elige dos hechizos de invocador.",
                          )
                        : !runeComplete
                          ? copy(
                              "Complete a página de runas.",
                              "Complete the rune page.",
                              "Completa la página de runas.",
                            )
                          : copy(
                              "Tudo pronto para salvar.",
                              "Ready to save.",
                              "Todo listo para guardar.",
                            )}
            </p>
          </div>
        </div>
      </div>

      <aside className="surface-panel self-start overflow-hidden xl:sticky xl:top-24">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.12),transparent_55%)] p-5">
          <p className="section-kicker">{copy("PRÉVIA", "PREVIEW", "VISTA PREVIA")}</p>
          <h3 className="mt-2 font-display text-xl font-bold text-foreground">
            {title.trim() ||
              (champion
                ? `${champion.name} · ${role}`
                : copy("Sua build", "Your build", "Tu build"))}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {patchLabel.trim() || buildData?.patch || version} · {role}
          </p>
        </div>

        <div className="space-y-4 p-4">
          {champion ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-3">
              <img
                src={championIcon(version, champion)}
                alt=""
                className="size-12 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{champion.name}</p>
                <p className="text-[0.66rem] text-muted-foreground">{champion.tags.join(" · ")}</p>
              </div>
            </div>
          ) : null}

          <PreviewBlock title={copy("Itens", "Items", "Objetos")}>
            <div className="flex flex-wrap gap-2">
              {[...(bootsId ? [bootsId] : []), ...coreItems, ...situationalItems].map((id) => (
                <img
                  key={id}
                  src={itemIcon(version, id, items[id])}
                  alt=""
                  title={items[id]?.name}
                  className="size-10 rounded-lg border border-border object-cover"
                />
              ))}
              {!bootsId && !coreItems.length && !situationalItems.length ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : null}
            </div>
          </PreviewBlock>

          <PreviewBlock title={copy("Runas", "Runes", "Runas")}>
            <div className="flex items-center gap-2">
              {keystone ? (
                <img
                  src={leagueRuneIcon(keystone.icon)}
                  alt=""
                  className="size-10 rounded-full object-contain"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">
                  {keystone?.name ?? "—"}
                </p>
                <p className="truncate text-[0.64rem] text-muted-foreground">
                  {primaryStyle?.name ?? copy("Árvore primária", "Primary tree", "Árbol primario")}
                </p>
              </div>
            </div>
          </PreviewBlock>

          <PreviewBlock title={copy("Feitiços", "Spells", "Hechizos")}>
            <div className="flex gap-2">
              {selectedSummoners.map((id) => {
                const spell = summoners.find((entry) => entry.id === id);
                return spell ? (
                  <img
                    key={id}
                    src={spellIcon(version, spell)}
                    alt=""
                    title={spell.name}
                    className="size-10 rounded-lg border border-border object-cover"
                  />
                ) : null;
              })}
              {!selectedSummoners.length ? (
                <span className="text-xs text-muted-foreground">—</span>
              ) : null}
            </div>
          </PreviewBlock>

          <PreviewBlock title={copy("Skills", "Skills", "Habilidades")}>
            <div className="flex items-center gap-1.5">
              {skillOrder.map((skill, index) => (
                <span key={skill} className="inline-flex items-center gap-1">
                  <span className="grid size-8 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-xs font-black text-gold-strong">
                    {skill}
                  </span>
                  {index < skillOrder.length - 1 ? (
                    <ArrowRight className="size-3 text-muted-foreground" />
                  ) : null}
                </span>
              ))}
            </div>
          </PreviewBlock>

          {tags.length ? (
            <PreviewBlock title={copy("Tags", "Tags", "Etiquetas")}>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted/15 px-2 py-1 text-[0.62rem] font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </PreviewBlock>
          ) : null}

          {buildData?.builds[0]?.items?.length && coreItems.length ? (
            <div className="rounded-xl border border-border bg-muted/10 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-gold-strong" />
                <p className="text-xs font-bold text-foreground">
                  {copy(
                    "Comparação com referência",
                    "Reference comparison",
                    "Comparación con referencia",
                  )}
                </p>
              </div>
              <p className="mt-2 text-[0.68rem] leading-5 text-muted-foreground">
                {copy(
                  `${coreItems.filter((id) => buildData.builds[0]?.items.some((item) => item.id === id)).length}/${coreItems.length} dos seus itens core aparecem na rota principal verificada atual.`,
                  `${coreItems.filter((id) => buildData.builds[0]?.items.some((item) => item.id === id)).length}/${coreItems.length} of your core items appear in the current verified primary path.`,
                  `${coreItems.filter((id) => buildData.builds[0]?.items.some((item) => item.id === id)).length}/${coreItems.length} de tus objetos core aparecen en la ruta principal verificada actual.`,
                )}
              </p>
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  );
}

function ItemGroup({
  title,
  icon: Icon,
  ids,
  max,
  items,
  version,
  onRemove,
}: {
  title: string;
  icon: typeof Layers3;
  ids: string[];
  max: number;
  items: Record<string, LeagueBuildItemSummary>;
  version: string;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-foreground">
          <Icon className="size-3.5 text-gold-strong" />
          {title}
        </span>
        <span className="text-[0.62rem] font-semibold text-muted-foreground">
          {ids.length}/{max}
        </span>
      </div>
      <div className="mt-3 flex min-h-12 flex-wrap gap-2">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onRemove(id)}
            title={items[id]?.name}
            className="group relative"
          >
            <img
              src={itemIcon(version, id, items[id])}
              alt=""
              className="size-11 rounded-lg border border-border object-cover"
            />
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-black/80 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <X className="size-3" />
            </span>
          </button>
        ))}
        {Array.from({ length: Math.max(0, max - ids.length) }).map((_, index) => (
          <span
            key={index}
            className="grid size-11 place-items-center rounded-lg border border-dashed border-border text-muted-foreground"
          >
            +
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/45 p-3">
      <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}
