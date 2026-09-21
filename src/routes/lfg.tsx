import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getGames } from "@/lib/games.functions";
import { listLfgPosts, createLfgPost, closeLfgPost } from "@/lib/lfg.functions";
import { useI18n, type TranslationKey } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch"] as const;
const LANGUAGES = ["pt-BR", "en", "es", "fr"] as const;
const STATUSES = ["open", "closed", "expired"] as const;
const ALL_FILTER = "__all__";

const RIOT_EXTERNAL_GAMES = [
  { id: "teamfight-tactics", name: "Teamfight Tactics" },
  { id: "wild-rift", name: "League of Legends: Wild Rift" },
  { id: "legends-of-runeterra", name: "Legends of Runeterra" },
  { id: "2xko", name: "2XKO" },
] as const;

type SteamLfgGame = {
  app_id: number;
  name: string;
  icon_url: string | null;
  playtime_forever: number;
};

type LfgGameOption = {
  key: string;
  name: string;
  source: "catalog" | "steam" | "riot";
  id: string;
};

type LfgStatus = (typeof STATUSES)[number];

export const Route = createFileRoute("/lfg")({
  validateSearch: (search: Record<string, unknown>) => ({
    compose: search["compose"] === true || search["compose"] === "1" || search["compose"] === "true",
    game: typeof search["game"] === "string" ? search["game"] : "",
  }),
  loader: async () => {
    const games = await getGames();
    const posts = await listLfgPosts({ data: { status: "open" } });
    return { games, posts };
  },
  head: () => ({
    meta: [
      { title: "LFG — MGP" },
      { name: "description", content: "Encontre um grupo para jogar no My Gamer Profile." },
    ],
  }),
  component: LfgPage,
});

function LfgPage() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { games, posts: initialPosts } = Route.useLoaderData();
  const search = Route.useSearch();
  const [posts, setPosts] = useState(initialPosts);
  const [filters, setFilters] = useState({
    gameId: "",
    platform: "",
    language: "",
    status: "open" as LfgStatus,
  });
  const [dialogOpen, setDialogOpen] = useState(Boolean(search.compose));
  const [actionError, setActionError] = useState("");
  const [steamGames, setSteamGames] = useState<SteamLfgGame[]>([]);
  const [selectedGameKey, setSelectedGameKey] = useState(search.game || "");
  const [steamLoading, setSteamLoading] = useState(false);

  const doList = useServerFn(listLfgPosts);
  const doCreate = useServerFn(createLfgPost);
  const doClose = useServerFn(closeLfgPost);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setSteamGames([]);
      return;
    }

    setSteamLoading(true);
    void supabase
      .from("steam_games")
      .select("app_id,name,icon_url,playtime_forever")
      .eq("user_id", userId)
      .eq("owned", true)
      .order("playtime_forever", { ascending: false })
      .limit(300)
      .then(({ data, error }: { data: SteamLfgGame[] | null; error: unknown }) => {
        if (!active) return;
        if (error) throw error;
        setSteamGames(data ?? []);
      })
      .catch((error: unknown) => {
        console.warn("[LFG] Could not load connected Steam library.", error);
      })
      .finally(() => {
        if (active) setSteamLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const gameOptions = useMemo<LfgGameOption[]>(() => {
    const catalog = games.map((game) => ({
      key: `catalog:${game.id}`,
      name: game.name,
      source: "catalog" as const,
      id: game.id,
    }));
    const riotNames = new Set(catalog.map((game) => game.name.toLocaleLowerCase()));
    const riot = RIOT_EXTERNAL_GAMES.filter(
      (game) => !riotNames.has(game.name.toLocaleLowerCase()),
    ).map((game) => ({
      key: `riot:${game.id}`,
      name: game.name,
      source: "riot" as const,
      id: game.id,
    }));
    const catalogNames = new Set([...catalog, ...riot].map((game) => game.name.toLocaleLowerCase()));
    const steam = steamGames
      .filter((game) => !catalogNames.has(game.name.toLocaleLowerCase()))
      .map((game) => ({
        key: `steam:${game.app_id}`,
        name: game.name,
        source: "steam" as const,
        id: String(game.app_id),
      }));
    return [...catalog, ...riot, ...steam];
  }, [games, steamGames]);

  useEffect(() => {
    if (selectedGameKey && gameOptions.some((game) => game.key === selectedGameKey)) return;
    if (search.game && gameOptions.some((game) => game.key === search.game)) {
      setSelectedGameKey(search.game);
      return;
    }
    if (!selectedGameKey && gameOptions[0]) setSelectedGameKey(gameOptions[0].key);
  }, [gameOptions, search.game, selectedGameKey]);

  const selectedGame = gameOptions.find((game) => game.key === selectedGameKey) ?? null;
  const maxPartySize = (() => {
    const name = selectedGame?.name.toLocaleLowerCase() ?? "";
    if (name.includes("valorant") || name === "league of legends" || name.includes("wild rift")) return 5;
    if (name.includes("dark souls")) return 4;
    if (name.includes("teamfight tactics")) return 8;
    if (name.includes("legends of runeterra") || name.includes("2xko")) return 2;
    return 8;
  })();
  const partySizes = Array.from({ length: Math.max(1, maxPartySize - 1) }, (_, index) => index + 2);

  const applyFilters = async () => {
    setActionError("");
    try {
      const rows = await doList({ data: filters });
      setPosts(rows);
    } catch {
      setActionError(t("common.error"));
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const slotsTotal = Number(formData.get("slots_total"));
      const game = gameOptions.find((option) => option.key === selectedGameKey);
      if (!game) throw new Error("game_reference_required");
      const post = await doCreate({
        data: {
          game_id: game.source === "catalog" ? game.id : null,
          external_game_source: game.source === "catalog" ? null : game.source,
          external_game_id: game.source === "catalog" ? null : game.id,
          external_game_name: game.source === "catalog" ? null : game.name,
          platform: String(formData.get("platform")),
          region: String(formData.get("region") ?? ""),
          language: String(formData.get("language") ?? ""),
          mode: String(formData.get("mode") ?? ""),
          description: String(formData.get("description") ?? ""),
          mic_required: formData.get("mic_required") === "on",
          slots_total: slotsTotal,
          slots_open: slotsTotal,
        },
      });
      setPosts((previous) => [post, ...previous]);
      setDialogOpen(false);
      form.reset();
    } catch {
      setActionError(t("common.error"));
    }
  };

  const handleClose = async (id: string) => {
    setActionError("");
    try {
      await doClose({ data: { id } });
      setPosts((previous) =>
        previous.map((post) => (post.id === id ? { ...post, status: "closed" } : post)),
      );
    } catch {
      setActionError(t("common.error"));
    }
  };

  const statusLabel = (status: string) =>
    t(`lfg.status.${status}` as TranslationKey);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">MGP / LFG</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{t("lfg.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy(
              "Encontre grupo por jogo, plataforma, região e idioma.",
              "Find a group by game, platform, region and language.",
              "Encuentra un grupo por juego, plataforma, región e idioma.",
            )}
          </p>
        </div>
        {user && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t("lfg.create")}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("lfg.create")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game_ref">{t("lfg.filter.game")}</Label>
                  <Select value={selectedGameKey} onValueChange={setSelectedGameKey} required>
                    <SelectTrigger id="game_ref">
                      <SelectValue placeholder={copy("Escolha um jogo", "Choose a game", "Elige un juego")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {gameOptions.map((game) => (
                        <SelectItem key={game.key} value={game.key}>
                          {game.name}{game.source === "steam" ? " · Steam" : game.source === "riot" ? " · Riot" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {steamLoading ? (
                    <p className="text-[0.68rem] text-muted-foreground">
                      {copy("Carregando sua biblioteca Steam…", "Loading your Steam library…", "Cargando tu biblioteca Steam…")}
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platform">{t("lfg.platform")}</Label>
                    <Select name="platform" required>
                      <SelectTrigger id="platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("lfg.filter.language")}</Label>
                    <Select name="language" required defaultValue={locale}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="region">{t("lfg.region")}</Label>
                    <Input id="region" name="region" maxLength={80} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">{t("lfg.mode")}</Label>
                    <Input id="mode" name="mode" maxLength={80} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slots_total">
                    {copy("Tamanho do grupo", "Group size", "Tamaño del grupo")}
                  </Label>
                  <Select name="slots_total" defaultValue={String(Math.min(4, maxPartySize))} key={selectedGameKey}>
                    <SelectTrigger id="slots_total">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {partySizes.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} {copy("pessoas", "players", "personas")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[0.68rem] leading-5 text-muted-foreground">
                    {copy(
                      "O limite sugerido se adapta ao jogo; jogos Steam genéricos permitem grupos de até 8.",
                      "The suggested limit adapts to the game; generic Steam games allow groups up to 8.",
                      "El límite sugerido se adapta al juego; los juegos genéricos de Steam permiten grupos de hasta 8.",
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch name="mic_required" id="mic_required" />
                  <Label htmlFor="mic_required">{t("lfg.micRequired")}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("lfg.description")}</Label>
                  <Textarea id="description" name="description" required maxLength={1000} />
                </div>
                <Button type="submit" className="w-full">
                  {t("lfg.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <section className="surface-panel mb-7 p-4" aria-label={t("lfg.title")}>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.gameId || ALL_FILTER}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, gameId: value === ALL_FILTER ? "" : value }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("lfg.filter.game")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>{t("common.all")}</SelectItem>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.platform || ALL_FILTER}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, platform: value === ALL_FILTER ? "" : value }))
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("lfg.filter.platform")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>{t("common.all")}</SelectItem>
              {PLATFORMS.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.language || ALL_FILTER}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, language: value === ALL_FILTER ? "" : value }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("lfg.filter.language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>{t("common.all")}</SelectItem>
              {LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((current) => ({ ...current, status: value as LfgStatus }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("lfg.filter.status")} />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={applyFilters}>
            {t("common.search")}
          </Button>
        </div>
      </section>

      {actionError ? <p className="mb-4 text-sm text-destructive">{actionError}</p> : null}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <EmptyState title={t("common.empty")} />
        ) : (
          posts.map((post) => (
            <article key={post.id} className="surface-panel rounded-xl p-4 transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                    <UserAvatar src={post.author?.avatar_url} name={post.author?.display_name} size="md" />
                  </Link>
                  <div>
                    <p className="font-semibold">{post.author?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{post.author?.username} · {post.game?.name ?? post.external_game_name ?? copy("Jogo externo", "External game", "Juego externo")}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.status === "open"
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {statusLabel(post.status)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{post.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-1">{post.platform}</span>
                {post.region && <span className="rounded-md bg-muted px-2 py-1">{post.region}</span>}
                {post.mode && <span className="rounded-md bg-muted px-2 py-1">{post.mode}</span>}
                {post.language && <span className="rounded-md bg-muted px-2 py-1">{post.language}</span>}
                {post.mic_required && <span className="rounded-md bg-muted px-2 py-1">Mic</span>}
                <span className="rounded-md bg-muted px-2 py-1">
                  {post.slots_open}/{post.slots_total} {t("lfg.slots")}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                    {t("lfg.viewProfile")}
                  </Link>
                </Button>
                {user?.id === post.author?.id && post.status === "open" && (
                  <Button variant="destructive" size="sm" onClick={() => void handleClose(post.id)}>
                    {t("lfg.close")}
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
