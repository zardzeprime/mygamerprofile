import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  Coins,
  Eye,
  EyeOff,
  Gift,
  MapPin,
  Search,
  Shield,
  Skull,
  Sparkles,
  Sword,
} from "lucide-react";
import darkSoulsAtmosphere from "@/assets/dark-souls-atmosphere.jpg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";
import { localeCopy, toContentLocale } from "@/i18n/locale-utils";
import { DARK_SOULS_BOSSES, type DarkSoulsBoss } from "@/data/darkSoulsBosses";
import { DARK_SOULS_BOSS_WIKI } from "@/data/darkSoulsBossWiki";
import { getDarkSoulsBossImage } from "@/data/darkSoulsBossImages";

type Filter = "all" | "required" | "optional" | "dlc";

export function DarkSoulsBossWiki({ locale }: { locale: Locale }) {
  const contentLocale = toContentLocale(locale);
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const detailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedSlug, setSelectedSlug] = useState(DARK_SOULS_BOSSES[0]?.slug ?? "");
  const [showSpoilers, setShowSpoilers] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return DARK_SOULS_BOSSES.filter((boss) => {
      if (filter === "required" && boss.requiredStatus !== "required") return false;
      if (filter === "optional" && boss.requiredStatus !== "optional") return false;
      if (filter === "dlc" && !boss.dlc) return false;
      if (!normalized) return true;
      return [boss.name, boss.location[contentLocale], boss.combatType[contentLocale]]
        .join(" ")
        .toLocaleLowerCase(locale)
        .includes(normalized);
    });
  }, [contentLocale, filter, locale, query]);

  const selected =
    DARK_SOULS_BOSSES.find((boss) => boss.slug === selectedSlug) ?? filtered[0] ?? DARK_SOULS_BOSSES[0];
  const selectedImage = getDarkSoulsBossImage(selected?.slug);
  const selectedImageUrl = selectedImage?.url ?? selected?.image_url ?? null;

  const selectBoss = (boss: DarkSoulsBoss) => {
    setSelectedSlug(boss.slug);
    setShowSpoilers(false);

    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="space-y-6">
      <section ref={detailRef} className="surface-panel scroll-mt-24 overflow-hidden">
        <div className="relative isolate overflow-hidden border-b border-border px-5 py-7 sm:px-8">
          <img
            src={darkSoulsAtmosphere}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">
                <BookOpen className="size-4" />
                MGP Wiki · Dark Souls Remastered
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {copy("Enciclopédia de chefes", "Boss encyclopedia", "Enciclopedia de jefes")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {copy(
                  "Todos os chefes do jogo base e de Artorias of the Abyss, com contexto sem spoiler, recompensas, estilo de combate e uma camada opcional de lore aprofundada.",
                  "Every boss from the base game and Artorias of the Abyss, with spoiler-light context, rewards, combat style and an optional deeper-lore layer.",
                  "Todos los jefes del juego base y de Artorias of the Abyss, con contexto sin spoilers, recompensas, estilo de combate y una capa opcional de lore más profundo.",
                )}
              </p>
            </div>
            <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">
                26 {copy("chefes", "bosses", "jefes")}
              </span>
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">4 DLC</span>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <BossDetail boss={selected} locale={locale} showSpoilers={showSpoilers} setShowSpoilers={setShowSpoilers} />
          <aside className="border-t border-border bg-muted/20 p-5 xl:border-l xl:border-t-0 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">{copy("ARTE", "ART", "ARTE")}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedImage
                    ? copy("Imagem de referência disponível", "Reference image available", "Imagen de referencia disponible")
                    : copy("Asset em preparação", "Asset in preparation", "Recurso en preparación")}
                </p>
              </div>
              <Sparkles className="size-5 text-gold-strong" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-background">
              <img
                src={selectedImageUrl ?? darkSoulsAtmosphere}
                alt={selectedImageUrl ? selected?.name ?? "" : ""}
                referrerPolicy="no-referrer"
                className={cn(
                  "h-full w-full object-cover",
                  !selectedImageUrl && "scale-110 opacity-45 blur-[1px]",
                )}
              />
              {!selectedImageUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/40 to-transparent p-6 text-center">
                  <Skull className="size-10 text-gold-strong" />
                  <p className="mt-4 font-display text-2xl font-bold text-foreground">{selected?.name}</p>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    {copy(
                      "A imagem individual ainda não foi adicionada.",
                      "Individual artwork has not been added yet.",
                      "La imagen individual todavía no ha sido añadida.",
                    )}
                  </p>
                </div>
              ) : null}
            </div>
            {selectedImage ? (
              <a
                href={selectedImage.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-xs leading-relaxed text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {selectedImage.sourceLabel[contentLocale]}
              </a>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex w-full max-w-xl items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors focus-within:border-gold/60 focus-within:ring-1 focus-within:ring-gold/20">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy(
                "Buscar chefe, área ou tipo de combate",
                "Search boss, area or combat type",
                "Buscar jefe, zona o tipo de combate",
              )}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", copy("Todos", "All", "Todos")],
              ["required", copy("Obrigatórios", "Required", "Obligatorios")],
              ["optional", copy("Opcionais", "Optional", "Opcionales")],
              ["dlc", "DLC"],
            ] as const).map(([key, label]) => (
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
          {filtered.map((boss) => {
            const wiki = DARK_SOULS_BOSS_WIKI[boss.slug];
            const imageAsset = getDarkSoulsBossImage(boss.slug);
            const imageUrl = imageAsset?.url ?? boss.image_url ?? darkSoulsAtmosphere;
            const hasImage = Boolean(imageAsset || boss.image_url);
            const active = boss.slug === selected?.slug;

            return (
              <button
                key={boss.slug}
                type="button"
                onClick={() => selectBoss(boss)}
                className={cn(
                  "group surface-panel overflow-hidden text-left transition duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lift",
                  active && "border-gold/70 ring-1 ring-gold/20",
                )}
              >
                <div className="relative h-28 overflow-hidden border-b border-border bg-muted">
                  <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className={cn(
                      "h-full w-full object-cover transition duration-300 group-hover:scale-105",
                      hasImage ? "opacity-75 group-hover:opacity-90" : "opacity-40 group-hover:opacity-55",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-strong">#{String(boss.order).padStart(2, "0")}</span>
                    <div className="flex gap-1.5">
                      {boss.dlc ? <Pill>DLC</Pill> : null}
                      <Pill>
                        {boss.requiredStatus === "required"
                          ? copy("Obrigatório", "Required", "Obligatorio")
                          : copy("Opcional", "Optional", "Opcional")}
                      </Pill>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{boss.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {boss.location[contentLocale]}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-gold-strong" />
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {boss.shortSummary[contentLocale]}
                  </p>
                  {wiki ? (
                    <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Coins className="size-3.5 text-gold-strong" />
                      {wiki.souls.toLocaleString(locale)} {copy("almas", "souls", "almas")}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="surface-panel p-8 text-center text-sm text-muted-foreground">
            {copy(
              "Nenhum chefe encontrado com esses filtros.",
              "No bosses found with those filters.",
              "No se encontraron jefes con esos filtros.",
            )}
          </div>
        ) : null}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {copy(
          "Nota editorial: os textos do MGP são resumos originais baseados em fatos do jogo e referências consolidadas. Teorias não confirmadas são identificadas como teoria. Parte das imagens desta versão usa screenshots promocionais e de Prepare to Die Edition catalogados pela Dark Souls Wiki (Fandom), com a página-fonte indicada no painel de arte. Chefes ainda sem imagem continuam com o placeholder do MGP.",
          "Editorial note: MGP copy is original summary text based on in-game facts and established references. Unconfirmed theories are identified as theory. Part of this version uses promotional and Prepare to Die Edition screenshots catalogued by the Dark Souls Wiki (Fandom), with the source file page linked in the art panel. Bosses without an image still use the MGP placeholder.",
          "Nota editorial: los textos de MGP son resúmenes originales basados en hechos del juego y referencias consolidadas. Las teorías no confirmadas se identifican como tales. Parte de las imágenes usa capturas promocionales y de Prepare to Die Edition catalogadas por Dark Souls Wiki (Fandom), con la página fuente enlazada en el panel de arte. Los jefes sin imagen siguen usando el placeholder de MGP.",
        )}
      </p>
    </div>
  );
}

function BossDetail({
  boss,
  locale,
  showSpoilers,
  setShowSpoilers,
}: {
  boss?: DarkSoulsBoss;
  locale: Locale;
  showSpoilers: boolean;
  setShowSpoilers: (value: boolean) => void;
}) {
  if (!boss) return null;
  const contentLocale = toContentLocale(locale);
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const wiki = DARK_SOULS_BOSS_WIKI[boss.slug];

  return (
    <article className="p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{boss.dlc ? "Artorias of the Abyss" : copy("Jogo base", "Base game", "Juego base")}</Pill>
            <Pill>
              {boss.requiredStatus === "required"
                ? copy("Obrigatório", "Required", "Obligatorio")
                : copy("Opcional", "Optional", "Opcional")}
            </Pill>
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">{boss.name}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold-strong" />
            {boss.location[contentLocale]}
          </p>
        </div>
        {wiki ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-right">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {copy("Recompensa NG", "NG reward", "Recompensa NG")}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1.5 font-display text-xl font-bold text-foreground">
              <Coins className="size-4 text-gold-strong" />
              {wiki.souls.toLocaleString(locale)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <InfoCard icon={BookOpen} title={copy("Contexto", "Context", "Contexto")}>
          <p>{wiki?.loreIntro[contentLocale] ?? boss.shortSummary[contentLocale]}</p>
        </InfoCard>
        <InfoCard icon={Sword} title={copy("Como é a luta", "How the fight plays", "Cómo es el combate")}>
          <p>{boss.combatStyle[contentLocale]}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-strong">
            {boss.combatType[contentLocale]}
          </p>
        </InfoCard>
      </div>

      {wiki ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InfoCard icon={Gift} title={copy("Drops notáveis", "Notable drops", "Drops destacados")}>
            <ul className="space-y-2">
              {wiki.drops.map((drop, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{drop[contentLocale]}</span>
                </li>
              ))}
            </ul>
            {wiki.tailCut ? (
              <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-strong">
                  {copy("Corte de cauda / apêndice", "Tail / appendage cut", "Corte de cola / apéndice")}
                </p>
                <p className="mt-1">{wiki.tailCut[contentLocale]}</p>
              </div>
            ) : null}
          </InfoCard>
          <InfoCard icon={Shield} title={copy("Progressão", "Progression", "Progresión")}>
            <p>
              {boss.spoilerContext?.[contentLocale] ??
                copy("Chefe opcional de exploração.", "Optional exploration boss.", "Jefe opcional de exploración.")}
            </p>
            {wiki.notes?.map((note, index) => (
              <p key={index} className="mt-3 text-xs text-muted-foreground">
                {note[contentLocale]}
              </p>
            ))}
          </InfoCard>
        </div>
      ) : null}

      {wiki ? (
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Skull className="size-4 text-gold-strong" />
                {copy("Lore aprofundada", "Deeper lore", "Lore en profundidad")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {copy(
                  "Oculta por padrão para preservar descobertas importantes.",
                  "Hidden by default to preserve important discoveries.",
                  "Oculta por defecto para preservar descubrimientos importantes.",
                )}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSpoilers(!showSpoilers)}>
              {showSpoilers ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
              {showSpoilers
                ? copy("Ocultar spoilers", "Hide spoilers", "Ocultar spoilers")
                : copy("Revelar spoilers", "Reveal spoilers", "Revelar spoilers")}
            </Button>
          </div>
          {showSpoilers ? (
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/90">
              {wiki.spoilerLore[contentLocale]}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof BookOpen; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-muted/20 p-5">
      <h4 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
        <Icon className="size-4 text-gold-strong" />
        {title}
      </h4>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}
