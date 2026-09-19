import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Gamepad2, Loader2, Search, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { searchGamesAndCommunities } from "@/lib/globalSearch";
import { searchPublicProfiles } from "@/lib/profiles.functions";

type PublicProfileSearchResult = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"].slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "Busca — MG Profile" },
      {
        name: "description",
        content: "Busca unificada do MG Profile para jogos, comunidades e perfis.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { q } = Route.useSearch();
  const searchProfiles = useServerFn(searchPublicProfiles);
  const [profiles, setProfiles] = useState<PublicProfileSearchResult[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const local = useMemo(() => searchGamesAndCommunities(q, 20), [q]);
  const query = q.trim();

  useEffect(() => {
    if (query.length < 2) {
      setProfiles([]);
      return;
    }
    let cancelled = false;
    setLoadingProfiles(true);
    void searchProfiles({ data: { query, limit: 12 } })
      .then((result) => {
        if (!cancelled) setProfiles(result);
      })
      .catch((error) => {
        console.warn("[MGP Search] profile search page failed", error);
        if (!cancelled) setProfiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfiles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, searchProfiles]);

  const total = local.games.length + local.communities.length + profiles.length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="section-kicker">MGP / SEARCH</p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        {copy("Busca no MG Profile", "Search MG Profile", "Buscar en MG Profile")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {query
          ? copy(
              `Resultados para “${query}”`,
              `Results for “${query}”`,
              `Resultados para “${query}”`,
            )
          : copy(
              "Digite na barra superior para buscar jogos, comunidades e pessoas.",
              "Use the top search bar to find games, communities and people.",
              "Usa la barra superior para buscar juegos, comunidades y personas.",
            )}
      </p>

      {!query ? null : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <ResultSection
            icon={Gamepad2}
            title={copy("Jogos", "Games", "Juegos")}
            count={local.games.length}
          >
            {local.games.map((game) => (
              <Link
                key={game.slug}
                to="/games/$slug"
                params={{ slug: game.slug }}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-gold/30"
              >
                <img
                  src={game.visual.coverImage}
                  alt=""
                  className="size-12 rounded-lg border border-border object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{game.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{game.genre}</span>
                </span>
              </Link>
            ))}
          </ResultSection>

          <ResultSection
            icon={Users}
            title={copy("Comunidades", "Communities", "Comunidades")}
            count={local.communities.length}
          >
            {local.communities.map((game) => (
              <Link
                key={game.slug}
                to="/communities/$slug"
                params={{ slug: game.slug }}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-gold/30"
              >
                <img
                  src={game.visual.coverImage}
                  alt=""
                  className="size-12 rounded-lg border border-border object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{game.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {copy("Comunidade MGP", "MGP community", "Comunidad MGP")}
                  </span>
                </span>
              </Link>
            ))}
          </ResultSection>

          <ResultSection
            icon={UserRound}
            title={copy("Pessoas", "People", "Personas")}
            count={profiles.length}
            loading={loadingProfiles}
          >
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to="/u/$username"
                params={{ username: profile.username }}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-gold/30"
              >
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-xs font-bold">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    profile.display_name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {profile.display_name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    @{profile.username}
                  </span>
                </span>
              </Link>
            ))}
          </ResultSection>
        </div>
      )}

      {query && total === 0 && !loadingProfiles ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <Search className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 font-semibold">
            {copy("Nada encontrado", "Nothing found", "No se encontró nada")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy(
              "Tente outro nome, username ou jogo.",
              "Try another name, username or game.",
              "Prueba otro nombre, usuario o juego.",
            )}
          </p>
        </div>
      ) : null}
    </main>
  );
}

function ResultSection({
  icon: Icon,
  title,
  count,
  loading = false,
  children,
}: {
  icon: typeof Search;
  title: string;
  count: number;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gold-strong" />
          <h2 className="font-display text-base font-semibold">{title}</h2>
        </div>
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{count}</span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {children}
        {!loading && count === 0 ? (
          <p className="py-5 text-center text-xs text-muted-foreground">—</p>
        ) : null}
      </div>
    </section>
  );
}
