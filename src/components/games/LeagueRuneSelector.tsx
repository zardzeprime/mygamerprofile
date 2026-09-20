import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  createDefaultRunePage,
  LEAGUE_STAT_SHARDS,
  leagueRuneIcon,
  loadLeagueRuneStyles,
  stripLeagueMarkup,
  type LeagueRunePageSelection,
  type LeagueRuneStyle,
} from "@/lib/league-runes";
import { cn } from "@/lib/utils";

export function LeagueRuneSelector({
  version,
  locale,
  value,
  onChange,
}: {
  version: string;
  locale: Locale;
  value: LeagueRunePageSelection | null;
  onChange: (value: LeagueRunePageSelection) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [styles, setStyles] = useState<LeagueRuneStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);

    void loadLeagueRuneStyles(version, locale)
      .then((nextStyles) => {
        if (!active) return;
        setStyles(nextStyles);
        if (!value?.primaryStyleId) onChange(createDefaultRunePage(nextStyles));
      })
      .catch((error) => {
        console.warn("[LeagueRuneSelector] rune data load failed", error);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, version]);

  const selection = value ?? createDefaultRunePage(styles);
  const primary = styles.find((style) => style.id === selection.primaryStyleId) ?? styles[0] ?? null;
  const secondary =
    styles.find((style) => style.id === selection.secondaryStyleId && style.id !== primary?.id) ??
    styles.find((style) => style.id !== primary?.id) ??
    null;

  const secondarySlotByRune = useMemo(() => {
    const map = new Map<number, number>();
    if (!secondary) return map;
    secondary.slots.forEach((slot, slotIndex) => {
      slot.runes.forEach((rune) => map.set(rune.id, slotIndex));
    });
    return map;
  }, [secondary]);

  const choosePrimaryStyle = (style: LeagueRuneStyle) => {
    const nextSecondary =
      secondary?.id !== style.id
        ? secondary
        : styles.find((candidate) => candidate.id !== style.id) ?? null;

    onChange({
      ...selection,
      primaryStyleId: style.id,
      primaryPerkIds: style.slots
        .map((slot) => slot.runes[0]?.id)
        .filter((id): id is number => typeof id === "number"),
      secondaryStyleId: nextSecondary?.id ?? null,
      secondaryPerkIds:
        nextSecondary?.slots
          .slice(1)
          .slice(0, 2)
          .map((slot) => slot.runes[0]?.id)
          .filter((id): id is number => typeof id === "number") ?? [],
    });
  };

  const chooseSecondaryStyle = (style: LeagueRuneStyle) => {
    if (style.id === primary?.id) return;
    onChange({
      ...selection,
      secondaryStyleId: style.id,
      secondaryPerkIds: style.slots
        .slice(1)
        .slice(0, 2)
        .map((slot) => slot.runes[0]?.id)
        .filter((id): id is number => typeof id === "number"),
    });
  };

  const choosePrimaryRune = (slotIndex: number, runeId: number) => {
    if (!primary) return;
    const next = primary.slots
      .map((slot, index) => {
        if (index === slotIndex) return runeId;
        return slot.runes.find((rune) => selection.primaryPerkIds.includes(rune.id))?.id;
      })
      .filter((id): id is number => typeof id === "number");
    onChange({ ...selection, primaryPerkIds: next });
  };

  const chooseSecondaryRune = (slotIndex: number, runeId: number) => {
    if (!secondary || slotIndex === 0) return;
    const current = selection.secondaryPerkIds;
    const sameRuneSelected = current.includes(runeId);
    let next = current.filter((id) => secondarySlotByRune.get(id) !== slotIndex);

    if (!sameRuneSelected) {
      if (next.length >= 2) next = next.slice(1);
      next.push(runeId);
    }

    onChange({ ...selection, secondaryPerkIds: next });
  };

  const chooseShard = (rowIndex: number, key: string) => {
    const next = [...selection.statShards] as [string, string, string];
    next[rowIndex] = key;
    onChange({ ...selection, statShards: next });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-muted/10 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold-strong" />
          {copy("Carregando árvores de runas…", "Loading rune trees…", "Cargando árboles de runas…")}
        </div>
      </div>
    );
  }

  if (loadFailed || !styles.length || !primary || !secondary) {
    return (
      <div className="rounded-2xl border border-border bg-muted/10 p-5 text-sm text-muted-foreground">
        {copy(
          "As runas do Data Dragon não responderam agora. Tente novamente em instantes.",
          "Data Dragon rune data is unavailable right now. Try again shortly.",
          "Los datos de runas de Data Dragon no están disponibles ahora. Inténtalo de nuevo en unos instantes.",
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted/10 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold-strong" />
          <p className="text-sm font-bold text-foreground">
            {copy("Página de runas", "Rune page", "Página de runas")}
          </p>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {copy(
            "Escolha uma árvore primária completa, duas runas de linhas diferentes na secundária e os três fragmentos.",
            "Choose a complete primary tree, two runes from different secondary rows, and all three stat shards.",
            "Elige un árbol primario completo, dos runas de filas diferentes en el secundario y los tres fragmentos.",
          )}
        </p>
      </div>

      <RuneTreeBlock
        title={copy("Árvore primária", "Primary tree", "Árbol primario")}
        styles={styles}
        activeStyle={primary}
        disabledStyleId={null}
        onStyle={choosePrimaryStyle}
      >
        <div className="space-y-4">
          {primary.slots.map((slot, slotIndex) => (
            <RuneSlot
              key={slotIndex}
              label={
                slotIndex === 0
                  ? copy("Runa essencial", "Keystone", "Runa clave")
                  : copy(`Linha ${slotIndex}`, `Row ${slotIndex}`, `Fila ${slotIndex}`)
              }
              runes={slot.runes}
              selectedIds={selection.primaryPerkIds}
              onSelect={(runeId) => choosePrimaryRune(slotIndex, runeId)}
            />
          ))}
        </div>
      </RuneTreeBlock>

      <RuneTreeBlock
        title={copy("Árvore secundária", "Secondary tree", "Árbol secundario")}
        styles={styles}
        activeStyle={secondary}
        disabledStyleId={primary.id}
        onStyle={chooseSecondaryStyle}
      >
        <div className="space-y-4">
          {secondary.slots.slice(1).map((slot, relativeIndex) => {
            const slotIndex = relativeIndex + 1;
            return (
              <RuneSlot
                key={slotIndex}
                label={copy(`Linha ${slotIndex}`, `Row ${slotIndex}`, `Fila ${slotIndex}`)}
                runes={slot.runes}
                selectedIds={selection.secondaryPerkIds}
                onSelect={(runeId) => chooseSecondaryRune(slotIndex, runeId)}
              />
            );
          })}
          <p className="text-[0.68rem] leading-5 text-muted-foreground">
            {selection.secondaryPerkIds.length}/2{" "}
            {copy("runas secundárias escolhidas", "secondary runes selected", "runas secundarias elegidas")}
          </p>
        </div>
      </RuneTreeBlock>

      <div className="rounded-2xl border border-border bg-muted/10 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-gold-strong" />
          <h4 className="text-sm font-bold text-foreground">
            {copy("Fragmentos de atributos", "Stat shards", "Fragmentos de atributos")}
          </h4>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {LEAGUE_STAT_SHARDS.map((row, rowIndex) => (
            <div key={rowIndex} className="rounded-xl border border-border bg-background/50 p-3">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                {copy(`Linha ${rowIndex + 1}`, `Row ${rowIndex + 1}`, `Fila ${rowIndex + 1}`)}
              </p>
              <div className="mt-2 space-y-2">
                {row.map((option) => {
                  const selected = selection.statShards[rowIndex] === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => chooseShard(rowIndex, option.key)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                        selected
                          ? "border-gold/45 bg-gold/10"
                          : "border-border bg-muted/10 hover:border-gold/25",
                      )}
                    >
                      <span className="block text-xs font-bold text-foreground">{option.name[locale]}</span>
                      <span className="mt-0.5 block text-[0.66rem] leading-4 text-muted-foreground">
                        {option.description[locale]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RuneTreeBlock({
  title,
  styles,
  activeStyle,
  disabledStyleId,
  onStyle,
  children,
}: {
  title: string;
  styles: LeagueRuneStyle[];
  activeStyle: LeagueRuneStyle;
  disabledStyleId: number | null;
  onStyle: (style: LeagueRuneStyle) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <div className="flex flex-wrap gap-1.5">
          {styles.map((style) => {
            const selected = style.id === activeStyle.id;
            const disabled = style.id === disabledStyleId;
            return (
              <button
                key={style.id}
                type="button"
                disabled={disabled}
                onClick={() => onStyle(style)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-xl border px-2.5 text-xs font-bold transition-colors",
                  selected
                    ? "border-gold/45 bg-gold/10 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-30",
                )}
              >
                <img src={leagueRuneIcon(style.icon)} alt="" className="size-5 object-contain" />
                {style.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
        <img src={leagueRuneIcon(activeStyle.icon)} alt="" className="size-10 object-contain" />
        <div>
          <p className="text-sm font-bold text-foreground">{activeStyle.name}</p>
          <p className="text-[0.66rem] text-muted-foreground">{activeStyle.key}</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function RuneSlot({
  label,
  runes,
  selectedIds,
  onSelect,
}: {
  label: string;
  runes: LeagueRuneStyle["slots"][number]["runes"];
  selectedIds: number[];
  onSelect: (runeId: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {runes.map((rune) => {
          const selected = selectedIds.includes(rune.id);
          return (
            <button
              key={rune.id}
              type="button"
              onClick={() => onSelect(rune.id)}
              className={cn(
                "flex min-w-0 items-start gap-3 rounded-xl border p-3 text-left transition",
                selected
                  ? "border-gold/50 bg-gold/10"
                  : "border-border bg-background/45 hover:border-gold/25",
              )}
              title={stripLeagueMarkup(rune.longDesc || rune.shortDesc)}
            >
              <img
                src={leagueRuneIcon(rune.icon)}
                alt=""
                className={cn(
                  "size-10 shrink-0 rounded-full object-contain transition",
                  selected ? "ring-2 ring-gold/50" : "opacity-80",
                )}
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-foreground">{rune.name}</span>
                <span className="mt-1 line-clamp-2 block text-[0.66rem] leading-4 text-muted-foreground">
                  {stripLeagueMarkup(rune.shortDesc)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
