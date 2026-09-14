import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await getProfileByUsername({ data: { username: params.username } });
    if (!profile) throw notFound();
    const posts = await listPosts({ data: { authorId: profile.id } });
    const gameProfiles = await Promise.all(
      GAMES.map((game) => getGameProfile({ data: { username: params.username, slug: game.slug } }).catch(() => null)),
    );
    return { profile, posts, gameProfiles: gameProfiles.map((g) => g?.gameProfile).filter((g): g is NonNullable<typeof g> => !!g) };
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
  const { t } = useI18n();
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

  useState(() => {
    if (!user || isOwn) return;
    checkFollow({ data: { following_id: profile.id } }).then((res) => setFollowing(res.following));
  });

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
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="relative h-40 overflow-hidden rounded-2xl sm:h-56">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gold/30 via-surface to-surface" />
        )}
      </div>

      <div className="relative z-10 -mt-12 flex flex-col gap-4 px-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
        <UserAvatar src={profile.avatar_url} name={profile.display_name} size="lg" className="border-4 border-background" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold">{profile.display_name}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <div className="surface-panel rounded-xl p-4">
            <p className="text-sm text-foreground">{profile.bio || t("profile.noBio")}</p>
          </div>

          <Tabs defaultValue="posts">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="posts">{t("profile.posts")}</TabsTrigger>
              <TabsTrigger value="games">{t("profile.gameProfiles")}</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
              {posts.length === 0 ? (
                <EmptyState message={t("home.activity.empty")} />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>
            <TabsContent value="games" className="mt-4 grid gap-4 sm:grid-cols-2">
              {gameProfiles.length === 0 ? (
                <EmptyState message={t("common.empty")} />
              ) : (
                gameProfiles.map((gp) => (
                  <GameProfileCard key={gp!.game_id} gameProfile={gp!} username={profile.username} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <div className="surface-panel rounded-xl p-4">
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
        </aside>
      </div>
    </main>
  );
}
