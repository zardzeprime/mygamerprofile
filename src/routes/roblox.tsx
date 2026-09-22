import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import { ROBLOX_EXPERIENCES } from "@/data/robloxExperiences";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export const Route = createFileRoute("/roblox")({
  head: () => ({
    meta: [
      { title: "Roblox Experiences — MGP" },
      {
        name: "description",
        content:
          "Catálogo de experiências Roblox no MGP, com hubs próprios para códigos, tier lists, guias, builds e progressão.",
      },
      { property: "og:title", content: "Roblox Experiences — MGP" },
    ],
  }),
  component: RobloxCatalog,
});

function RobloxCatalog() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ROBLOX_EXPERIENCES;
    return ROBLOX_EXPERIENCES.filter((experience) =>
      [experience.name, experience.category, ...experience.aliases]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [query]);

  return (
    <AdReadyLayout
      className="mx-auto w-full max-w-[92rem] px-4 py-10 sm:px-6 sm:py-16"
      rail={<AdSlot id="roblox-catalog-rail" format="rail" />}
    >
      <div className="flex items-center gap-2">
        <Gamepad2 className="size-4 text-gold-strong" />
        <p className="section-kicker">MGP / ROBLOX EXPERIENCES</p>
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-5xl">
        {copy("Hubs de Roblox", "Roblox hubs", "Hubs de Roblox")}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
        {copy(
          "Aqui cada experiência funciona como um jogo do MGP: Blox Fruits, Project Slayers 2 e os outros têm página própria, hero, abas, conteúdo e navegação própria.",
          "Each experience works like an MGP game here: Blox Fruits, Project Slayers 2 and the others get their own page, hero, tabs, content and navigation.",
          "Aquí cada experiencia funciona como un juego de MGP: Blox Fruits, Project Slayers 2 y las demás tienen página propia, hero, pestañas, contenido y navegación.",
        )}
      </p>

      <div className="mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 focus-within:border-gold/45 focus-within:ring-1 focus-within:ring-gold/15">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy("Buscar experiência", "Search experience", "Buscar experiencia")}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <AdSlot id="roblox-catalog-top" format="leaderboard" className="mt-6" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((experience) => (
          <Link
            key={experience.slug}
            to="/roblox/$slug"
            params={{ slug: experience.slug }}
            className="surface-panel group overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-soft"
          >
            <div className="relative h-52 overflow-hidden border-b border-border">
              <img
                src={experience.visual.coverImage}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/75 backdrop-blur">
                  Roblox Experience
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-white">{experience.name}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/65">
                  {experience.category}
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {experience.summary[locale]}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {experience.focusAreas[locale].slice(0, 4).map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.68rem] font-semibold text-muted-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gold-strong">
                <Sparkles className="size-4" />
                {copy("Abrir hub", "Open hub", "Abrir hub")}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-semibold text-foreground">
            {copy("Nenhuma experiência encontrada", "No experience found", "No se encontró ninguna experiencia")}
          </p>
        </div>
      ) : null}

      <AdSlot id="roblox-catalog-bottom" format="leaderboard" className="mt-8" />
    </AdReadyLayout>
  );
}
