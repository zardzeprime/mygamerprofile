import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { GameCard } from "@/components/games/GameCard";
import { GAMES } from "@/config/games";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type GenreFilter = "all" | "rpg" | "fps" | "moba" | "sports";

const SORTED_GAMES = [...GAMES].sort((first, second) =>
  first.name.localeCompare(second.name, "en", { sensitivity: "base" }),
);

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Catálogo de jogos — MGP" },
      {
        name: "description",
        content: "Catálogo editorial de jogos do MGP com informações, guias, builds e coleções por título.",
      },
      { property: "og:title", content: "Catálogo de jogos — MGP" },
      {
        property: "og:description",
        content: "Catálogo editorial de jogos do MGP com informações, guias, builds e coleções por título.",
      },
    ],
  }),
  component: GamesCatalog,
});

function GamesCatalog() {
  const { locale, t } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("all");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return SORTED_GAMES.filter((game) => {
      const aliases = game.aliases?.join(" ").toLowerCase() ?? "";
      const matchesQuery =
        !term ||
        game.name.toLowerCase().includes(term) ||
        game.genre.toLowerCase().includes(term) ||
        aliases.includes(term);
      const normalizedGenre = game.genre.toLowerCase();
      const matchesGenre =
        genreFilter === "all" ||
        (genreFilter === "rpg" && normalizedGenre.includes("rpg")) ||
        (genreFilter === "fps" && normalizedGenre.includes("fps")) ||
        (genreFilter === "moba" && normalizedGenre.includes("moba")) ||
        (genreFilter === "sports" && normalizedGenre.includes("sports"));
      return matchesQuery && matchesGenre;
    });
  }, [genreFilter, query]);

  const filters: { value: GenreFilter; label: string }[] = [
    { value: "all", label: t("common.all") },
    { value: "rpg", label: "RPG" },
    { value: "fps", label: "FPS" },
    { value: "moba", label: "MOBA" },
    { value: "sports", label: copy("Esportes", "Sports", "Deportes") },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="section-kicker">MGP / LIBRARY</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">{t("games.title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("games.subtitle")}</p>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
        {copy(
          "Jogos é a biblioteca editorial do MGP. Conversas e atividade social ficam no catálogo separado de Comunidades.",
          "Games is MGP's editorial library. Conversations and social activity live in the separate Communities catalog.",
          "Juegos es la biblioteca editorial de MGP. Las conversaciones y la actividad social viven en el catálogo separado de Comunidades.",
        )}
      </p>

      <div className="mt-8 flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-gold/60 focus-within:ring-1 focus-within:ring-gold/20">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">{t("games.search")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("games.search")}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-muted-foreground" aria-label={t("games.title")}>
          {filters.map((filter) => {
            const selected = genreFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setGenreFilter(filter.value)}
                className={cn(selected ? "catalog-filter-active" : "catalog-filter")}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title={t("games.empty")} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
