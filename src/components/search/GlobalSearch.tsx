import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Boxes,
  Gamepad2,
  Loader2,
  Search,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { searchGamesAndCommunities } from "@/lib/globalSearch";
import { searchPublicProfiles } from "@/lib/profiles.functions";
import { cn } from "@/lib/utils";

type PublicProfileResult = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
};

export function GlobalSearch({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const navigate = useNavigate();
  const searchProfiles = useServerFn(searchPublicProfiles);
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<PublicProfileResult[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const localResults = useMemo(() => searchGamesAndCommunities(query, 4), [query]);
  const trimmed = query.trim();
  const hasResults =
    localResults.games.length > 0 ||
    localResults.robloxExperiences.length > 0 ||
    localResults.communities.length > 0 ||
    profiles.length > 0;

  useEffect(() => {
    if (trimmed.length < 2) {
      setProfiles([]);
      setPeopleLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setPeopleLoading(true);
      void searchProfiles({ data: { query: trimmed, limit: 5 } })
        .then((result) => {
          if (!cancelled) setProfiles(result);
        })
        .catch((error) => {
          console.warn("[MGP Search] profile search failed", error);
          if (!cancelled) setProfiles([]);
        })
        .finally(() => {
          if (!cancelled) setPeopleLoading(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchProfiles, trimmed]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const goToAll = () => {
    if (!trimmed) return;
    setOpen(false);
    onNavigate?.();
    void navigate({ to: "/search", search: { q: trimmed } });
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative min-w-0", mobile ? "w-full" : "w-[clamp(10rem,18vw,22rem)]")}
      data-mgp-header-overlay="true"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToAll();
        }}
        className={cn(
          "flex items-center gap-2 border border-border bg-surface/90 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-gold/45 focus-within:bg-surface focus-within:ring-2 focus-within:ring-gold/10",
          mobile
            ? "min-h-11 rounded-[0.95rem_0.95rem_0.4rem_0.95rem] px-3"
            : "h-11 rounded-[0.9rem_0.9rem_0.38rem_0.9rem] px-3",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={copy("Buscar no MGP", "Search MGP", "Buscar en MGP")}
          aria-label={copy("Buscar jogos, comunidades e pessoas", "Search games, communities and people", "Buscar juegos, comunidades y personas")}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setProfiles([]);
              setOpen(false);
            }}
            className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={copy("Limpar busca", "Clear search", "Limpiar búsqueda")}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </form>

      {open && trimmed ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[80] max-h-[min(72vh,34rem)] overflow-y-auto rounded-[1.05rem_1.05rem_0.48rem_1.05rem] border border-border bg-popover/98 p-2 shadow-2xl backdrop-blur-xl">
          {localResults.games.length ? (
            <SearchGroup
              icon={Gamepad2}
              title={copy("Jogos", "Games", "Juegos")}
            >
              {localResults.games.map((game) => (
                <SearchResultLink
                  key={"game-" + game.slug}
                  to="/games/$slug"
                  params={{ slug: game.slug }}
                  image={game.visual.coverImage}
                  title={game.name}
                  subtitle={game.genre}
                  onNavigate={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                />
              ))}
            </SearchGroup>
          ) : null}

          {localResults.robloxExperiences.length ? (
            <SearchGroup
              icon={Boxes}
              title={copy("Roblox Experiences", "Roblox Experiences", "Experiencias Roblox")}
            >
              {localResults.robloxExperiences.map((experience) => (
                <Link
                  key={"roblox-" + experience.slug}
                  to="/roblox/$slug"
                  params={{ slug: experience.slug }}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex min-w-0 items-center gap-3 rounded-[0.8rem_0.8rem_0.32rem_0.8rem] border border-transparent px-2.5 py-2 transition-colors hover:border-gold/20 hover:bg-gold-soft/35"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-[0.7rem_0.7rem_0.28rem_0.7rem] border border-border bg-muted text-gold-strong">
                    <Gamepad2 className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{experience.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{experience.category}</span>
                  </span>
                </Link>
              ))}
            </SearchGroup>
          ) : null}

          {localResults.communities.length ? (
            <SearchGroup
              icon={Users}
              title={copy("Comunidades", "Communities", "Comunidades")}
            >
              {localResults.communities.map((game) => (
                <SearchResultLink
                  key={"community-" + game.slug}
                  to="/communities/$slug"
                  params={{ slug: game.slug }}
                  image={game.visual.coverImage}
                  title={game.name}
                  subtitle={copy("Comunidade MGP", "MGP community", "Comunidad MGP")}
                  onNavigate={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                />
              ))}
            </SearchGroup>
          ) : null}

          {peopleLoading || profiles.length ? (
            <SearchGroup
              icon={UserRound}
              title={copy("Pessoas", "People", "Personas")}
              trailing={peopleLoading ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
            >
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  to="/u/$username"
                  params={{ username: profile.username }}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex min-w-0 items-center gap-3 rounded-[0.8rem_0.8rem_0.32rem_0.8rem] border border-transparent px-2.5 py-2 transition-colors hover:border-gold/20 hover:bg-gold-soft/35"
                >
                  <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-xs font-bold">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      profile.display_name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{profile.display_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{profile.username}</span>
                  </span>
                </Link>
              ))}
              {peopleLoading && profiles.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  {copy("Buscando perfis…", "Searching profiles…", "Buscando perfiles…")}
                </p>
              ) : null}
            </SearchGroup>
          ) : null}

          {!hasResults && !peopleLoading && trimmed.length >= 2 ? (
            <div className="px-3 py-5 text-center">
              <p className="text-sm font-semibold text-foreground">
                {copy("Nada encontrado", "Nothing found", "No se encontró nada")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy(
                  "Tente outro jogo, experiência Roblox, comunidade ou username.",
                  "Try another game, Roblox experience, community or username.",
                  "Prueba otro juego, experiencia Roblox, comunidad o nombre de usuario.",
                )}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={goToAll}
            className="mt-1 flex w-full items-center justify-between rounded-[0.8rem_0.8rem_0.32rem_0.8rem] border border-border bg-muted/20 px-3 py-2.5 text-left text-xs font-semibold text-foreground transition-colors hover:border-gold/30 hover:bg-gold-soft/30"
          >
            <span>{copy("Ver todos os resultados", "View all results", "Ver todos los resultados")}</span>
            <Search className="size-3.5 text-gold-strong" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SearchGroup({
  icon: Icon,
  title,
  trailing,
  children,
}: {
  icon: typeof Search;
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-2 last:mb-0">
      <div className="flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-gold-strong" aria-hidden="true" />
          <h3 className="text-[0.67rem] font-bold uppercase tracking-[0.11em] text-muted-foreground">{title}</h3>
        </div>
        {trailing}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function SearchResultLink({
  to,
  params,
  image,
  title,
  subtitle,
  onNavigate,
}: {
  to: "/games/$slug" | "/communities/$slug";
  params: { slug: string };
  image: string;
  title: string;
  subtitle: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      params={params}
      onClick={onNavigate}
      className="flex min-w-0 items-center gap-3 rounded-[0.8rem_0.8rem_0.32rem_0.8rem] border border-transparent px-2.5 py-2 transition-colors hover:border-gold/20 hover:bg-gold-soft/35"
    >
      <span className="size-10 shrink-0 overflow-hidden rounded-[0.7rem_0.7rem_0.28rem_0.7rem] border border-border bg-muted">
        <img src={image} alt="" className="size-full object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  );
}
