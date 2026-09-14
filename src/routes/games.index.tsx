import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { GameCard } from "@/components/games/GameCard";
import { GAMES } from "@/config/games";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Catálogo de jogos — MGP" },
      {
        name: "description",
        content: "Jogos suportados pelo MGP: hubs de comunidade, Game Profiles e LFG por jogo.",
      },
      { property: "og:title", content: "Catálogo de jogos — MGP" },
      {
        property: "og:description",
        content: "Jogos suportados pelo MGP: hubs de comunidade, Game Profiles e LFG por jogo.",
      },
    ],
  }),
  component: GamesCatalog,
});

function GamesCatalog() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return GAMES;
    return GAMES.filter(
      (game) =>
        game.name.toLowerCase().includes(term) || game.genre.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold text-foreground">{t("games.title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("games.subtitle")}</p>

      <label className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5">
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

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title={t("games.empty")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
