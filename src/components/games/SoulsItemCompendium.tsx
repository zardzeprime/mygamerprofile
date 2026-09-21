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
import { cn } from "@/lib/utils";
import {
  loadDs1Weapons,
  loadDs3Weapons,
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
        setSelectedId(data[0]?.id ?? null);
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

  const selected =
    entries.find((entry) => entry.id === selectedId) ?? filtered[0] ?? entries[0] ?? null;
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="surface-panel p-4 sm:p-5">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    className={cn(
                      "min-w-0 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-gold/30",
                      selected?.id === entry.id
                        ? "border-gold/45 bg-gold/10"
                        : "border-border bg-muted/10",
                    )}
                  >
                    <div className="mx-auto grid aspect-square max-w-24 place-items-center overflow-hidden rounded-xl border border-border bg-black/20">
                      <img
                        src={entry.iconUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-2"
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

          {selected ? (
            <aside className="surface-panel self-start overflow-hidden xl:sticky xl:top-24">
              <div className="border-b border-border p-5">
                <div className="mx-auto grid size-36 place-items-center rounded-2xl border border-border bg-black/20">
                  <img src={selected.iconUrl} alt="" className="size-full object-contain p-3" />
                </div>
                <p className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
                  {categoryLabel(selected.category)}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {selected.name}
                </h3>
              </div>

              <div className="space-y-4 p-5">
                {technicalWeapon ? (
                  <WeaponTechnicalCard weapon={technicalWeapon} locale={locale} />
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

                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                    {copy(
                      "Descrição de referência",
                      "Reference description",
                      "Descripción de referencia",
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {selected.description ||
                      copy(
                        "Sem descrição na fonte.",
                        "No source description.",
                        "Sin descripción en la fuente.",
                      )}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3">
                  <p className="text-xs font-bold text-foreground">
                    {copy("Créditos e direitos", "Credits & rights", "Créditos y derechos")}
                  </p>
                  <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
                    {SOULS_COMPENDIUM_SOURCE.rights}
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
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}

function WeaponTechnicalCard({ weapon, locale }: { weapon: SoulsDpsWeapon; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const stats: Array<[SoulsDpsStat, string]> = [
    ["str", "STR"],
    ["dex", "DEX"],
    ["int", "INT"],
    ["fth", "FTH"],
    ["lck", "LCK"],
  ];
  const damage = [
    ["PHY", weapon.baseDamage.physical],
    ["MAG", weapon.baseDamage.magic],
    ["FIRE", weapon.baseDamage.fire],
    ["LIGHT", weapon.baseDamage.lightning],
    ["DARK", weapon.baseDamage.dark],
  ].filter(([, value]) => Number(value) > 0);

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
          label={copy("Upgrade", "Upgrade", "Mejora")}
          value={`+0 → +${weapon.maxUpgrade}`}
        />
        {weapon.infusions?.length ? (
          <TechCell
            label={copy("Infusões", "Infusions", "Infusiones")}
            value={String(weapon.infusions.length)}
          />
        ) : null}
      </div>

      <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {copy("Requisitos", "Requirements", "Requisitos")}
      </p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <TechCell label="STR" value={weapon.requirements.str} compact />
        <TechCell label="DEX" value={weapon.requirements.dex} compact />
        <TechCell label="INT" value={weapon.requirements.int} compact />
        <TechCell label="FTH" value={weapon.requirements.fth} compact />
      </div>

      <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        Scaling
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {stats.map(([stat, label]) => {
          const grade = weapon.scalingLetters?.[stat];
          if (!grade || grade === "-") return null;
          return (
            <span
              key={stat}
              className="rounded-lg border border-border bg-background/50 px-2 py-1 text-[0.66rem] font-black text-foreground"
            >
              {label} · {grade}
            </span>
          );
        })}
      </div>

      {damage.length ? (
        <>
          <p className="mt-4 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {copy("Dano base de referência", "Reference base damage", "Daño base de referencia")}
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

      {weapon.attackTypes?.length ? (
        <p className="mt-3 text-[0.66rem] leading-5 text-muted-foreground">
          <strong className="text-foreground">{copy("Ataques:", "Attacks:", "Ataques:")}</strong>{" "}
          {weapon.attackTypes.join(" · ")}
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
