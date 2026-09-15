import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfileByUsername } from "@/lib/profiles.functions";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { GameProfileCard } from "@/components/games/GameProfileCard";
import { PostCard } from "@/components/posts/PostCard";
import { ReportDialog } from "@/components/common/ReportDialog";
import { followUser, unfollowUser, isFollowing } from "@/lib/profiles.functions";
import { listPosts } from "@/lib/posts.functions";
import { getGameProfile } from "@/lib/games.functions";
import { GAMES } from "@/config/games";
import { useServerFn } from "@tanstack/react-start";
import { Award, Gamepad2, History, Sparkles } from "lucide-react";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await getProfileByUsername({ data: { username: params.username } });
    if (!profile) throw notFound();
    const posts = await listPosts({ data: { authorId: profile.id } });
    const gameProfiles = await Promise.all(
      GAMES.map((game) => getGameProfile({ data: { username: params.username, slug: game.slug } }).catch(() => null)),
    );
    return { profile, posts, gameProfiles: gameProfiles.map((g) => g?.gameProfile).filter((g): g is NonNullable<typeof g> => !!g).map((g) => ({ ...g, profile_data: (g.profile_data ?? {}) as Record<string, unknown> })) };
  },
  notFoundComponent: () => {
    const { t } = useI18n();
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h1 className="font-display text-2xl">{t("common.error")}</h1>
        <p className="text-muted-foreground">Perfil não encontrado.</p>
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
  const { profile, posts, gameProfiles } = Route.useLoaderData();
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followerCount, setFollowerCount] = useState(
    typeof profile.followers === "number" ? profile.followers : Array.isArray(profile.followers) ? profile.followers.length : 0,
  );

  const checkFollow = useServerFn(isFollowing);
  const doFollow = useServerFn(followUser);
  const doUnfollow = useServerFn(unfollowUser);

  useEffect(() => {
    if (!user || isOwn) return;
    checkFollow({ data: { following_id: profile.id } }).then((res) => setFollowing(res.following));
  }, [checkFollow, isOwn, profile.id, user]);

  const handleFollow = async () => {
    if (!user || isOwn) return;
    if (following) {
      await doUnfollow({ data: { following_id: profile.id } });
      setFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await doFollow({ data: { following_id: profile.id } });
      setFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="profile-banner relative h-44 overflow-hidden rounded-lg border border-border sm:h-72">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full profile-banner-placeholder" />
        )}
      </div>

      <div className="relative z-10 -mt-12 grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-4 sm:-mt-16 sm:flex sm:items-end sm:gap-6">
        <UserAvatar src={profile.avatar_url} name={profile.display_name} size="lg" className="border-4 border-background" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold">{profile.display_name}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
         <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
          {!isOwn && user && (
            <Button onClick={handleFollow} variant={following ? "outline" : "default"}>
              {following ? t("profile.unfollow") : t("profile.follow")}
            </Button>
          )}
          {isOwn && (
            <Button asChild variant="outline">
              <Link to="/settings/profile">{t("profile.editProfile")}</Link>
            </Button>
          )}
          {!isOwn && user && <ReportDialog targetType="profile" targetId={profile.id} username={profile.username} />}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="surface-panel p-5">
            <p className="text-sm text-foreground">{profile.bio || t("profile.noBio")}</p>
          </div>

          <Tabs defaultValue="posts">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="posts">{t("profile.posts")}</TabsTrigger>
              <TabsTrigger value="games">{t("profile.gameProfiles")}</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
              {posts.length === 0 ? (
                <EmptyState title={t("home.activity.empty")} />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>
            <TabsContent value="games" className="mt-4 grid gap-4 sm:grid-cols-2">
              {gameProfiles.length === 0 ? (
                <EmptyState title={t("common.empty")} />
              ) : (
                gameProfiles.map((gp) => (
                  <GameProfileCard key={gp.game_id} gameProfile={gp} username={profile.username} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <div className="surface-panel p-5">
            <dl className="grid grid-cols-2 gap-4 text-center">
              <div>
                <dt className="text-2xl font-semibold">{followerCount}</dt>
                <dd className="text-xs text-muted-foreground uppercase">{t("profile.followers")}</dd>
              </div>
              <div>
                <dt className="text-2xl font-semibold">
                  {typeof profile.following === "number"
                    ? profile.following
                    : Array.isArray(profile.following)
                      ? profile.following.length
                      : 0}
                </dt>
                <dd className="text-xs text-muted-foreground uppercase">{t("profile.following")}</dd>
              </div>
            </dl>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Showcase icon={Gamepad2} title={locale === "pt-BR" ? "Jogos favoritos" : "Favorite games"} />
            <Showcase icon={Award} title={locale === "pt-BR" ? "Conquistas" : "Achievements"} />
            <Showcase icon={History} title={locale === "pt-BR" ? "Jogados recentemente" : "Recently played"} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Showcase({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return <div className="surface-panel p-4"><div className="flex items-center gap-2"><Icon className="size-4 text-gold-strong" /><h3 className="text-sm font-semibold">{title}</h3></div><p className="mt-3 text-xs text-muted-foreground">Em breve</p></div>;
}
