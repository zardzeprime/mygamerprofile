import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import { GameCard } from "@/components/games/GameCard";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { buildSeo } from "@/lib/seo";

type GenreFilter = "all" | "rpg" | "fps" | "moba" | "sports";

const SORTED_GAMES = [...ACTIVE_GAMES].sort((first, second) =>
  first.name.localeCompare(second.name, "en", { sensitivity: "base" }),
);

export const Route = createFileRoute("/games/")({
  head: () =>
    buildSeo({
      title: "Arquivos — jogos, sistemas e hubs — ÍMPAR",
      description:
        "Explore os Arquivos do ÍMPAR: Warframe, Valorant, League of Legends, Dark Souls e outros hubs com sistemas, conteúdo, guias e ferramentas.",
      path: "/games",
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
    <AdReadyLayout className="impar-shell mx-auto w-full max-w-[92rem] px-4 py-10 sm:px-6 sm:py-16" rail={<AdSlot id="games-catalog-rail" format="rail" />}>
      <p className="impar-kicker">ÍMPAR / ARQUIVOS</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">
        {copy("Arquivos", "Archives", "Archivos")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {copy(
          "O registro de jogos do ÍMPAR. Entre em cada hub para encontrar personagens, itens, mapas, sistemas, conteúdo editorial e os caminhos para o Códice.",
          "ÍMPAR's game archive. Open each hub for characters, items, maps, systems, editorial content and paths into the Codex.",
          "El archivo de juegos de ÍMPAR. Entra en cada hub para encontrar personajes, objetos, mapas, sistemas, contenido editorial y caminos hacia el Códice.",
        )}
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
        {copy(
          "O catálogo ativo hoje foca Dark Souls, Dark Souls III, Warframe, Valorant e League of Legends. Outros registros voltam conforme o conteúdo real fica pronto.",
          "The active catalog currently focuses on Dark Souls, Dark Souls III, Warframe, Valorant and League of Legends. Other entries return as real content becomes ready.",
          "El catálogo activo se centra hoy en Dark Souls, Dark Souls III, Warframe, Valorant y League of Legends. Otros registros volverán cuando su contenido real esté listo.",
        )}
      </p>

      <div className="mt-8 flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-[var(--impar-spectral)]/60 focus-within:ring-1 focus-within:ring-[var(--impar-spectral)]/20">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">{copy("Buscar nos Arquivos", "Search Archives", "Buscar en Archivos")}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy("Buscar jogos", "Search games", "Buscar juegos")}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-muted-foreground" aria-label={copy("Filtros dos Arquivos", "Archive filters", "Filtros de Archivos")}>
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

      <AdSlot id="games-catalog-top" format="leaderboard" className="mt-6" />
      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title={copy("Nenhum registro encontrado.", "No entries found.", "No se encontraron registros.")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((game) => <GameCard key={game.slug} game={game} />)}
          </div>
        )}
      </div>
      <AdSlot id="games-catalog-after-grid" format="leaderboard" className="mt-8" />
    </AdReadyLayout>
  );
}
