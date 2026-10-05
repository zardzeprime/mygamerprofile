import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getGameProfile, upsertGameProfile } from "@/lib/games.functions";
import { getGameConfig } from "@/config/games";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useServerFn } from "@tanstack/react-start";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/u/$username/games/$slug")({
  loader: async ({ params }) => {
    const config = getGameConfig(params.slug);
    if (!config) throw notFound();
    const data = await getGameProfile({ data: { username: params.username, slug: params.slug } });
    if (!data.profile) throw notFound();
    return { config, ...data };
  },
  notFoundComponent: GameProfileNotFound,
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: `${params.slug} — @${params.username} — ÍMPAR` },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    const { config, profile } = loaderData;
    return buildSeo({
      title: `${config.name} — ${profile.display_name} (@${profile.username}) — ÍMPAR`,
      description: `Game Profile público de @${profile.username} para ${config.name} no ÍMPAR.`,
      path: `/u/${profile.username}/games/${config.slug}`,
      image: profile.avatar_url ?? config.visual.coverImage,
      type: "profile",
    });
  },
  component: GameProfilePage,
});

function GameProfileNotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-center">
      <h1 className="font-display text-2xl">{t("common.error")}</h1>
      <p className="text-muted-foreground">Game Profile não encontrado.</p>
    </div>
  );
}

function GameProfilePage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { config, profile, game, gameProfile } = Route.useLoaderData();
  const isOwn = user?.id === profile.id;
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    (gameProfile?.profile_data as Record<string, string>) ?? {},
  );
  const [saved, setSaved] = useState(false);
  const submit = useServerFn(upsertGameProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      data: {
        game_id: game.id,
        profile_data: values,
        visibility: "public",
      },
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/u/$username" params={{ username: profile.username }}>
          <UserAvatar src={profile.avatar_url} name={profile.display_name} size="md" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {config.name} — {profile.display_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            @{profile.username} ·{" "}
            <Link
              to="/games/$slug"
              params={{ slug: config.slug }}
              className="text-gold hover:underline"
            >
              {t("games.openHub")}
            </Link>
          </p>
        </div>
        {isOwn && !editing && (
          <Button className="ml-auto" onClick={() => setEditing(true)}>
            {t("profile.editProfile")}
          </Button>
        )}
      </div>

      <div className="surface-panel rounded-xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t("profile.gameProfiles")}</h2>
          <DataSourceIndicator source="player_provided" />
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {config.profileFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label[locale]}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    maxLength={field.maxLength}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={values[field.key] ?? ""}
                    onValueChange={(value) => setValues((v) => ({ ...v, [field.key]: value }))}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "number" ? "number" : "text"}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                    maxLength={field.maxLength}
                    min={field.min}
                    max={field.max}
                  />
                )}
              </div>
            ))}
            {saved && <p className="text-sm text-success">{t("settings.saved")}</p>}
            <div className="flex gap-2">
              <Button type="submit">{t("common.save")}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {config.profileFields.map((field) => (
              <div key={field.key} className="rounded-lg bg-muted p-3">
                <dt className="text-xs uppercase text-muted-foreground">{field.label[locale]}</dt>
                <dd className="mt-1 font-medium">
                  {values[field.key] ? String(values[field.key]) : "—"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </main>
  );
}
