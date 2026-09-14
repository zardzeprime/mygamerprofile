import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getGames } from "@/lib/games.functions";
import { listLfgPosts, createLfgPost, closeLfgPost } from "@/lib/lfg.functions";
import { useI18n } from "@/i18n";
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

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch"];
const LANGUAGES = ["pt-BR", "en", "es", "fr"];
const STATUSES = ["open", "closed", "expired"];

export const Route = createFileRoute("/lfg")({
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
  const { user } = useAuth();
  const { games } = Route.useLoaderData();
  const [posts, setPosts] = useState(Route.useLoaderData().posts);
  const [filters, setFilters] = useState({ gameId: "", platform: "", language: "", status: "open" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const doList = useServerFn(listLfgPosts);
  const doCreate = useServerFn(createLfgPost);
  const doClose = useServerFn(closeLfgPost);

  const applyFilters = async () => {
    const rows = await doList({ data: filters });
    setPosts(rows);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const post = await doCreate({
      data: {
        game_id: String(formData.get("game_id")),
        platform: String(formData.get("platform")),
        region: String(formData.get("region")),
        language: String(formData.get("language")),
        mode: String(formData.get("mode")),
        description: String(formData.get("description")),
        mic_required: formData.get("mic_required") === "on",
        slots_total: Number(formData.get("slots_total")),
        slots_open: Number(formData.get("slots_total")),
      },
    });
    setPosts((prev) => [post as any, ...prev]);
    setDialogOpen(false);
    form.reset();
  };

  const handleClose = async (id: string) => {
    await doClose({ data: { id } });
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "closed" } : p)));
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{t("lfg.title")}</h1>
          <p className="text-sm text-muted-foreground">Encontre grupo por jogo, plataforma e idioma.</p>
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
                  <Label htmlFor="game_id">{t("lfg.filter.game")}</Label>
                  <Select name="game_id" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">{t("lfg.platform")}</Label>
                    <Select name="platform" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("lfg.filter.language")}</Label>
                    <Select name="language" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">{t("lfg.region")}</Label>
                    <Input name="region" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">{t("lfg.mode")}</Label>
                    <Input name="mode" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slots_total">{t("lfg.slots")}</Label>
                  <Input name="slots_total" type="number" min={1} max={99} defaultValue={4} required />
                </div>
                <div className="flex items-center gap-2">
                  <Switch name="mic_required" id="mic_required" />
                  <Label htmlFor="mic_required">{t("lfg.micRequired")}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("lfg.description")}</Label>
                  <Textarea name="description" required />
                </div>
                <Button type="submit" className="w-full">
                  {t("lfg.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Select value={filters.gameId} onValueChange={(v) => setFilters((f) => ({ ...f, gameId: v }))}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("lfg.filter.game")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("common.all")}</SelectItem>
            {games.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.platform} onValueChange={(v) => setFilters((f) => ({ ...f, platform: v }))}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("lfg.filter.platform")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("common.all")}</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.language} onValueChange={(v) => setFilters((f) => ({ ...f, language: v }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("lfg.filter.language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("common.all")}</SelectItem>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("lfg.filter.status")} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`lfg.status.${s}` as const)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={applyFilters}>
          {t("common.search")}
        </Button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <EmptyState message={t("common.empty")} />
        ) : (
          posts.map((post) => (
            <article key={post.id} className="surface-panel rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                    <UserAvatar src={post.author?.avatar_url} name={post.author?.display_name} size="md" />
                  </Link>
                  <div>
                    <p className="font-semibold">{post.author?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{post.author?.username} · {post.game?.name}
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
                  {t(`lfg.status.${post.status}` as const)}
                </span>
              </div>
              <p className="mt-3 text-sm">{post.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-1">{post.platform}</span>
                {post.region && <span className="rounded-md bg-muted px-2 py-1">{post.region}</span>}
                {post.mode && <span className="rounded-md bg-muted px-2 py-1">{post.mode}</span>}
                <span className="rounded-md bg-muted px-2 py-1">{post.language}</span>
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
                  <Button variant="destructive" size="sm" onClick={() => handleClose(post.id)}>
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
