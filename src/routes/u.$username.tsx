import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  CalendarDays,
  Edit3,
  Gamepad2,
  History,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";
import {
  followUser,
  getProfileByUsername,
  isFollowing,
  unfollowUser,
} from "@/lib/profiles.functions";
import { listPosts } from "@/lib/posts.functions";
import { getPublicGameProfilesByUserId } from "@/lib/games.functions";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { GameProfileCard } from "@/components/games/GameProfileCard";
import { PostCard } from "@/components/posts/PostCard";
import { ReportDialog } from "@/components/common/ReportDialog";
import { PublicProfileIdentity } from "@/components/profile/PublicProfileIdentity";
import { SteamProfileShowcase } from "@/components/profile/SteamProfileShowcase";
import { SteamFavoriteGameHighlight } from "@/components/profile/SteamFavoriteGameHighlight";
import { GAMES } from "@/config/games";
import { getProfileBackground } from "@/config/profileBackgrounds";
import { cn } from "@/lib/utils";
import { getPublicSteamShowcase, type PublicSteamShowcase } from "@/lib/steamSync.functions";
import { getPublicProfileLoadout } from "@/lib/profileIdentity.functions";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await getProfileByUsername({ data: { username: params.username } });
    if (!profile) throw notFound();

    const [posts, gameProfiles, steamShowcase, identityLoadout] = await Promise.all([
      listPosts({ data: { authorId: profile.id } }).catch((error) => {
        console.warn("[Profile] Could not load posts; rendering profile without activity.", error);
        return [];
      }),
      getPublicGameProfilesByUserId({ data: { userId: profile.id } }).catch((error) => {
        console.warn("[Profile] Could not load game profiles; rendering profile without game cards.", error);
        return [];
      }),
      getPublicSteamShowcase({ data: { userId: profile.id } }).catch((error) => {
        console.warn("[Profile] Could not load Steam showcase.", error);
        return null;
      }),
      getPublicProfileLoadout({ data: { userId: profile.id } }).catch((error) => {
        console.warn("[Profile] Could not load public identity loadout.", error);
        return null;
      }),

    ]);

    return { profile, posts, gameProfiles, steamShowcase, identityLoadout };
  },
  notFoundComponent: ProfileNotFound,
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — MG Profile` },
      { name: "description", content: `Perfil de @${params.username} no MG Profile.` },
    ],
  }),
  component: ProfilePage,
});

function ProfileNotFound() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
      <EmptyState
        title={copy("Perfil não encontrado", "Profile not found", "Perfil no encontrado")}
        description={copy(
          "Esse username não existe ou o perfil não está público.",
          "This username does not exist or the profile is not public.",
          "Este nombre de usuario no existe o el perfil no es público.",
        )}
      />
    </div>
  );
}

function ProfilePage() {
  const { locale, t } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { profile, posts, gameProfiles, steamShowcase, identityLoadout } = Route.useLoaderData();
  const gameHighlight = steamShowcase?.favoriteGame ?? null;
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followerCount, setFollowerCount] = useState<number>(profile.followers ?? 0);
  const [followBusy, setFollowBusy] = useState(false);

  const checkFollow = useServerFn(isFollowing);
  const doFollow = useServerFn(followUser);
  const doUnfollow = useServerFn(unfollowUser);
  const background = getProfileBackground(profile.profile_background);

  const favoriteGames = useMemo(
    () =>
      gameProfiles
        .filter((gameProfile) => gameProfile.profile_data?.["favorite"] === true)
        .map((gameProfile) => GAMES.find((game) => game.slug === gameProfile.game_slug))
        .filter((game): game is NonNullable<typeof game> => Boolean(game)),
    [gameProfiles],
  );

  useEffect(() => {
    if (!user || isOwn) return;
    checkFollow({ data: { following_id: profile.id } })
      .then((result) => setFollowing(result.following))
      .catch(() => setFollowing(false));
  }, [checkFollow, isOwn, profile.id, user]);

  const handleFollow = async () => {
    if (!user || isOwn || followBusy) return;
    setFollowBusy(true);
    try {
      if (following) {
        await doUnfollow({ data: { following_id: profile.id } });
        setFollowing(false);
        setFollowerCount((count) => Math.max(0, count - 1));
      } else {
        await doFollow({ data: { following_id: profile.id } });
        setFollowing(true);
        setFollowerCount((count) => count + 1);
      }
    } finally {
      setFollowBusy(false);
    }
  };

  const joinedAt = new Intl.DateTimeFormat(
    locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { month: "long", year: "numeric" },
  ).format(new Date(profile.created_at));

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-clip px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <section
        className={cn(
          "mgp-identity-surface relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
          identityLoadout?.cursor?.cssClass,
        )}
      >
        {identityLoadout?.effect?.cssClass ? (
          <div className={cn("mgp-profile-effect-layer", identityLoadout.effect.cssClass)} />
        ) : null}
        <div
          className={cn(
            "profile-hero relative min-h-52 overflow-hidden sm:min-h-72 lg:min-h-80",
            identityLoadout?.background?.cssClass || background.className,
          )}
        >
          {identityLoadout?.banner?.cssClass ? (
            <div className={identityLoadout.banner.cssClass} />
          ) : null}
          <div className="absolute inset-0 profile-hero-scrim" />
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur sm:left-6 sm:top-6">
            MG Profile
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <div className={cn("shrink-0", identityLoadout?.avatarFrame?.cssClass)}>
              <UserAvatar
                src={profile.avatar_url}
                name={profile.display_name}
                size="lg"
                className="border-4 border-surface shadow-lift"
              />
            </div>
            <div className="min-w-0 flex-1 sm:pb-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1
                  className={cn(
                    "min-w-0 truncate font-display text-2xl font-bold sm:text-3xl",
                    identityLoadout?.nameplate?.cssClass,
                  )}
                >
                  {profile.display_name}
                </h1>
                {isOwn ? <ShieldCheck className="size-5 shrink-0 text-gold-strong" aria-label={copy("Seu perfil", "Your profile", "Tu perfil")} /> : null}
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">@{profile.username}</p>
              {identityLoadout?.title ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "mgp-rarity-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]",
                      `mgp-rarity-${identityLoadout.title.rarity}`,
                    )}
                    title={identityLoadout.title.description?.[locale] ?? identityLoadout.title.description?.["pt-BR"] ?? ""}
                  >
                    <Award className="size-3.5" aria-hidden="true" />
                    {identityLoadout.title.name?.[locale] ?? identityLoadout.title.name?.["pt-BR"] ?? identityLoadout.title.slug}
                  </span>
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{copy("Entrou em", "Joined", "Se unió en")} {joinedAt}</span>
                <span>{followerCount} {t("profile.followers")}</span>
                <span>{profile.following ?? 0} {t("profile.following")}</span>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {isOwn ? (
                <Button asChild variant="outline" className="flex-1 sm:flex-none">
                  <Link to="/settings/profile"><Edit3 className="mr-2 size-4" />{t("profile.editProfile")}</Link>
                </Button>
              ) : null}
              {isOwn ? (
                <Button asChild className="flex-1 sm:flex-none">
                  <a
                    href={`/lfg?compose=1${gameHighlight ? `&game=steam:${gameHighlight.appId}` : ""}`}
                  >
                    <Gamepad2 className="mr-2 size-4" />
                    {copy("Procurando por grupo", "Looking for group", "Buscando grupo")}
                  </a>
                </Button>
              ) : null}
              {!isOwn && user ? (
                <Button onClick={handleFollow} disabled={followBusy} variant={following ? "outline" : "default"} className="flex-1 sm:flex-none">
                  <UserRoundPlus className="mr-2 size-4" />
                  {following ? t("profile.unfollow") : t("profile.follow")}
                </Button>
              ) : null}
              {!isOwn && user ? <ReportDialog targetType="profile" targetId={profile.id} username={profile.username} /> : null}
            </div>
          </div>

          <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {profile.bio || t("profile.noBio")}
          </p>
          <PublicProfileIdentity userId={profile.id} locale={locale} />
        </div>
      </section>

      {steamShowcase ? (
        <div className="mt-5">
          <SteamProfileShowcase steam={steamShowcase} locale={locale} />
        </div>
      ) : null}

      {gameHighlight ? (
        <div className="mt-5">
          <SteamFavoriteGameHighlight highlight={gameHighlight} locale={locale} />
        </div>
      ) : null}

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        <section className="min-w-0 space-y-5">
          {favoriteGames.length > 0 ? (
            <div className="surface-panel p-4 sm:p-5">
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-gold-strong" /><h2 className="font-display text-base font-semibold">{copy("Jogos favoritos", "Favorite games", "Juegos favoritos")}</h2></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {favoriteGames.map((game) => (
                  <Link
                    key={game.slug}
                    to="/games/$slug"
                    params={{ slug: game.slug }}
                    className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-gold/35 hover:text-gold-strong"
                  >
                    {game.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <Tabs defaultValue="posts" className="min-w-0">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/45 p-1">
              <TabsTrigger value="posts" className="shrink-0">{t("profile.posts")}</TabsTrigger>
              <TabsTrigger value="games" className="shrink-0">{t("profile.gameProfiles")}</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 min-w-0 space-y-4">
              {posts.length === 0 ? <EmptyState title={t("home.activity.empty")} /> : posts.map((post) => <PostCard key={post.id} post={post} />)}
            </TabsContent>
            <TabsContent value="games" className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
              {gameProfiles.length === 0 ? (
                <div className="md:col-span-2">
                  {isOwn ? (
                    <EmptyState
                      title={copy("Nenhum Game Profile configurado", "No Game Profile configured", "Ningún Game Profile configurado")}
                      description={copy(
                        "Escolha seus jogos favoritos nas configurações e complete cada perfil de jogo.",
                        "Choose your favorite games in settings and complete each Game Profile.",
                        "Elige tus juegos favoritos en la configuración y completa cada Game Profile.",
                      )}
                      action={
                        <Button asChild size="sm">
                          <Link to="/settings/profile">{t("profile.editProfile")}</Link>
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState title={t("common.empty")} />
                  )}
                </div>
              ) : (
                gameProfiles.map((gameProfile) => <GameProfileCard key={gameProfile.game_id} gameProfile={gameProfile} username={profile.username} />)
              )}
            </TabsContent>
          </Tabs>
        </section>

        <aside className="grid min-w-0 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:self-start">
          <SteamIdentityCard steam={steamShowcase} locale={locale} gameProfileCount={gameProfiles.length} />
          <SteamAchievementsCard steam={steamShowcase} locale={locale} />
          <SteamActivityCard steam={steamShowcase} locale={locale} postCount={posts.length} />
        </aside>
      </div>
    </main>
  );
}

function SteamIdentityCard({
  steam,
  locale,
  gameProfileCount,
}: {
  steam: PublicSteamShowcase | null;
  locale: "pt-BR" | "en" | "es";
  gameProfileCount: number;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const libraryShared =
    steam?.showLibrary ??
    Boolean(steam && (steam.libraryGameCount !== null || steam.games.length > 0));
  const badgesShared =
    steam?.showBadges ??
    Boolean(steam && (steam.steamLevel !== null || steam.badgeCount !== null));
  const hiddenValue = copy("Oculto", "Hidden", "Oculto");

  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2">
        <Gamepad2 className="size-4 text-gold-strong" />
        <h3 className="text-sm font-semibold">
          {copy("Identidade gamer", "Gamer identity", "Identidad gamer")}
        </h3>
      </div>

      {steam ? (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-[#66c0f4]/15 bg-[#66c0f4]/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {steam.personaName || "Steam"}
                </p>
                <p className="mt-1 text-[0.68rem] text-muted-foreground">
                  {copy("Steam verificada", "Verified Steam", "Steam verificada")}
                </p>
              </div>
              <ShieldCheck className="size-4 shrink-0 text-[#66c0f4]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniStat label={copy("Nível", "Level", "Nivel")} value={badgesShared ? (steam.steamLevel ?? "—") : hiddenValue} />
            <MiniStat label={copy("Jogos", "Games", "Juegos")} value={libraryShared ? (steam.libraryGameCount ?? steam.games.length) : hiddenValue} />
            <MiniStat label={copy("Insígnias", "Badges", "Insignias")} value={badgesShared ? (steam.badgeCount ?? "—") : hiddenValue} />
            <MiniStat label={copy("Perfis de jogo", "Game Profiles", "Perfiles de juego")} value={gameProfileCount} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {copy(
            "Perfis específicos por jogo e favoritos. Ao vincular a Steam, nível, biblioteca e insígnias aparecem aqui.",
            "Game-specific profiles and favorites. When Steam is linked, level, library and badges appear here.",
            "Perfiles específicos por juego y favoritos. Al vincular Steam, nivel, biblioteca e insignias aparecen aquí.",
          )}
        </p>
      )}
    </div>
  );
}

function SteamAchievementsCard({
  steam,
  locale,
}: {
  steam: PublicSteamShowcase | null;
  locale: "pt-BR" | "en" | "es";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const summary = steam?.achievementSummary ?? null;
  const trackedGames =
    steam?.games
      .filter(
        (game) =>
          typeof game.achievementsTotal === "number" &&
          game.achievementsTotal > 0 &&
          typeof game.achievementPercent === "number",
      )
      .slice(0, 4) ?? [];
  const overallPercent =
    summary && summary.total > 0
      ? Math.max(0, Math.min(100, (summary.unlocked / summary.total) * 100))
      : 0;

  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2">
        <Award className="size-4 text-gold-strong" />
        <h3 className="text-sm font-semibold">
          {copy("Conquistas", "Achievements", "Logros")}
        </h3>
      </div>

      {summary && summary.total > 0 ? (
        <div className="mt-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold">
                {summary.unlocked}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  / {summary.total}
                </span>
              </p>
              <p className="mt-0.5 text-[0.67rem] text-muted-foreground">
                {summary.gamesTracked} {copy("jogos com conquistas", "games with achievements", "juegos con logros")}
              </p>
            </div>
            <span className="text-xs font-semibold text-gold-strong">
              {Math.round(overallPercent)}%
            </span>
          </div>

          <ProgressBar value={overallPercent} className="mt-2 h-1.5" />

          {trackedGames.length > 0 ? (
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              {trackedGames.map((game) => {
                const percent = Math.max(
                  0,
                  Math.min(100, Number(game.achievementPercent ?? 0)),
                );
                return (
                  <div key={game.appId} className="min-w-0">
                    <div className="flex items-center justify-between gap-2 text-[0.68rem]">
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {game.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {game.achievementsUnlocked ?? 0}/{game.achievementsTotal}
                      </span>
                    </div>
                    <ProgressBar value={percent} className="mt-1.5 h-1" />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {steam?.showAchievements === false
            ? copy(
                "Conquistas ocultas pela preferência de privacidade deste perfil.",
                "Achievements are hidden by this profile's privacy preference.",
                "Los logros están ocultos por la preferencia de privacidad de este perfil.",
              )
            : steam
              ? copy(
                  "A Steam está conectada, mas as conquistas ainda não foram sincronizadas ou estão indisponíveis.",
                  "Steam is connected, but achievements have not been synced yet or are unavailable.",
                  "Steam está conectada, pero los logros aún no se han sincronizado o no están disponibles.",
                )
              : copy(
                  "Vincule a Steam para exibir progresso real de conquistas por jogo.",
                  "Link Steam to show real achievement progress per game.",
                  "Vincula Steam para mostrar el progreso real de logros por juego.",
                )}
        </p>
      )}
    </div>
  );
}

function SteamActivityCard({
  steam,
  locale,
  postCount,
}: {
  steam: PublicSteamShowcase | null;
  locale: "pt-BR" | "en" | "es";
  postCount: number;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const recent = steam?.recentGames.slice(0, 3) ?? [];

  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2">
        <History className="size-4 text-gold-strong" />
        <h3 className="text-sm font-semibold">
          {copy("Atividade", "Activity", "Actividad")}
        </h3>
      </div>

      {recent.length > 0 ? (
        <div className="mt-3 space-y-2">
          {recent.map((game) => (
            <div key={game.appId} className="rounded-xl border border-border bg-muted/10 px-3 py-2.5">
              <p className="truncate text-xs font-semibold">{game.name}</p>
              <p className="mt-1 text-[0.67rem] text-muted-foreground">
                {formatSteamMinutes(game.recentMinutes)} {copy("nas últimas 2 semanas", "in the last 2 weeks", "en las últimas 2 semanas")}
              </p>
            </div>
          ))}
          <p className="pt-1 text-[0.67rem] text-muted-foreground">
            {postCount} {copy("posts no MGP", "MGP posts", "posts en MGP")}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {steam?.showPlaytime === false
            ? copy(
                "A atividade recente da Steam está oculta pela preferência de privacidade deste perfil.",
                "Recent Steam activity is hidden by this profile's privacy preference.",
                "La actividad reciente de Steam está oculta por la preferencia de privacidad de este perfil.",
              )
            : steam
              ? copy(
                  "Nenhum jogo recente público encontrado. A atividade social do MGP continua aparecendo normalmente.",
                  "No public recent games were found. MGP social activity still appears normally.",
                  "No se encontraron juegos recientes públicos. La actividad social de MGP sigue apareciendo normalmente.",
                )
              : copy(
                  "Posts e perfis de jogo formam seu histórico. A Steam adiciona jogos recentes automaticamente.",
                  "Posts and game profiles form your history. Steam automatically adds recent games.",
                  "Posts y perfiles de juego forman tu historial. Steam añade juegos recientes automáticamente.",
                )}
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/10 px-2.5 py-2">
      <p className="truncate text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-sm font-bold">{value}</p>
    </div>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className={cn("overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-gold transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}

function formatSteamMinutes(minutes: number | null | undefined) {
  if (!minutes) return "0h";
  if (minutes < 60) return `${minutes}m`;
  const value = minutes / 60;
  return value >= 100 ? `${Math.round(value)}h` : `${value.toFixed(1)}h`;
}
