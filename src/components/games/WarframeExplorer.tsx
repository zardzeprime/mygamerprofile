import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, PlayCircle, Search, Sparkles, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  WARFRAME_GUIDE_SEEDS,
  WARFRAME_STARTER_ROSTER,
  type WarframeAbility,
} from "@/data/warframeRoster";

export function WarframeExplorer({
  mode,
  locale,
}: {
  mode: "warframes" | "guides";
  locale: Locale;
}) {
  return mode === "warframes" ? (
    <WarframeRoster locale={locale} />
  ) : (
    <WarframeGuides locale={locale} />
  );
}

function WarframeRoster({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(WARFRAME_STARTER_ROSTER[0]?.slug ?? "");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return WARFRAME_STARTER_ROSTER;
    return WARFRAME_STARTER_ROSTER.filter((frame) =>
      [frame.name, frame.primeName ?? "", frame.role[locale]]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [locale, query]);

  const selected =
    WARFRAME_STARTER_ROSTER.find((frame) => frame.slug === selectedSlug) ??
    filtered[0] ??
    WARFRAME_STARTER_ROSTER[0];

  if (!selected) return null;

  return (
    <div className="space-y-5">
      <div className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <span className="section-kicker">MGP / TENNO DATABASE</span>
          </div>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {copy("Enciclopédia de Warframes", "Warframe encyclopedia", "Enciclopedia de Warframes")}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {copy(
                  "Primeira fundação do hub: Warframes, funções, habilidades e espaço preparado para vídeos curtos de cada habilidade.",
                  "First hub foundation: Warframes, roles, abilities and media slots prepared for short ability videos.",
                  "Primera base del hub: Warframes, roles, habilidades y espacios preparados para videos cortos de cada habilidad.",
                )}
              </p>
            </div>
            <label className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-auto border-0 p-0 shadow-none"
                placeholder={copy("Buscar Warframe", "Search Warframe", "Buscar Warframe")}
              />
            </label>
          </div>
        </div>

        <div className="grid min-w-0 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="border-b border-border p-3 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-2 min-[520px]:grid-cols-3 lg:grid-cols-1">
              {filtered.map((frame) => {
                const active = selected.slug === frame.slug;
                return (
                  <button
                    key={frame.slug}
                    type="button"
                    onClick={() => setSelectedSlug(frame.slug)}
                    className={
                      active
                        ? "rounded-xl border border-gold/35 bg-gold/[0.07] p-3 text-left"
                        : "rounded-xl border border-border bg-muted/10 p-3 text-left transition-colors hover:bg-muted/25"
                    }
                  >
                    <span className="block font-display text-base font-semibold text-foreground">
                      {frame.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{frame.role[locale]}</span>
                    {frame.primeName ? (
                      <span className="mt-2 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-gold-strong">
                        {frame.primeName}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                {copy("Nenhum Warframe nesta primeira leva.", "No Warframe in this first batch.", "Ningún Warframe en esta primera tanda.")}
              </p>
            ) : null}
          </aside>

          <article className="min-w-0 p-3.5 min-[420px]:p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-strong">
                  {selected.role[locale]}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-foreground">{selected.name}</h3>
                {selected.primeName ? (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">{selected.primeName}</p>
                ) : null}
              </div>
              <a
                href={selected.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="brand-button-secondary min-h-11 shrink-0 gap-2"
              >
                {copy("Fonte oficial", "Official source", "Fuente oficial")}
                <ExternalLink className="size-4" />
              </a>
            </div>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-muted-foreground">
              {selected.summary[locale]}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 min-[520px]:gap-4">
              {selected.abilities.map((ability) => (
                <AbilityCard key={ability.slot} ability={ability} locale={locale} />
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function AbilityCard({ ability, locale }: { ability: WarframeAbility; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-muted/10 sm:rounded-2xl">
      <AbilityMedia ability={ability} locale={locale} />
      <div className="p-3 min-[520px]:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg border border-gold/25 bg-gold/[0.07] text-xs font-bold text-gold-strong">
            {ability.slot}
          </span>
          <h4 className="min-w-0 text-balance font-display text-sm font-semibold leading-tight text-foreground min-[420px]:text-base sm:text-lg">{ability.name[locale]}</h4>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground min-[520px]:mt-3 min-[520px]:text-sm min-[520px]:leading-6">{ability.description[locale]}</p>
        <p className="mt-2 hidden text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground min-[520px]:block">
          {copy("Resumo editorial MGP", "MGP editorial summary", "Resumen editorial MGP")}
        </p>
      </div>
    </section>
  );
}

function AbilityMedia({ ability, locale }: { ability: WarframeAbility; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const media = ability.media;

  if (media?.videoUrl) {
    return (
      <video
        className="aspect-video w-full bg-black object-cover"
        controls
        playsInline
        preload="metadata"
        poster={media.posterUrl}
      >
        <source src={media.videoUrl} />
      </video>
    );
  }

  if (media?.youtubeId) {
    return (
      <iframe
        className="aspect-video w-full bg-black"
        src={"https://www.youtube-nocookie.com/embed/" + media.youtubeId}
        title={ability.name[locale]}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="grid aspect-[4/3] place-items-center bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.10),transparent_60%),hsl(var(--muted)/0.25)] p-2 text-center min-[520px]:aspect-video min-[520px]:p-4">
      <div>
        <PlayCircle className="mx-auto size-6 text-gold-strong min-[520px]:size-8" />
        <p className="mt-2 text-xs font-semibold text-foreground">
          {copy("Slot de vídeo preparado", "Video slot ready", "Espacio de video preparado")}
        </p>
        <p className="mt-1 hidden max-w-xs text-[0.7rem] leading-5 text-muted-foreground min-[520px]:block">
          {copy(
            "Entrará quando tivermos um clipe próprio ou uma fonte oficial que possa ser incorporada.",
            "It will go live when we have an owned clip or an official source that can be embedded.",
            "Se activará cuando tengamos un clip propio o una fuente oficial que pueda integrarse.",
          )}
        </p>
      </div>
    </div>
  );
}

function WarframeGuides({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-5">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-gold-strong" />
          <span className="section-kicker">MGP / TENNO GUIDES</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
          {copy("Central de guias do Warframe", "Warframe guide center", "Centro de guías de Warframe")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "A estrutura já está no ar para receber guias completos. Nesta primeira versão, deixamos os principais caminhos editoriais definidos para preencher e revisar em sequência.",
            "The structure is live and ready for full guides. This first version defines the main editorial paths to be filled and reviewed next.",
            "La estructura ya está activa y lista para guías completas. Esta primera versión define las principales rutas editoriales para completar y revisar después.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 min-[520px]:gap-4">
        {WARFRAME_GUIDE_SEEDS.map((guide) => (
          <article key={guide.slug} className="surface-panel min-w-0 p-3 min-[520px]:p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 min-[520px]:gap-3">
              <Wrench className="size-5 text-gold-strong" />
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {guide.status === "foundation"
                  ? copy("Fundação pronta", "Foundation ready", "Base lista")
                  : copy("Rascunho", "Draft", "Borrador")}
              </span>
            </div>
            <h3 className="mt-3 text-balance font-display text-base font-semibold leading-tight text-foreground min-[520px]:mt-4 min-[520px]:text-xl">
              {guide.title[locale]}
            </h3>
            <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted-foreground min-[520px]:line-clamp-none min-[520px]:text-sm min-[520px]:leading-6">{guide.description[locale]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
