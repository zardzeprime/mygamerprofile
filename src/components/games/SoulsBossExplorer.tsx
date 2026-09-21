import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ExternalLink,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGameConfig } from "@/config/games";
import {
  SOULS_BOSS_COLLECTIONS,
  type SoulsBossKind,
  type SoulsBossResearch,
  type SoulsGameSlug,
} from "@/data/soulsBossResearch";
import { getSoulsBossImage } from "@/data/soulsBossImages";
import {
  DS3_BOSS_DEFENSE_SOURCE,
  getDs3BossDefenseProfile,
  type SoulsDamageChannel,
  type SoulsStatusChannel,
} from "@/data/soulsBossDefenses";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type Filter = "all" | SoulsBossKind;

export function SoulsBossExplorer({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsGameSlug;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const detailRef = useRef<HTMLElement>(null);
  const bosses = SOULS_BOSS_COLLECTIONS[gameSlug];
  const game = getGameConfig(gameSlug);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedSlug, setSelectedSlug] = useState(bosses[0]?.slug ?? "");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return bosses.filter((boss) => {
      if (filter !== "all" && boss.kind !== filter) return false;
      if (!normalized) return true;
      return [boss.name, boss.area, boss.mechanicTags.join(" ")]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(normalized);
    });
  }, [bosses, filter, locale, query]);

  const selected = bosses.find((boss) => boss.slug === selectedSlug) ?? filtered[0] ?? bosses[0];
  const selectedImage = getSoulsBossImage(gameSlug, selected?.slug);
  const selectBoss = (boss: SoulsBossResearch) => {
    setSelectedSlug(boss.slug);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  if (!game || !selected) return null;

  const reviewedCount = bosses.filter((boss) => boss.researchStatus === "reviewed").length;

  return (
    <div className="space-y-6">
      <section ref={detailRef} className="surface-panel scroll-mt-24 overflow-hidden">
        <header className="relative isolate overflow-hidden border-b border-border px-5 py-7 sm:px-8">
          <img
            src={game.visual.heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
            style={{ objectPosition: game.visual.heroObjectPosition }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/55" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker flex items-center gap-2 text-gold-strong">
                <BookOpen className="size-4" />
                {copy("ENCICLOPÉDIA MGP", "MGP ENCYCLOPEDIA", "ENCICLOPEDIA MGP")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {copy(`Chefes de ${game.name}`, `${game.name} bosses`, `Jefes de ${game.name}`)}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {copy(
                  "Uma leitura editorial dos encontros, fases e sistemas de combate. As screenshots próprias do MGP ainda serão produzidas e padronizadas.",
                  "An editorial reading of encounters, phases and combat systems. Original MGP gameplay screenshots are still being produced and standardized.",
                  "Una lectura editorial de encuentros, fases y sistemas de combate. Las capturas propias de MGP aún se están produciendo y estandarizando.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <Pill>
                {bosses.length} {copy("chefes", "bosses", "jefes")}
              </Pill>
              <Pill>
                {reviewedCount} {copy("revisados", "reviewed", "revisados")}
              </Pill>
            </div>
          </div>
        </header>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_22rem]">
          <BossDetail boss={selected} locale={locale} gameSlug={gameSlug} />
          <aside className="border-t border-border bg-muted/15 p-5 xl:border-l xl:border-t-0 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker">
                  {copy("ARTE DO ENCONTRO", "ENCOUNTER ART", "ARTE DEL ENCUENTRO")}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedImage
                    ? copy("Procedência registrada", "Provenance recorded", "Procedencia registrada")
                    : copy("Fallback MGP", "MGP fallback", "Fallback MGP")}
                </p>
              </div>
              <Sparkles className="size-5 text-gold-strong" />
            </div>
            {selectedImage ? (
              <>
                <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-black/25">
                  <img
                    src={selectedImage.url}
                    alt={selected.name}
                    className={cn(
                      "h-full w-full",
                      selectedImage.detailFit === "contain" ? "object-contain p-2" : "object-cover",
                    )}
                    style={{
                      objectPosition: selectedImage.detailObjectPosition,
                      transform: `scale(${selectedImage.detailScale ?? 1})`,
                    }}
                  />
                </div>
                <a
                  href={selectedImage.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[0.68rem] font-bold text-gold-strong hover:underline"
                >
                  {selectedImage.sourceLabel[locale]} <ExternalLink className="size-3" />
                </a>
                <p className="mt-2 text-[0.64rem] leading-5 text-muted-foreground">
                  {copy(
                    "Referência visual usada durante o beta. Dark Souls III e seus assets pertencem aos respectivos detentores de direitos, incluindo FromSoftware/Bandai Namco.",
                    "Visual reference used during beta. Dark Souls III and its assets belong to their respective rights holders, including FromSoftware/Bandai Namco.",
                    "Referencia visual usada durante la beta. Dark Souls III y sus assets pertenecen a sus respectivos titulares, incluyendo FromSoftware/Bandai Namco.",
                  )}
                </p>
              </>
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border border-dashed border-gold/25 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.08),transparent_58%)] p-6 text-center">
                <Swords className="size-10 text-gold-strong" />
                <p className="mt-4 font-display text-2xl font-bold text-foreground">{selected.name}</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section
        className="space-y-4"
        aria-label={copy("Catálogo de chefes", "Boss catalog", "Catálogo de jefes")}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors focus-within:border-gold/60 focus-within:ring-1 focus-within:ring-gold/20">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy(
                "Buscar chefe, área ou mecânica",
                "Search boss, area, or mechanic",
                "Buscar jefe, zona o mecánica",
              )}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", copy("Todos", "All", "Todos")],
                ["story", copy("Progressão", "Progression", "Progresión")],
                ["optional", copy("Opcionais", "Optional", "Opcionales")],
                ["dlc", "DLC"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((boss, index) => {
            const image = getSoulsBossImage(gameSlug, boss.slug);
            const active = boss.slug === selected.slug;
            return (
              <Button
                key={boss.slug}
                type="button"
                variant="ghost"
                onClick={() => selectBoss(boss)}
                aria-pressed={active}
                className={cn(
                  "group h-auto min-h-52 overflow-hidden rounded-lg border border-border bg-surface p-0 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-surface hover:shadow-lift",
                  active && "border-gold/70 ring-1 ring-gold/20",
                )}
              >
                <span className="grid h-full w-full grid-rows-[5.5rem_1fr]">
                  <span className="relative flex items-end overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--gold)/0.08),transparent_65%)] p-4">
                    {image ? (
                      <>
                        <img
                          src={image.url}
                          alt=""
                          loading="lazy"
                          className={cn(
                            "absolute inset-0 h-full w-full opacity-55 transition duration-300 group-hover:scale-105 group-hover:opacity-70",
                            image.cardFit === "contain" ? "object-contain p-1" : "object-cover",
                          )}
                          style={{ objectPosition: image.cardObjectPosition }}
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-transparent" />
                      </>
                    ) : null}
                    <span className="absolute right-4 top-3 grid size-9 place-items-center rounded-full border border-gold/20 bg-background/70 backdrop-blur">
                      <Swords className="size-4 text-gold-strong" />
                    </span>
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gold-strong">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <Pill>{kindLabel(boss.kind, locale)}</Pill>
                    </span>
                  </span>
                  <span className="block p-4">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-bold leading-snug text-foreground">
                          {boss.name}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" /> {boss.area}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-3 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                      {boss.shortContext[locale]}
                    </span>
                    <span className="mt-3 block text-[0.67rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {image
                        ? copy("Arte de referência · fonte registrada", "Reference art · source recorded", "Arte de referencia · fuente registrada")
                        : copy("Arte em revisão", "Artwork in review", "Arte en revisión")}
                    </span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {boss.mechanicTags.slice(0, 3).map((tag) => (
                        <MechanicChip key={tag}>{tag}</MechanicChip>
                      ))}
                    </span>
                  </span>
                </span>
              </Button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="surface-panel p-8 text-center text-sm text-muted-foreground">
            {copy(
              "Nenhum chefe encontrado com esses filtros.",
              "No bosses found with these filters.",
              "No se encontraron jefes con estos filtros.",
            )}
          </div>
        ) : null}
      </section>

      <p className="rounded-lg border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        {copy(
          "Nota editorial: os textos do MG Profile são resumos próprios baseados em fatos do jogo e fontes de pesquisa. Artes externas usadas no beta mantêm procedência visível; capturas próprias ainda poderão substituir essas referências depois.",
          "Editorial note: MG Profile texts are original summaries based on game facts and research sources. External artwork used during beta retains visible provenance; original captures may replace those references later.",
          "Nota editorial: los textos de MG Profile son resúmenes propios basados en hechos del juego y fuentes de investigación. El arte externo usado en beta mantiene procedencia visible; capturas propias podrán sustituir esas referencias después.",
        )}
      </p>
    </div>
  );
}

function BossDetail({
  boss,
  locale,
  gameSlug,
}: {
  boss: SoulsBossResearch;
  locale: Locale;
  gameSlug: SoulsGameSlug;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const defenseProfile =
    gameSlug === "dark-souls-iii" ? getDs3BossDefenseProfile(boss.slug) : null;
  const systemTitle =
    gameSlug === "dark-souls-iii"
      ? copy(
          "Sistemas do combate em Dark Souls III",
          "Dark Souls III combat systems",
          "Sistemas de combate de Dark Souls III",
        )
      : copy(
          "Sistemas do combate em Elden Ring",
          "Elden Ring combat systems",
          "Sistemas de combate de Elden Ring",
        );

  return (
    <article className="p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <Pill>{kindLabel(boss.kind, locale)}</Pill>
            <Pill>
              {boss.researchStatus === "reviewed"
                ? copy("Revisado", "Reviewed", "Revisado")
                : copy("Em revisão", "In review", "En revisión")}
            </Pill>
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
            {boss.name}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold-strong" />
            {boss.area}
          </p>
        </div>
        <a
          href={boss.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {copy("Fonte de pesquisa", "Research source", "Fuente de investigación")}{" "}
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <InfoCard icon={BookOpen} title={copy("Contexto", "Context", "Contexto")}>
          <p>{boss.shortContext[locale]}</p>
        </InfoCard>
        <InfoCard icon={Layers3} title={copy("Fases", "Phases", "Fases")}>
          <p>{boss.phases[locale]}</p>
        </InfoCard>
      </div>

      {defenseProfile ? (
        <section className="mt-4 rounded-lg border border-border bg-muted/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <ShieldCheck className="size-4 text-gold-strong" />
                {copy("Defesas, fraquezas e status", "Defense, weaknesses & status", "Defensas, debilidades y estados")}
              </h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {copy(
                  "Absorção negativa significa vulnerabilidade. Quanto maior a absorção positiva, mais aquele tipo de dano é reduzido.",
                  "Negative absorption means vulnerability. Higher positive absorption means that damage type is reduced more heavily.",
                  "La absorción negativa indica vulnerabilidad. Cuanto mayor la absorción positiva, más se reduce ese tipo de daño.",
                )}
              </p>
            </div>
            <a
              href={DS3_BOSS_DEFENSE_SOURCE.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 text-[0.66rem] font-bold text-gold-strong hover:underline"
            >
              {copy("Tabela técnica", "Technical sheet", "Tabla técnica")}
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="mt-4 space-y-3">
            {defenseProfile.variants.map((variant) => (
              <div key={variant.label} className="rounded-xl border border-border bg-background/45 p-3.5">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-foreground">
                  {variant.label}
                </p>
                {Object.keys(variant.absorption).length ? (
                  <>
                    <p className="mt-3 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                      {copy("Absorção", "Absorption", "Absorción")}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {(Object.entries(variant.absorption) as Array<[SoulsDamageChannel, number]>).map(([channel, value]) => (
                        <div
                          key={channel}
                          className={cn(
                            "rounded-lg border px-2.5 py-2",
                            value < 0
                              ? "border-emerald-500/25 bg-emerald-500/[0.06]"
                              : value >= 60
                                ? "border-red-500/20 bg-red-500/[0.04]"
                                : "border-border bg-muted/10",
                          )}
                        >
                          <p className="text-[0.52rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                            {damageChannelLabel(channel, locale)}
                          </p>
                          <p className={cn("mt-0.5 text-sm font-black", value < 0 ? "text-emerald-300" : "text-foreground")}>
                            {value > 0 ? "+" : ""}{value}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {variant.status && Object.keys(variant.status).length ? (
                  <>
                    <p className="mt-3 text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                      {copy("Status / limiar", "Status / threshold", "Estado / umbral")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(Object.entries(variant.status) as Array<[SoulsStatusChannel, number | "immune"]>).map(([channel, value]) => (
                        <span
                          key={channel}
                          className="rounded-full border border-border bg-muted/10 px-2.5 py-1 text-[0.66rem] font-semibold text-muted-foreground"
                        >
                          {statusChannelLabel(channel, locale)} · {value === "immune"
                            ? copy("Imune", "Immune", "Inmune")
                            : value}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}

                {variant.note ? (
                  <p className="mt-3 text-[0.66rem] leading-5 text-muted-foreground">{variant.note}</p>
                ) : null}
              </div>
            ))}
          </div>

          {defenseProfile.note ? (
            <p className="mt-3 text-[0.66rem] leading-5 text-muted-foreground">{defenseProfile.note}</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4 rounded-lg border border-border bg-muted/20 p-5">
        <h4 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Swords className="size-4 text-gold-strong" />
          {systemTitle}
        </h4>
        <div className="mt-4 flex flex-wrap gap-2">
          {boss.mechanicTags.map((tag) => (
            <MechanicChip key={tag}>{tag}</MechanicChip>
          ))}
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {boss.combatSystems.map((system, index) => (
            <li key={index} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
              <CircleDot className="mt-1.5 size-3.5 shrink-0 text-gold-strong" />
              <span>{system[locale]}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        {boss.researchStatus === "reviewed" ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : (
          <ShieldCheck className="size-4 text-warning" />
        )}
        {boss.researchStatus === "reviewed"
          ? copy(
              "Ficha editorial revisada.",
              "Editorial entry reviewed.",
              "Ficha editorial revisada.",
            )
          : copy(
              "Ficha seed: detalhes adicionais permanecem em revisão.",
              "Seed entry: additional details remain under review.",
              "Ficha seed: los detalles adicionales siguen en revisión.",
            )}
      </div>
    </article>
  );
}

function damageChannelLabel(channel: SoulsDamageChannel, locale: Locale) {
  const labels: Record<SoulsDamageChannel, [string, string, string]> = {
    physical: ["Físico", "Physical", "Físico"],
    strike: ["Impacto", "Strike", "Golpe"],
    slash: ["Corte", "Slash", "Corte"],
    thrust: ["Perfuração", "Thrust", "Perforación"],
    magic: ["Magia", "Magic", "Magia"],
    fire: ["Fogo", "Fire", "Fuego"],
    lightning: ["Raio", "Lightning", "Rayo"],
    dark: ["Dark", "Dark", "Oscuro"],
  };
  return localeCopy(locale, ...labels[channel]);
}

function statusChannelLabel(channel: SoulsStatusChannel, locale: Locale) {
  const labels: Record<SoulsStatusChannel, [string, string, string]> = {
    bleed: ["Sangramento", "Bleed", "Sangrado"],
    poison: ["Veneno", "Poison", "Veneno"],
    frost: ["Gelo", "Frost", "Hielo"],
  };
  return localeCopy(locale, ...labels[channel]);
}

function kindLabel(kind: SoulsBossKind, locale: Locale) {
  if (kind === "dlc") return "DLC";
  if (kind === "optional") return localeCopy(locale, "Opcional", "Optional", "Opcional");
  return localeCopy(locale, "Progressão", "Progression", "Progresión");
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-background/75 px-2.5 py-1 text-[0.65rem] font-bold uppercase text-muted-foreground">
      {children}
    </span>
  );
}

function MechanicChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-gold/25 bg-gold-soft/25 px-2 py-1 text-[0.68rem] font-semibold text-gold-strong">
      {children}
    </span>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-muted/20 p-5">
      <h4 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
        <Icon className="size-4 text-gold-strong" />
        {title}
      </h4>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
