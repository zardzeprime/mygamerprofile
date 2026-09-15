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
import { getGameProfile } from "@/lib/games.functions";
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
import { GAMES } from "@/config/games";
import { getProfileBackground } from "@/config/profileBackgrounds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await getProfileByUsername({ data: { username: params.username } });
    if (!profile) throw notFound();

    const posts = await listPosts({ data: { authorId: profile.id } }).catch(() => []);
    const gameProfiles = await Promise.all(
      GAMES.map((game) =>
        getGameProfile({ data: { username: params.username, slug: game.slug } })
          .then((result) => result?.gameProfile ?? null)
          .catch(() => null),
      ),
    );

    return {
      profile,
      posts,
      gameProfiles: gameProfiles
        .filter((gameProfile): gameProfile is NonNullable<typeof gameProfile> => Boolean(gameProfile))
        .map((gameProfile) => ({
          ...gameProfile,
          profile_data: (gameProfile.profile_data ?? {}) as Record<string, unknown>,
        })),
    };
  },
  notFoundComponent: () => {
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
  },
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — MGP` },
      { name: "description", content: `Perfil de @${params.username} no My Gamer Profile.` },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { locale, t } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { profile, posts, gameProfiles } = Route.useLoaderData();
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followerCount, setFollowerCount] = useState(profile.followers ?? 0);
  const [followBusy, setFollowBusy] = useState(false);

  const checkFollow = useServerFn(isFollowing);
  const doFollow = useServerFn(followUser);
  const doUnfollow = useServerFn(unfollowUser);
  const background = getProfileBackground(profile.profile_background);

  const favoriteGames = useMemo(
    () =>
      gameProfiles
        .filter((gameProfile) => gameProfile.profile_data?.favorite === true)
        .map((gameProfile) => GAMES.find((game) => game.id === gameProfile.game_id))
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

  const joinedAt = new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(profile.created_at));

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-clip px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div className={cn("profile-hero relative min-h-52 overflow-hidden sm:min-h-72 lg:min-h-80", background.className)}>
          <div className="absolute inset-0 profile-hero-scrim" />
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur sm:left-6 sm:top-6">
            MGP Profile
          </div>
        </div>

        <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
            <UserAvatar
              src={profile.avatar_url}
              name={profile.display_name}
              size="lg"
              className="shrink-0 border-4 border-surface shadow-lift"
            />
            <div className="min-w-0 flex-1 sm:pb-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="min-w-0 truncate font-display text-2xl font-bold sm:text-3xl">{profile.display_name}</h1>
                {isOwn ? <ShieldCheck className="size-5 shrink-0 text-gold-strong" aria-label={copy("Seu perfil", "Your profile", "Tu perfil")} /> : null}
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">@{profile.username}</p>
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
        </div>
      </section>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        <section className="min-w-0 space-y-5">
          {favoriteGames.length > 0 ? (
            <div className="surface-panel p-4 sm:p-5">
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-gold-strong" /><h2 className="font-display text-base font-semibold">{copy("Jogos favoritos", "Favorite games", "Juegos favoritos")}</h2></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {favoriteGames.map((game) => (
                  <Link
                    key={game.id}
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
                <div className="md:col-span-2"><EmptyState title={t("common.empty")} /></div>
              ) : (
                gameProfiles.map((gameProfile) => <GameProfileCard key={gameProfile.game_id} gameProfile={gameProfile} username={profile.username} />)
              )}
            </TabsContent>
          </Tabs>
        </section>

        <aside className="grid min-w-0 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:self-start">
          <Showcase icon={Gamepad2} title={copy("Identidade gamer", "Gamer identity", "Identidad gamer")} description={copy("Perfis específicos por jogo e favoritos.", "Game-specific profiles and favorites.", "Perfiles específicos por juego y favoritos.")} />
          <Showcase icon={Award} title={copy("Conquistas", "Achievements", "Logros")} description={copy("Sistema preparado para uma etapa futura.", "System prepared for a future release.", "Sistema preparado para una futura versión.")} />
          <Showcase icon={History} title={copy("Atividade", "Activity", "Actividad")} description={copy("Posts e histórico social vão ganhar mais profundidade na v0.2.", "Posts and social history will expand in v0.2.", "Las publicaciones y el historial social crecerán en v0.2.")} />
        </aside>
      </div>
    </main>
  );
}

function Showcase({ icon: Icon, title, description }: { icon: typeof Sparkles; title: string; description: string }) {
  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2"><Icon className="size-4 text-gold-strong" /><h3 className="text-sm font-semibold">{title}</h3></div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}
