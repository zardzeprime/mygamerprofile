import {
  BookOpen,
  ExternalLink,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Sword,
  WandSparkles,
  Gem,
  PackageOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  loadSoulsCompendium,
  SOULS_COMPENDIUM_SOURCE,
  type SoulsCompendiumCategory,
  type SoulsCompendiumEntry,
  type SoulsCompendiumGame,
} from "@/lib/souls-compendium";
import { localizeSoulsDescription } from "@/lib/souls-localization";
import { cn } from "@/lib/utils";
import {
  DS1_UPGRADE_PATHS,
  getDs1UpgradePathOptions,
  loadDs1Weapons,
  loadDs3WeaponLevel,
  loadDs3Weapons,
  type Ds1UpgradePath,
  type Ds3WeaponLevel,
  type SoulsDpsStat,
  type SoulsDpsWeapon,
} from "@/lib/souls-dps";
import {
  loadSoulsArmorTechnical,
  normalizeSoulsEquipmentName,
  type SoulsArmorTechnical,
  type SoulsArmorSlot,
} from "@/lib/souls-armor";
import {
  findSoulsRingEffect,
  loadSoulsRingEffects,
  type SoulsRingEffect,
} from "@/lib/souls-ring-effects";
import {
  findSoulsItemMetadata,
  loadSoulsItemMetadata,
  type SoulsItemMetadata,
} from "@/lib/souls-item-metadata";
import {
  findSoulsSpellMetadata,
  loadSoulsSpellMetadata,
  type SoulsSpellMetadata,
  type SoulsSpellSchool,
} from "@/lib/souls-spell-metadata";

const CATEGORIES: Array<{
  key: "all" | SoulsCompendiumCategory;
  icon: typeof Sword;
}> = [
  { key: "all", icon: BookOpen },
  { key: "weapon", icon: Sword },
  { key: "armor", icon: Shield },
  { key: "ring", icon: Gem },
  { key: "magic", icon: WandSparkles },
  { key: "item", icon: PackageOpen },
];

export function SoulsItemCompendium({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [entries, setEntries] = useState<SoulsCompendiumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [category, setCategory] = useState<"all" | SoulsCompendiumCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [technicalWeapons, setTechnicalWeapons] = useState<SoulsDpsWeapon[]>([]);
  const [technicalArmor, setTechnicalArmor] = useState<SoulsArmorTechnical[]>([]);
  const [ringEffects, setRingEffects] = useState<SoulsRingEffect[]>([]);
  const [itemMetadata, setItemMetadata] = useState<SoulsItemMetadata[]>([]);
  const [spellMetadata, setSpellMetadata] = useState<SoulsSpellMetadata[]>([]);
  const [localizedDescription, setLocalizedDescription] = useState<string | null>(null);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [descriptionTranslationFailed, setDescriptionTranslationFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const technicalLoader = gameSlug === "dark-souls-iii" ? loadDs3Weapons() : loadDs1Weapons();

    void technicalLoader
      .then((data) => {
        if (active) setTechnicalWeapons(data);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] technical weapon data unavailable", error);
        if (active) setTechnicalWeapons([]);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    let active = true;

    void loadSoulsArmorTechnical(gameSlug)
      .then((data) => {
        if (active) setTechnicalArmor(data);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] technical armor data unavailable", error);
        if (active) setTechnicalArmor([]);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    let active = true;

    void loadSoulsRingEffects(gameSlug)
      .then((data) => {
        if (active) setRingEffects(data);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] ring effect data unavailable", error);
        if (active) setRingEffects([]);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    let active = true;

    void loadSoulsItemMetadata(gameSlug)
      .then((data) => {
        if (active) setItemMetadata(data);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] item metadata unavailable", error);
        if (active) setItemMetadata([]);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    let active = true;

    void loadSoulsSpellMetadata(gameSlug)
      .then((data) => {
        if (active) setSpellMetadata(data);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] spell metadata unavailable", error);
        if (active) setSpellMetadata([]);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    void loadSoulsCompendium(gameSlug)
      .then((data) => {
        if (!active) return;
        setEntries(data);
        setSelectedId(null);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] load failed", error);
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!normalized) return true;
      return `${entry.name} ${entry.description}`.toLocaleLowerCase(locale).includes(normalized);
    });
  }, [category, entries, locale, query]);

  const selected = entries.find((entry) => entry.id === selectedId) ?? null;
  const technicalWeapon =
    selected?.category === "weapon"
      ? (technicalWeapons.find(
          (weapon) =>
            normalizeSoulsEquipmentName(weapon.name) === normalizeSoulsEquipmentName(selected.name),
        ) ?? null)
      : null;
  const technicalArmorEntry =
    selected?.category === "armor"
      ? (technicalArmor.find(
          (armor) =>
            normalizeSoulsEquipmentName(armor.name) === normalizeSoulsEquipmentName(selected.name),
        ) ?? null)
      : null;
  const technicalRingEffect =
    selected?.category === "ring" ? findSoulsRingEffect(ringEffects, selected.name) : null;
  const selectedMetadata = selected ? findSoulsItemMetadata(itemMetadata, selected.name) : null;
  const selectedSpellMetadata =
    selected?.category === "magic" ? findSoulsSpellMetadata(spellMetadata, selected.name) : null;

  useEffect(() => {
    let active = true;
    setDescriptionTranslationFailed(false);

    if (!selected?.description) {
      setLocalizedDescription(null);
      setDescriptionLoading(false);
      return () => {
        active = false;
      };
    }

    if (locale === "en") {
      setLocalizedDescription(selected.description);
      setDescriptionLoading(false);
      return () => {
        active = false;
      };
    }

    setLocalizedDescription(null);
    setDescriptionLoading(true);
    void localizeSoulsDescription(selected, locale)
      .then((text) => {
        if (active) setLocalizedDescription(text);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] localized description unavailable", error);
        if (active) {
          setLocalizedDescription(selected.description);
          setDescriptionTranslationFailed(true);
        }
      })
      .finally(() => {
        if (active) setDescriptionLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, selected]);

  const gameName =
    gameSlug === "dark-souls-remastered" ? "Dark Souls Remastered" : "Dark Souls III";

  const categoryLabel = (value: "all" | SoulsCompendiumCategory) => {
    const labels = {
      all: copy("Tudo", "All", "Todo"),
      weapon: copy("Armas e escudos", "Weapons & shields", "Armas y escudos"),
      armor: copy("Armaduras", "Armor", "Armaduras"),
      ring: copy("Anéis", "Rings", "Anillos"),
      magic: copy("Magias", "Magic", "Magias"),
      item: copy("Itens", "Items", "Objetos"),
    };
    return labels[value];
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.10),transparent_48%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-gold-strong">
            <Sparkles className="size-4" />
            <span className="section-kicker">MGP · SOULS COMPENDIUM</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy(`Compêndio de ${gameName}`, `${gameName} compendium`, `Compendio de ${gameName}`)}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Armas, escudos, armaduras, anéis, magias e itens em um único diretório pesquisável. O beta usa os ícones originais apenas como referência e mantém a procedência visível.",
              "Weapons, shields, armor, rings, magic and items in one searchable directory. The beta uses original icons as reference only and keeps provenance visible.",
              "Armas, escudos, armaduras, anillos, magia y objetos en un único directorio buscable. La beta usa iconos originales solo como referencia y mantiene la procedencia visible.",
            )}
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy(
                "Buscar arma, anel, magia, item…",
                "Search weapon, ring, spell, item…",
                "Buscar arma, anillo, magia, objeto…",
              )}
            />
          </label>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition",
                  category === key
                    ? "border-gold/45 bg-gold/10 text-foreground"
                    : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {categoryLabel(key)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-[0.66rem] font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-1">
              {filtered.length} {copy("resultados", "results", "resultados")}
            </span>
            {CATEGORIES.slice(1).map(({ key }) => (
              <span key={key} className="rounded-full border border-border px-2.5 py-1">
                {categoryLabel(key)} · {entries.filter((entry) => entry.category === key).length}
              </span>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="surface-panel p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold-strong" />
            {copy("Carregando compêndio…", "Loading compendium…", "Cargando compendio…")}
          </div>
        </section>
      ) : failed ? (
        <section className="surface-panel p-6 text-sm leading-6 text-muted-foreground">
          {copy(
            "A fonte do compêndio não respondeu agora. Os bosses, builds e guias locais continuam disponíveis.",
            "The compendium source is unavailable right now. Local bosses, builds and guides remain available.",
            "La fuente del compendio no respondió ahora. Los jefes, builds y guías locales siguen disponibles.",
          )}
        </section>
      ) : (
        <>
          <section className="surface-panel p-4 sm:p-5">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {filtered.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    className="group min-w-0 rounded-2xl border border-border bg-muted/10 p-3 text-left transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
                    aria-label={copy(
                      `Abrir detalhes de ${entry.name}`,
                      `Open details for ${entry.name}`,
                      `Abrir detalles de ${entry.name}`,
                    )}
                  >
                    <div className="mx-auto grid aspect-square max-w-24 place-items-center overflow-hidden rounded-xl border border-border bg-black/20">
                      <img
                        src={entry.iconUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs font-bold leading-5 text-foreground">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                      {categoryLabel(entry.category)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {copy(
                  "Nenhum resultado encontrado.",
                  "No results found.",
                  "No se encontraron resultados.",
                )}
              </div>
            )}
          </section>

          <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
            <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
              {selected ? (
                <div className="min-w-0">
                  <DialogHeader className="text-left">
                    <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center">
                      <div className="grid size-28 shrink-0 place-items-center rounded-2xl border border-border bg-black/20 p-3 shadow-lift">
                        <img src={selected.iconUrl} alt="" className="size-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
                          {categoryLabel(selected.category)} · {gameName}
                        </p>
                        <DialogTitle className="mt-1 font-display text-2xl sm:text-3xl">
                          {selected.name}
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-left">
                          {copy(
                            "Requisitos, scaling, atributos técnicos e informações de referência.",
                            "Requirements, scaling, technical stats and reference information.",
                            "Requisitos, scaling, atributos técnicos e información de referencia.",
                          )}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
                    <div className="space-y-4">
                      {technicalWeapon ? (
                        <WeaponTechnicalCard
                          weapon={technicalWeapon}
                          gameSlug={gameSlug}
                          locale={locale}
                        />
                      ) : null}
                      {technicalArmorEntry ? (
                        <ArmorTechnicalCard armor={technicalArmorEntry} locale={locale} />
                      ) : null}
                      {technicalRingEffect ? (
                        <RingEffectCard effect={technicalRingEffect} locale={locale} />
                      ) : null}
                      {selectedMetadata ? (
                        <ItemMetadataCard metadata={selectedMetadata} locale={locale} />
                      ) : null}
                      {selectedSpellMetadata ? (
                        <SpellMetadataCard metadata={selectedSpellMetadata} locale={locale} />
                      ) : null}

                      {!technicalWeapon &&
                      !technicalArmorEntry &&
                      !technicalRingEffect &&
                      !selectedMetadata &&
                      !selectedSpellMetadata ? (
                        <div className="rounded-2xl border border-border bg-muted/10 p-4 text-sm leading-6 text-muted-foreground">
                          {copy(
                            "Este registro não possui dados técnicos adicionais na fonte atual.",
                            "This entry has no additional technical data in the current source.",
                            "Este registro no tiene datos técnicos adicionales en la fuente actual.",
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <section className="rounded-2xl border border-border bg-muted/10 p-4">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                          {copy(
                            "Descrição de referência",
                            "Reference description",
                            "Descripción de referencia",
                          )}
                        </p>
                        {descriptionLoading ? (
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-gold-strong" />
                            {copy(
                              "Traduzindo descrição para português…",
                              "Loading description…",
                              "Traduciendo descripción al español…",
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                            {localizedDescription ||
                              copy(
                                "Sem descrição na fonte.",
                                "No source description.",
                                "Sin descripción en la fuente.",
                              )}
                          </p>
                        )}
                        {descriptionTranslationFailed && locale !== "en" ? (
                          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2 text-[0.66rem] leading-5 text-amber-200/85">
                            {copy(
                              "Tradução temporariamente indisponível; mostrando a fonte original em inglês.",
                              "Translation is temporarily unavailable; showing the original English source.",
                              "La traducción no está disponible temporalmente; se muestra la fuente original en inglés.",
                            )}
                          </p>
                        ) : null}
                      </section>

                      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
                        <p className="text-xs font-bold text-foreground">
                          {copy("Créditos e direitos", "Credits & rights", "Créditos y derechos")}
                        </p>
                        <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
                          {SOULS_COMPENDIUM_SOURCE.rights[locale]}
                        </p>
                        <a
                          href={SOULS_COMPENDIUM_SOURCE.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-bold text-gold-strong hover:underline"
                        >
                          {SOULS_COMPENDIUM_SOURCE.label}
                          <ExternalLink className="size-3" />
                        </a>
                      </section>
                    </div>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function WeaponTechnicalCard({
  weapon,
  gameSlug,
  locale,
}: {
  weapon: SoulsDpsWeapon;
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const isDs3 = gameSlug === "dark-souls-iii";
  const stats: Array<[SoulsDpsStat, string]> = [
    ["str", "STR"],
    ["dex", "DEX"],
    ["int", "INT"],
    ["fth", "FTH"],
    ["lck", "LCK"],
  ];

  const ds1Paths = useMemo(() => getDs1UpgradePathOptions(weapon), [weapon]);
  const [ds1Path, setDs1Path] = useState<Ds1UpgradePath>("regular");
  const [infusion, setInfusion] = useState("-");
  const [upgrade, setUpgrade] = useState(0);
  const [focusStat, setFocusStat] = useState<SoulsDpsStat>("str");
  const [ds3Level, setDs3Level] = useState<Ds3WeaponLevel | null>(null);
  const [levelLoading, setLevelLoading] = useState(false);
  const [levelFailed, setLevelFailed] = useState(false);

  useEffect(() => {
    const nextInfusion = weapon.infusions?.includes("-") ? "-" : (weapon.infusions?.[0] ?? "-");
    setInfusion(nextInfusion);
    setDs1Path("regular");
    setUpgrade(0);
    const preferred = (["str", "dex", "int", "fth", "lck"] as SoulsDpsStat[]).find((stat) => {
      const grade = weapon.scalingLetters?.[stat];
      return Boolean(grade && grade !== "-");
    });
    setFocusStat(preferred ?? "str");
  }, [weapon]);

  const maxUpgrade = isDs3
    ? weapon.maxUpgrade
    : ds1Path === "regular"
      ? weapon.maxUpgrade
      : DS1_UPGRADE_PATHS[ds1Path].maxUpgrade;

  useEffect(() => {
    setUpgrade((current) => Math.min(current, maxUpgrade));
  }, [maxUpgrade]);

  useEffect(() => {
    let active = true;
    if (!isDs3) {
      setDs3Level(null);
      setLevelFailed(false);
      return;
    }

    setLevelLoading(true);
    setLevelFailed(false);
    void loadDs3WeaponLevel(weapon.name, infusion, upgrade)
      .then((entry) => {
        if (!active) return;
        setDs3Level(entry);
        setLevelFailed(!entry);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] DS3 weapon level unavailable", error);
        if (active) {
          setDs3Level(null);
          setLevelFailed(true);
        }
      })
      .finally(() => {
        if (active) setLevelLoading(false);
      });

    return () => {
      active = false;
    };
  }, [infusion, isDs3, upgrade, weapon.name]);

  const currentWeapon = isDs3 && ds3Level ? ds3Level : weapon;
  const requirements = currentWeapon.requirements;
  const scaling = isDs3
    ? (currentWeapon.scalingLetters ?? weapon.scalingLetters ?? {})
    : ds1ScalingForPath(weapon, ds1Path);
  const damageSource = isDs3
    ? currentWeapon.baseDamage
    : ds1Path === "regular"
      ? ds1RegularDamageAtUpgrade(weapon, upgrade)
      : weapon.baseDamage;
  const damage = [
    ["PHY", damageSource.physical],
    ["MAG", damageSource.magic],
    ["FIRE", damageSource.fire],
    ["LIGHT", damageSource.lightning],
    ["DARK", damageSource.dark],
  ].filter(([, value]) => Number(value) > 0);
  const focusGrade = scaling[focusStat] || "-";

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
        {copy("Características técnicas", "Technical characteristics", "Características técnicas")}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {weapon.weaponClass ? (
          <TechCell label={copy("Classe", "Class", "Clase")} value={weapon.weaponClass} />
        ) : null}
        {weapon.weight != null ? (
          <TechCell label={copy("Peso", "Weight", "Peso")} value={weapon.weight} />
        ) : null}
        {weapon.durability != null ? (
          <TechCell
            label={copy("Durabilidade", "Durability", "Durabilidad")}
            value={weapon.durability}
          />
        ) : null}
        {weapon.enchantable != null ? (
          <TechCell
            label={copy("Buff de arma", "Weapon buff", "Buff de arma")}
            value={
              weapon.enchantable
                ? copy("Permitido", "Allowed", "Permitido")
                : copy("Não", "No", "No")
            }
          />
        ) : null}
        <TechCell
          label={copy("Estado simulado", "Simulated state", "Estado simulado")}
          value={`+${upgrade}`}
        />
        <TechCell
          label={copy("Modificação", "Modification", "Modificación")}
          value={isDs3 ? ds3InfusionLabel(infusion, locale) : DS1_UPGRADE_PATHS[ds1Path].label}
        />
      </div>

      <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {copy("Requisitos", "Requirements", "Requisitos")}
      </p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <TechCell label="STR" value={requirements.str} compact />
        <TechCell label="DEX" value={requirements.dex} compact />
        <TechCell label="INT" value={requirements.int} compact />
        <TechCell label="FTH" value={requirements.fth} compact />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {copy("Scaling por atributo", "Attribute scaling", "Scaling por atributo")}
          </p>
          <p className="mt-1 text-[0.64rem] text-muted-foreground">
            {copy(
              "Selecione um atributo para destacar abaixo.",
              "Select an attribute to highlight below.",
              "Selecciona un atributo para destacarlo abajo.",
            )}
          </p>
        </div>
        <label className="block">
          <span className="sr-only">
            {copy("Atributo em foco", "Focused attribute", "Atributo destacado")}
          </span>
          <select
            value={focusStat}
            onChange={(event) => setFocusStat(event.target.value as SoulsDpsStat)}
            className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-bold text-foreground outline-none focus:border-gold/50"
          >
            {stats.map(([stat, label]) => (
              <option key={stat} value={stat}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {stats.map(([stat, label]) => {
          const grade = scaling[stat] || "-";
          const active = stat === focusStat;
          return (
            <div
              key={stat}
              className={cn(
                "rounded-lg border px-2 py-2 text-center transition",
                active
                  ? "border-gold/60 bg-gold/[0.12] ring-1 ring-gold/20"
                  : grade !== "-"
                    ? "border-gold/30 bg-gold/[0.06]"
                    : "border-border bg-background/35 opacity-65",
              )}
            >
              <p className="text-[0.55rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 font-display text-base font-black text-foreground">{grade}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[0.64rem] leading-5 text-muted-foreground">
        {copy("Atributo em foco", "Focused attribute", "Atributo destacado")}:{" "}
        <strong className="text-foreground">
          {focusStat.toUpperCase()} · {focusGrade}
        </strong>
      </p>

      {damage.length ? (
        <>
          <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {copy(
              isDs3 ? "Dano base no estado selecionado" : "Dano base de referência",
              isDs3 ? "Base damage at selected state" : "Reference base damage",
              isDs3 ? "Daño base en el estado seleccionado" : "Daño base de referencia",
            )}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {damage.map(([label, value]) => (
              <TechCell
                key={String(label)}
                label={String(label)}
                value={Math.round(Number(value))}
                compact
              />
            ))}
          </div>
        </>
      ) : null}

      <section className="mt-5 rounded-2xl border border-border bg-background/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
              {copy("Simular reforço", "Upgrade simulator", "Simular mejora")}
            </p>
            <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
              {copy(
                "Troque a modificação da arma e mova a barra até o nível que você quer conferir.",
                "Change the weapon modification and move the bar to the level you want to inspect.",
                "Cambia la modificación del arma y mueve la barra al nivel que quieras revisar.",
              )}
            </p>
          </div>
          {levelLoading ? <Loader2 className="size-4 animate-spin text-gold-strong" /> : null}
        </div>

        <label className="mt-4 block">
          <span className="text-[0.58rem] font-black uppercase tracking-[0.09em] text-muted-foreground">
            {isDs3
              ? copy("Infusão / gema", "Infusion / gem", "Infusión / gema")
              : copy("Caminho / atributo", "Upgrade path / affinity", "Ruta / afinidad")}
          </span>
          {isDs3 ? (
            <select
              value={infusion}
              onChange={(event) => {
                setInfusion(event.target.value);
                setUpgrade(0);
              }}
              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
            >
              {(weapon.infusions?.length ? weapon.infusions : ["-"]).map((value) => (
                <option key={value} value={value}>
                  {ds3InfusionLabel(value, locale)}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={ds1Path}
              onChange={(event) => {
                setDs1Path(event.target.value as Ds1UpgradePath);
                setUpgrade(0);
              }}
              className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
            >
              {ds1Paths.map((value) => (
                <option key={value} value={value}>
                  {DS1_UPGRADE_PATHS[value].label}
                </option>
              ))}
            </select>
          )}
        </label>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.58rem] font-black uppercase tracking-[0.09em] text-muted-foreground">
              {copy("Nível da arma", "Weapon level", "Nivel del arma")}
            </span>
            <span className="rounded-lg border border-gold/25 bg-gold/10 px-2 py-1 text-xs font-black text-gold-strong">
              +{upgrade}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxUpgrade}
            value={upgrade}
            onChange={(event) => setUpgrade(Number(event.target.value))}
            className="mt-3 w-full accent-[hsl(var(--gold))]"
          />
          <div className="mt-1 flex justify-between text-[0.62rem] text-muted-foreground">
            <span>+0</span>
            <span>+{maxUpgrade}</span>
          </div>
        </div>

        {!isDs3 && ds1Path !== "regular" ? (
          <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-[0.66rem] leading-5 text-muted-foreground">
            {copy(
              `Rota ${DS1_UPGRADE_PATHS[ds1Path].label}: ${ds1PathDescription(ds1Path, "pt-BR")} Quando a fonte não fornece letra exata por arma nessa rota, o MGP mostra o foco do scaling sem inventar uma graduação.`,
              `${DS1_UPGRADE_PATHS[ds1Path].label} path: ${ds1PathDescription(ds1Path, "en")} When the source does not provide an exact per-weapon letter for this path, MGP shows the scaling focus without inventing a grade.`,
              `Ruta ${DS1_UPGRADE_PATHS[ds1Path].label}: ${ds1PathDescription(ds1Path, "es")} Cuando la fuente no ofrece una letra exacta por arma en esta ruta, MGP muestra el enfoque del scaling sin inventar una graduación.`,
            )}
          </p>
        ) : null}

        {isDs3 && levelFailed ? (
          <p className="mt-3 text-[0.66rem] leading-5 text-amber-300/85">
            {copy(
              "Essa combinação de infusão e nível não respondeu na fonte técnica; mantive os dados-base da arma.",
              "This infusion/level combination did not resolve in the technical source; base weapon data is shown instead.",
              "Esta combinación de infusión y nivel no respondió en la fuente técnica; se muestran los datos base.",
            )}
          </p>
        ) : null}
      </section>

      {weapon.attackTypes?.length ? (
        <p className="mt-3 text-[0.66rem] leading-5 text-muted-foreground">
          <strong className="text-foreground">{copy("Ataques:", "Attacks:", "Ataques:")}</strong>{" "}
          {weapon.attackTypes.map((value) => localizeAttackType(value, locale)).join(" · ")}
        </p>
      ) : null}
      {weapon.obtained?.length ? (
        <p className="mt-2 text-[0.66rem] leading-5 text-muted-foreground">
          <strong className="text-foreground">
            {copy("Obtenção:", "Obtained:", "Obtención:")}
          </strong>{" "}
          {weapon.obtained.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function ds1RegularDamageAtUpgrade(weapon: SoulsDpsWeapon, upgrade: number) {
  const ratio = weapon.maxUpgrade > 0 ? Math.min(1, Math.max(0, upgrade) / weapon.maxUpgrade) : 0;
  const end = weapon.maxDamage ?? weapon.baseDamage;
  return {
    physical: weapon.baseDamage.physical + (end.physical - weapon.baseDamage.physical) * ratio,
    magic: weapon.baseDamage.magic + (end.magic - weapon.baseDamage.magic) * ratio,
    fire: weapon.baseDamage.fire + (end.fire - weapon.baseDamage.fire) * ratio,
    lightning: weapon.baseDamage.lightning + (end.lightning - weapon.baseDamage.lightning) * ratio,
    dark: weapon.baseDamage.dark + (end.dark - weapon.baseDamage.dark) * ratio,
  };
}

function ds1ScalingForPath(
  weapon: SoulsDpsWeapon,
  path: Ds1UpgradePath,
): Partial<Record<SoulsDpsStat, string>> {
  const base = Object.fromEntries(
    Object.entries(weapon.scalingLetters ?? {}).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    ),
  ) as Partial<Record<SoulsDpsStat, string>>;
  if (path === "regular" || path === "crystal") return base;
  if (path === "magic") return { int: "FOCO" };
  if (path === "enchanted") return { int: "FOCO+" };
  if (path === "divine") return { fth: "FOCO" };
  if (path === "occult") return { fth: "FOCO+" };
  if (path === "raw") {
    return Object.fromEntries(
      Object.entries(base)
        .filter(([, grade]) => Boolean(grade) && grade !== "-")
        .map(([stat]) => [stat, "RED."]),
    ) as Partial<Record<SoulsDpsStat, string>>;
  }
  return {};
}

function ds1PathDescription(path: Ds1UpgradePath, locale: Locale) {
  const copy: Record<Ds1UpgradePath, Record<Locale, string>> = {
    regular: {
      "pt-BR": "Mantém o scaling natural da arma e chega até +15 quando a arma permite.",
      en: "Keeps the weapon's natural scaling and reaches +15 when the weapon supports it.",
      es: "Mantiene el scaling natural del arma y llega hasta +15 cuando el arma lo permite.",
    },
    raw: {
      "pt-BR": "Aumenta o dano base e reduz a importância do scaling.",
      en: "Raises base damage while reducing the importance of attribute scaling.",
      es: "Aumenta el daño base y reduce la importancia del scaling por atributos.",
    },
    crystal: {
      "pt-BR": "Prioriza dano físico alto, preservando parte do foco original em atributos.",
      en: "Prioritizes high physical damage while retaining part of the weapon's original attribute focus.",
      es: "Prioriza un daño físico alto y conserva parte del enfoque original en atributos.",
    },
    magic: {
      "pt-BR": "Divide o dano com magia e adiciona foco em Inteligência.",
      en: "Splits damage with magic and adds an Intelligence focus.",
      es: "Divide el daño con magia y añade enfoque en Inteligencia.",
    },
    enchanted: {
      "pt-BR": "Aprofunda o foco em Inteligência em troca de parte do scaling físico.",
      en: "Pushes the Intelligence focus further at the cost of some physical scaling.",
      es: "Profundiza el enfoque en Inteligencia a cambio de parte del scaling físico.",
    },
    divine: {
      "pt-BR": "Divide o dano com magia e adiciona foco em Fé.",
      en: "Splits damage with magic and adds a Faith focus.",
      es: "Divide el daño con magia y añade enfoque en Fe.",
    },
    occult: {
      "pt-BR": "Aprofunda o foco em Fé e altera o comportamento contra alvos específicos.",
      en: "Pushes the Faith focus further and changes performance against specific targets.",
      es: "Profundiza el enfoque en Fe y cambia el rendimiento contra objetivos específicos.",
    },
    fire: {
      "pt-BR": "Adiciona dano de fogo e remove o scaling normal de atributos.",
      en: "Adds fire damage and removes normal attribute scaling.",
      es: "Añade daño de fuego y elimina el scaling normal por atributos.",
    },
    chaos: {
      "pt-BR": "Adiciona dano de fogo, remove o scaling normal e considera Humanidade segurada.",
      en: "Adds fire damage, removes normal scaling and takes held Humanity into account.",
      es: "Añade daño de fuego, elimina el scaling normal y tiene en cuenta la Humanidad acumulada.",
    },
    lightning: {
      "pt-BR": "Adiciona dano de raio e remove o scaling normal de atributos.",
      en: "Adds lightning damage and removes normal attribute scaling.",
      es: "Añade daño de rayo y elimina el scaling normal por atributos.",
    },
  };
  return copy[path][locale];
}

function localizeAttackType(value: string, locale: Locale) {
  if (locale === "en") return value;
  const dictionary =
    locale === "es"
      ? { Regular: "Normal", Slash: "Corte", Thrust: "Perforación", Strike: "Golpe" }
      : { Regular: "Normal", Slash: "Corte", Thrust: "Perfuração", Strike: "Impacto" };
  return value
    .split("/")
    .map((part) => {
      const trimmed = part.trim();
      return dictionary[trimmed as keyof typeof dictionary] ?? trimmed;
    })
    .join(" / ");
}

function ds3InfusionLabel(value: string, locale: Locale) {
  if (!value || value === "-") {
    return localeCopy(locale, "Sem infusão", "No infusion", "Sin infusión");
  }
  const normalized = value.trim().toLowerCase();
  const gemByInfusion: Record<string, string> = {
    heavy: "Heavy · Heavy Gem",
    sharp: "Sharp · Sharp Gem",
    refined: "Refined · Refined Gem",
    raw: "Raw · Raw Gem",
    crystal: "Crystal · Crystal Gem",
    simple: "Simple · Simple Gem",
    fire: "Fire · Fire Gem",
    chaos: "Chaos · Chaos Gem",
    lightning: "Lightning · Lightning Gem",
    blessed: "Blessed · Blessed Gem",
    deep: "Deep · Deep Gem",
    dark: "Dark · Dark Gem",
    blood: "Blood · Blood Gem",
    poison: "Poison · Poison Gem",
    hollow: "Hollow · Hollow Gem",
  };
  return gemByInfusion[normalized] ?? value;
}

function SpellMetadataCard({ metadata, locale }: { metadata: SoulsSpellMetadata; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Record<SoulsSpellSchool, string> = {
    sorcery: copy("Feitiçaria", "Sorcery", "Hechicería"),
    pyromancy: copy("Piromancia", "Pyromancy", "Piromancia"),
    miracle: copy("Milagre", "Miracle", "Milagro"),
    unknown: copy("Magia", "Magic", "Magia"),
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-gold-strong" />
        <div>
          <p className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {copy("Escola de magia", "Magic school", "Escuela de magia")}
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground">{labels[metadata.school]}</p>
        </div>
      </div>
      <a
        href={metadata.source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-[0.66rem] font-bold text-gold-strong hover:underline"
      >
        {metadata.source.label}
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

function ItemMetadataCard({ metadata, locale }: { metadata: SoulsItemMetadata; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
          {metadata.category}
        </span>
        <span className="rounded-full border border-gold/20 bg-gold/[0.05] px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-gold-strong">
          {metadata.subcategory}
        </span>
      </div>

      {metadata.skill ? (
        <div className="mt-3">
          <p className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {copy("Skill / habilidade", "Skill", "Skill / habilidad")}
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">{metadata.skill}</p>
        </div>
      ) : null}

      <a
        href={metadata.source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-[0.66rem] font-bold text-gold-strong hover:underline"
      >
        {metadata.source.label}
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

function RingEffectCard({ effect, locale }: { effect: SoulsRingEffect; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
      <div className="flex items-center gap-2">
        <Gem className="size-4 text-gold-strong" />
        <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
          {copy("Efeito técnico", "Technical effect", "Efecto técnico")}
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {effect.effects.map((line, index) => (
          <p key={index} className="text-xs leading-5 text-muted-foreground">
            • {line}
          </p>
        ))}
      </div>
      <a
        href={effect.source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-[0.66rem] font-bold text-gold-strong hover:underline"
      >
        {effect.source.label}
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

function ArmorTechnicalCard({ armor, locale }: { armor: SoulsArmorTechnical; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const slotLabels: Record<SoulsArmorSlot, string> = {
    head: copy("Cabeça", "Head", "Cabeza"),
    chest: copy("Peito", "Chest", "Pecho"),
    arms: copy("Braços", "Arms", "Brazos"),
    legs: copy("Pernas", "Legs", "Piernas"),
    unknown: copy("Peça", "Piece", "Pieza"),
  };

  const defenseRows = (
    [
      [copy("Físico", "Physical", "Físico"), armor.defense.physical],
      [copy("Impacto", "Strike", "Golpe"), armor.defense.strike],
      [copy("Corte", "Slash", "Corte"), armor.defense.slash],
      [copy("Perfuração", "Thrust", "Perforación"), armor.defense.thrust],
      [copy("Magia", "Magic", "Magia"), armor.defense.magic],
      [copy("Fogo", "Fire", "Fuego"), armor.defense.fire],
      [copy("Raio", "Lightning", "Rayo"), armor.defense.lightning],
      ["Dark", armor.defense.dark],
    ] satisfies Array<[string, number | undefined]>
  ).filter((entry): entry is [string, number] => typeof entry[1] === "number");

  const resistanceRows = (
    [
      [copy("Sangramento", "Bleed", "Sangrado"), armor.resistance.bleed],
      [copy("Veneno", "Poison", "Veneno"), armor.resistance.poison],
      [copy("Gelo", "Frost", "Hielo"), armor.resistance.frost],
      [copy("Maldição", "Curse", "Maldición"), armor.resistance.curse],
    ] satisfies Array<[string, number | undefined]>
  ).filter((entry): entry is [string, number] => typeof entry[1] === "number");

  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
            {copy(
              "Características da armadura",
              "Armor characteristics",
              "Características de armadura",
            )}
          </p>
          <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
            {armor.game === "dark-souls-iii"
              ? copy(
                  "Absorções e resistências da peça sem buffs externos.",
                  "Piece absorption and resistances before external buffs.",
                  "Absorciones y resistencias de la pieza antes de buffs externos.",
                )
              : copy(
                  "Defesas da peça no estado base; quando disponível, o reforço final aparece separado.",
                  "Base-state defenses; when available, final reinforcement appears separately.",
                  "Defensas base; cuando está disponible, el refuerzo final aparece por separado.",
                )}
          </p>
        </div>
        <Shield className="size-4 shrink-0 text-gold-strong" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <TechCell label={copy("Slot", "Slot", "Slot")} value={slotLabels[armor.slot]} compact />
        <TechCell label={copy("Peso", "Weight", "Peso")} value={armor.weight} compact />
        <TechCell label="Poise" value={armor.poise} compact />
      </div>

      <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {armor.game === "dark-souls-iii"
          ? copy("Absorção", "Absorption", "Absorción")
          : copy("Defesa base", "Base defense", "Defensa base")}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {defenseRows.map(([label, value]) => (
          <TechCell key={label} label={label} value={value} compact />
        ))}
      </div>

      <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {copy("Resistências", "Resistances", "Resistencias")}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {resistanceRows.map(([label, value]) => (
          <TechCell key={label} label={label} value={value} compact />
        ))}
      </div>

      {armor.maxUpgrade ? (
        <div className="mt-4 rounded-xl border border-border bg-background/45 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.08em] text-foreground">
              {copy("Reforço final", "Final reinforcement", "Refuerzo final")}
            </p>
            <span className="rounded-lg border border-gold/25 bg-gold/10 px-2 py-1 text-[0.6rem] font-black text-gold-strong">
              +{armor.maxUpgrade.level}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <TechCell label="PHY" value={armor.maxUpgrade.defense.physical} compact />
            <TechCell label="MAG" value={armor.maxUpgrade.defense.magic} compact />
            <TechCell label="FIRE" value={armor.maxUpgrade.defense.fire} compact />
            <TechCell label="LIGHT" value={armor.maxUpgrade.defense.lightning} compact />
          </div>
        </div>
      ) : null}

      <a
        href={armor.source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-[0.66rem] font-bold text-gold-strong hover:underline"
      >
        {armor.source.label}
        <ExternalLink className="size-3" />
      </a>
      <p className="mt-1 text-[0.6rem] leading-4 text-muted-foreground">{armor.source.note}</p>
    </div>
  );
}

function TechCell({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-background/45", compact ? "p-2" : "p-2.5")}
    >
      <p className="text-[0.52rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 font-black text-foreground", compact ? "text-xs" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}
