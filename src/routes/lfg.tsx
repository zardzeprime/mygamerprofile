import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LfgMatchCenter } from "@/components/lfg/LfgMatchCenter";
import { getGameConfig } from "@/config/games";
import { getGames } from "@/lib/games.functions";
import {
  closeLfgPost,
  createLfgPost,
  getLfgVerificationStatus,
  listLfgPosts,
  requestLfgMatch,
} from "@/lib/lfg.functions";
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
  slug: string | null;
  imageUrl: string | null;
};

type LfgVerification = {
  verified: boolean;
  age: number | null;
  provider: string | null;
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
  const [verification, setVerification] = useState<LfgVerification | null>(null);
  const [requestedPostIds, setRequestedPostIds] = useState<Set<string>>(new Set());
  const [matchRefreshToken, setMatchRefreshToken] = useState(0);

  const doList = useServerFn(listLfgPosts);
  const doCreate = useServerFn(createLfgPost);
  const doClose = useServerFn(closeLfgPost);
  const doVerification = useServerFn(getLfgVerificationStatus);
  const doRequestMatch = useServerFn(requestLfgMatch);

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

  useEffect(() => {
    let active = true;
    if (!userId) {
      setVerification(null);
      return;
    }

    void doVerification()
      .then((result) => {
        if (active) setVerification(result);
      })
      .catch((error) => {
        console.warn("[LFG] Could not read verification state.", error);
        if (active) setVerification({ verified: false, age: null, provider: null });
      });

    return () => {
      active = false;
    };
  }, [doVerification, userId]);

  const gameOptions = useMemo<LfgGameOption[]>(() => {
    const catalog = games.map((game) => {
      const config = getGameConfig(game.slug);
      return {
        key: `catalog:${game.id}`,
        name: game.name,
        source: "catalog" as const,
        id: game.id,
        slug: game.slug,
        imageUrl: config?.visual.coverImage ?? null,
      };
    });
    const riotNames = new Set(catalog.map((game) => game.name.toLocaleLowerCase()));
    const riot = RIOT_EXTERNAL_GAMES.filter(
      (game) => !riotNames.has(game.name.toLocaleLowerCase()),
    ).map((game) => ({
      key: `riot:${game.id}`,
      name: game.name,
      source: "riot" as const,
      id: game.id,
      slug: null,
      imageUrl: null,
    }));
    const catalogNames = new Set([...catalog, ...riot].map((game) => game.name.toLocaleLowerCase()));
    const steam = steamGames
      .filter((game) => !catalogNames.has(game.name.toLocaleLowerCase()))
      .map((game) => ({
        key: `steam:${game.app_id}`,
        name: game.name,
        source: "steam" as const,
        id: String(game.app_id),
        slug: null,
        imageUrl: game.icon_url,
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
          external_game_image_url: game.source === "catalog" ? null : game.imageUrl,
          title: String(formData.get("title") ?? ""),
          platform: String(formData.get("platform")),
          region: String(formData.get("region") ?? ""),
          language: String(formData.get("language") ?? ""),
          mode: String(formData.get("mode") ?? ""),
          description: String(formData.get("description") ?? ""),
          mic_required: formData.get("mic_required") === "on",
          slots_total: slotsTotal,
          scheduled_for: String(formData.get("scheduled_for") ?? "").trim()
            ? new Date(String(formData.get("scheduled_for"))).toISOString()
            : null,
          min_age: Number(formData.get("min_age") ?? 13),
          max_age: Number(formData.get("max_age") ?? 99),
        },
      });
      setPosts((previous) => [post, ...previous]);
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      setActionError(lfgErrorMessage(error, locale));
    }
  };

  const handleRequestMatch = async (postId: string) => {
    setActionError("");
    try {
      await doRequestMatch({ data: { postId } });
      setRequestedPostIds((current) => new Set([...current, postId]));
      setMatchRefreshToken((value) => value + 1);
    } catch (error) {
      setActionError(lfgErrorMessage(error, locale));
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
              "Encontre grupos por jogo, região, idioma, horário e faixa etária. O match libera uma DM de texto entre os perfis.",
              "Find groups by game, region, language, schedule and age range. A match unlocks text DMs between profiles.",
              "Encuentra grupos por juego, región, idioma, horario y rango de edad. El match habilita mensajes directos de texto entre perfiles.",
            )}
          </p>
        </div>
        {user ? (
          verification?.verified ? (
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
                  <Label htmlFor="title">{copy("Título do grupo", "Group title", "Título del grupo")}</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    minLength={3}
                    maxLength={120}
                    placeholder={copy("Ex.: Ranked às 21h", "E.g. Ranked at 9 PM", "Ej.: Ranked a las 21h")}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="scheduled_for">
                    {copy("Quando pretende jogar", "When you plan to play", "Cuándo planean jugar")}
                  </Label>
                  <Input id="scheduled_for" name="scheduled_for" type="datetime-local" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_age">{copy("Idade mínima", "Minimum age", "Edad mínima")}</Label>
                    <Input id="min_age" name="min_age" type="number" min={13} max={99} defaultValue={13} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_age">{copy("Idade máxima", "Maximum age", "Edad máxima")}</Label>
                    <Input id="max_age" name="max_age" type="number" min={13} max={99} defaultValue={99} required />
                  </div>
                </div>
                <p className="text-[0.68rem] leading-5 text-muted-foreground">
                  {copy(
                    "O match só é permitido quando a idade verificada do participante estiver dentro desta faixa.",
                    "A match is only allowed when the participant's verified age falls inside this range.",
                    "El match solo se permite cuando la edad verificada del participante está dentro de este rango.",
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Switch name="mic_required" id="mic_required" />
                  <Label htmlFor="mic_required">{t("lfg.micRequired")}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("lfg.description")}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    maxLength={1000}
                    placeholder={copy(
                      "Descreva objetivo, horário, estilo de jogo e o que espera do grupo.",
                      "Describe the goal, schedule, play style and what you expect from the group.",
                      "Describe el objetivo, horario, estilo de juego y qué esperas del grupo.",
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("lfg.create")}
                </Button>
              </form>
            </DialogContent>
            </Dialog>
          ) : (
            <Button asChild variant="outline">
              <Link to="/settings/connections">
                {copy("Verificar idade para criar grupo", "Verify age to create a group", "Verificar edad para crear un grupo")}
              </Link>
            </Button>
          )
        ) : null}
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
          posts.map((post) => {
            const gameConfig = post.game?.slug ? getGameConfig(post.game.slug) : undefined;
            const cover = post.external_game_image_url ?? gameConfig?.visual.coverImage ?? null;
            const gameName =
              post.game?.name ??
              post.external_game_name ??
              copy("Jogo externo", "External game", "Juego externo");
            const isOwner = user?.id === post.author?.id;
            const requested = requestedPostIds.has(post.id);

            return (
              <article
                key={post.id}
                className="surface-panel overflow-hidden rounded-xl transition-shadow hover:shadow-lift"
              >
                <div className="grid sm:grid-cols-[7.25rem_minmax(0,1fr)]">
                  <div className="relative min-h-36 bg-muted sm:min-h-full">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.18),transparent_65%)] px-3 text-center text-xs font-bold text-muted-foreground">
                        {gameName}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent sm:bg-gradient-to-r" />
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gold-strong">
                          {gameName}
                        </p>
                        <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                          {post.title ?? copy("Grupo de ", "Group by ", "Grupo de ")}
                          {!post.title ? post.author?.display_name : ""}
                        </h2>
                        <div className="mt-2 flex items-center gap-2">
                          <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                            <UserAvatar
                              src={post.author?.avatar_url}
                              name={post.author?.display_name}
                              size="sm"
                            />
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {copy("Grupo de ", "Group by ", "Grupo de ")}
                            <span className="font-semibold text-foreground">
                              {post.author?.display_name}
                            </span>
                            {post.author?.username ? ` · @${post.author.username}` : ""}
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

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-1">{post.platform}</span>
                      {post.region ? <span className="rounded-md bg-muted px-2 py-1">{post.region}</span> : null}
                      {post.mode ? <span className="rounded-md bg-muted px-2 py-1">{post.mode}</span> : null}
                      {post.language ? <span className="rounded-md bg-muted px-2 py-1">{post.language}</span> : null}
                      {post.mic_required ? <span className="rounded-md bg-muted px-2 py-1">Mic</span> : null}
                      <span className="rounded-md bg-muted px-2 py-1">
                        {post.slots_open}/{Math.max(0, post.slots_total - 1)} {copy("vagas", "spots", "plazas")}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-1">
                        {post.min_age}–{post.max_age} {copy("anos", "years", "años")}
                      </span>
                      {post.scheduled_for ? (
                        <span className="rounded-md bg-muted px-2 py-1">
                          {new Date(post.scheduled_for).toLocaleString(locale, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                          {t("lfg.viewProfile")}
                        </Link>
                      </Button>

                      {!isOwner && user && post.status === "open" && post.slots_open > 0 ? (
                        verification?.verified ? (
                          <Button
                            size="sm"
                            disabled={requested}
                            onClick={() => void handleRequestMatch(post.id)}
                          >
                            {requested
                              ? copy("Pedido enviado", "Request sent", "Solicitud enviada")
                              : copy("Pedir match", "Request match", "Pedir match")}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/settings/connections">
                              {copy("Verificar para dar match", "Verify to match", "Verificar para hacer match")}
                            </Link>
                          </Button>
                        )
                      ) : null}

                      {isOwner && post.status === "open" ? (
                        <Button variant="destructive" size="sm" onClick={() => void handleClose(post.id)}>
                          {t("lfg.close")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {user ? (
        <LfgMatchCenter
          userId={user.id}
          verified={verification?.verified ?? false}
          refreshToken={matchRefreshToken}
        />
      ) : null}
    </main>
  );
}


function lfgErrorMessage(error: unknown, locale: "pt-BR" | "en" | "es") {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("LFG_VERIFICATION_REQUIRED")) {
    return localeCopy(
      locale,
      "Você precisa verificar sua idade antes de usar o sistema de match.",
      "You need to verify your age before using matchmaking.",
      "Debes verificar tu edad antes de usar el sistema de match.",
    );
  }
  if (message.includes("LFG_AGE_MISMATCH")) {
    return localeCopy(
      locale,
      "Sua idade verificada não está dentro da faixa definida por esse grupo.",
      "Your verified age is outside this group's age range.",
      "Tu edad verificada está fuera del rango definido por este grupo.",
    );
  }
  if (message.includes("LFG_MATCH_ALREADY_REQUESTED")) {
    return localeCopy(
      locale,
      "Você já pediu match nesse grupo.",
      "You already requested a match with this group.",
      "Ya pediste match en este grupo.",
    );
  }
  if (message.includes("LFG_GROUP_UNAVAILABLE")) {
    return localeCopy(
      locale,
      "Esse grupo não tem mais vagas ou já foi fechado.",
      "This group has no open spots or has been closed.",
      "Este grupo ya no tiene plazas o fue cerrado.",
    );
  }
  return localeCopy(
    locale,
    "Não foi possível concluir a ação agora.",
    "Could not complete this action right now.",
    "No se pudo completar esta acción ahora.",
  );
}
