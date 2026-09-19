import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, Eye, Gamepad2, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import { checkUsernameAvailable } from "@/lib/profiles.functions";
import { uploadImage } from "@/lib/uploads";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
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
import { UserAvatar } from "@/components/common/UserAvatar";
import { GameArtwork } from "@/components/games/GameArtwork";
import { ProfileIdentityStudio } from "@/components/profile/ProfileIdentityStudio";
import { getProfileBackground } from "@/config/profileBackgrounds";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import type { Json } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

function isFavoriteProfileData(value: Json) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value["favorite"] === true,
  );
}

function copyProfileData(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

export const Route = createFileRoute("/_authenticated/settings/profile")({
  loader: async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw redirect({ to: "/login" });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) throw redirect({ to: "/onboarding" });

    const [{ data: gameRows, error: gamesError }, { data: gameProfiles, error: gameProfilesError }] =
      await Promise.all([
        supabase.from("games").select("id,slug").eq("active", true).order("name"),
        supabase
          .from("game_profiles")
          .select("game_id,profile_data,visibility")
          .eq("user_id", profile.id),
      ]);

    if (gamesError) throw new Error(gamesError.message);
    if (gameProfilesError) throw new Error(gameProfilesError.message);

    return {
      profile: profile as typeof profile & { profile_background?: string },
      gameRows: gameRows ?? [],
      gameProfiles: gameProfiles ?? [],
    };
  },
  head: () => ({
    meta: [
      { title: "Configurações de perfil — MGP" },
      { name: "description", content: "Edite seu perfil no My Gamer Profile." },
    ],
  }),
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const router = useRouter();
  const { profile, gameRows, gameProfiles } = Route.useLoaderData();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [language, setLanguage] = useState<Locale>((profile.language as Locale) ?? locale);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    profile.visibility === "private" ? "private" : "public",
  );
  const [favoriteGameSlugs, setFavoriteGameSlugs] = useState<string[]>(() =>
    gameRows
      .filter((game) => {
        const gameProfile = gameProfiles.find((item) => item.game_id === game.id);
        return gameProfile ? isFavoriteProfileData(gameProfile.profile_data) : false;
      })
      .map((game) => game.slug),
  );
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);

  const toggleFavoriteGame = (slug: string) => {
    setFavoriteGameSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);

    const normalized = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const cleanBio = bio.trim();

    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setError(t("auth.errors.invalidUsername"));
      return;
    }
    if (!cleanDisplayName || cleanDisplayName.length > 80 || cleanBio.length > 500) {
      setError(t("auth.errors.generic"));
      return;
    }

    setLoading(true);
    try {
      if (normalized !== profile.username) {
        const { available } = await checkUsernameAvailable({
          data: { username: normalized, excludeUserId: profile.id },
        });
        if (!available) {
          setError(t("auth.errors.usernameTaken"));
          return;
        }
      }

      const updatePayload = {
        display_name: cleanDisplayName,
        username: normalized,
        bio: cleanBio || null,
        avatar_url: avatarUrl || null,
        language,
        visibility,
        updated_at: new Date().toISOString(),
      } as Database["public"]["Tables"]["profiles"]["Update"];
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", profile.id);

      if (updateError) throw updateError;

      const favoriteRows = ACTIVE_GAMES.flatMap((game) => {
        const databaseGame = gameRows.find((row) => row.slug === game.slug);
        if (!databaseGame) return [];

        const existing = gameProfiles.find((row) => row.game_id === databaseGame.id);
        const profileData = copyProfileData(existing?.profile_data ?? null);
        const selected = favoriteGameSlugs.includes(game.slug);

        if (selected) profileData["favorite"] = true;
        else delete profileData["favorite"];

        if (!selected && !existing) return [];

        return [
          {
            user_id: profile.id,
            game_id: databaseGame.id,
            profile_data: profileData,
            visibility: existing?.visibility ?? "public",
          },
        ];
      });

      if (favoriteRows.length > 0) {
        const { error: favoriteError } = await supabase
          .from("game_profiles")
          .upsert(favoriteRows, { onConflict: "user_id,game_id" });
        if (favoriteError) throw favoriteError;
      }

      setLocale(language);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);

      if (normalized !== profile.username) {
        await router.navigate({ to: "/u/$username", params: { username: normalized } });
      } else {
        await router.invalidate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingAvatar(true);
    try {
      const url = await uploadImage("avatars", file, "profile-avatar");
      setAvatarUrl(url);
    } catch {
      setError(copy("Não foi possível enviar o avatar.", "Could not upload the avatar.", "No se pudo subir el avatar."));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const selectedBackground = getProfileBackground(profile.profile_background);

  return (
    <SettingsLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="surface-panel overflow-hidden rounded-2xl">
          <div className={cn("relative min-h-48 overflow-hidden p-5 sm:min-h-56 sm:p-7", selectedBackground.className)}>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="relative flex min-h-36 items-end gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <UserAvatar src={avatarUrl} name={displayName} size="lg" className="border-4 border-background shadow-lift" />
                <button
                  type="button"
                  onClick={() => avatarInput.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
                  aria-label={copy("Alterar avatar", "Change avatar", "Cambiar avatar")}
                >
                  <Camera className="size-4" />
                </button>
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </div>
              <div className="min-w-0 pb-1">
                <p className="truncate font-display text-xl font-bold text-foreground sm:text-2xl">{displayName || "MGP Player"}</p>
                <p className="truncate text-sm text-muted-foreground">@{username || "username"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-7">
            <div>
              <p className="text-sm font-semibold">{copy("Prévia do perfil", "Profile preview", "Vista previa del perfil")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy("Esta prévia cobre os dados básicos. Títulos, fundos, molduras e efeitos equipados aparecem no seu perfil público.", "This preview covers basic profile data. Equipped titles, backgrounds, frames and effects appear on your public profile.", "Esta vista cubre los datos básicos. Los títulos, fondos, marcos y efectos equipados aparecen en tu perfil público.")}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/u/$username" params={{ username: profile.username }}>
                <Eye className="mr-2 size-4" />
                {copy("Ver perfil", "View profile", "Ver perfil")}
              </Link>
            </Button>
          </div>
        </section>



        <section className="surface-panel rounded-2xl p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <a href="#profile-appearance" className="rounded-xl border border-border bg-muted/15 px-3 py-3 transition-colors hover:border-gold/35 hover:bg-gold-soft/20">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-gold-strong" />
                {copy("Aparência & títulos", "Appearance & titles", "Apariencia y títulos")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{copy("Cosméticos e loadout visual.", "Cosmetics and visual loadout.", "Cosméticos y loadout visual.")}</p>
            </a>
            <a href="#profile-games" className="rounded-xl border border-border bg-muted/15 px-3 py-3 transition-colors hover:border-gold/35 hover:bg-gold-soft/20">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Gamepad2 className="size-4 text-gold-strong" />
                {copy("Jogos favoritos", "Favorite games", "Juegos favoritos")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{copy("Destaques do seu perfil gamer.", "Highlights for your gamer profile.", "Destacados de tu perfil gamer.")}</p>
            </a>
            <a href="#profile-info" className="rounded-xl border border-border bg-muted/15 px-3 py-3 transition-colors hover:border-gold/35 hover:bg-gold-soft/20">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="size-4 text-gold-strong" />
                {copy("Informações", "Information", "Información")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{copy("Nome, username, bio e visibilidade.", "Name, username, bio and visibility.", "Nombre, usuario, bio y visibilidad.")}</p>
            </a>
          </div>
        </section>

        <div id="profile-appearance" className="scroll-mt-24">
          <ProfileIdentityStudio locale={locale} />
        </div>

        <section id="profile-games" className="surface-panel scroll-mt-24 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-4 text-gold-strong" />
            <h2 className="font-display text-lg font-semibold">
              {copy("Jogos favoritos", "Favorite games", "Juegos favoritos")}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Na 0.1.9, os favoritos ficam limitados aos quatro hubs ativos. Jogos pausados continuam preservados para voltar depois.",
              "In 0.1.9, favorites are limited to the four active hubs. Paused games remain preserved for a later return.",
              "En 0.1.9, los favoritos se limitan a los cuatro hubs activos. Los juegos pausados se conservan para volver después.",
            )}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACTIVE_GAMES.map((game) => {
              const selected = favoriteGameSlugs.includes(game.slug);
              return (
                <button
                  key={game.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFavoriteGame(game.slug)}
                  className={cn(
                    "group overflow-hidden rounded-xl border bg-surface text-left transition-all hover:-translate-y-0.5",
                    selected ? "border-gold/65 ring-2 ring-gold/15" : "border-border hover:border-gold/35",
                  )}
                >
                  <div className="relative h-28 overflow-hidden">
                    <GameArtwork game={game} className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                    <span
                      className={cn(
                        "absolute right-3 top-3 grid size-7 place-items-center rounded-full border backdrop-blur",
                        selected ? "border-gold bg-gold text-gold-foreground" : "border-white/20 bg-black/35 text-white/70",
                      )}
                    >
                      <Check className={cn("size-4", !selected && "opacity-0")} />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-sm font-semibold">{game.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{game.genre}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section id="profile-info" className="surface-panel scroll-mt-24 rounded-2xl p-4 sm:p-6">
          <h2 className="font-display text-xl font-semibold">{copy("Informações do perfil", "Profile information", "Información del perfil")}</h2>
          <p className="mb-5 mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Edite aqui apenas os dados básicos da conta. A parte visual fica concentrada em Aparência & títulos para evitar configurações repetidas.",
              "Edit only your basic account details here. Visual choices are consolidated under Appearance & titles to avoid duplicate settings.",
              "Edita aquí solo los datos básicos de la cuenta. Las opciones visuales están reunidas en Apariencia y títulos para evitar ajustes duplicados.",
            )}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("auth.displayName")}</Label>
              <Input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input id="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required maxLength={20} />
              <p className="text-xs text-muted-foreground">{t("auth.errors.invalidUsername")}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="bio">{t("auth.bio")}</Label>
            <Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={500} />
            <p className="text-right text-xs tabular-nums text-muted-foreground">{bio.length}/500</p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as Locale)}>
                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCALES.map((loc) => <SelectItem key={loc} value={loc}>{LOCALE_LABELS[loc]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">{copy("Visibilidade", "Visibility", "Visibilidad")}</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as "public" | "private")}>
                <SelectTrigger id="visibility"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{copy("Público", "Public", "Público")}</SelectItem>
                  <SelectItem value="private">{copy("Privado", "Private", "Privado")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-muted/15 p-4">
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-gold-strong" />
              <p className="text-xs leading-5 text-muted-foreground">
                {copy(
                  "Seu avatar aceita JPG, PNG ou WebP de até 5 MB e fica isolado na sua pasta de usuário. GIF de avatar e upload de banner ficam desativados nesta fase.",
                  "Your avatar accepts JPG, PNG or WebP up to 5 MB and is isolated inside your user folder. GIF avatars and banner uploads are disabled at this stage.",
                  "Tu avatar acepta JPG, PNG o WebP de hasta 5 MB y queda aislado en tu carpeta de usuario. Los avatares GIF y las cargas de banner están desactivados en esta fase.",
                )}
              </p>
            </div>
          </div>

          {error ? <p className="mt-5 text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="mt-5 text-sm text-success">{t("settings.saved")}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" disabled={loading || uploadingAvatar}>
              {loading ? t("common.loading") : t("settings.save")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/u/$username" params={{ username }}>{copy("Abrir perfil", "Open profile", "Abrir perfil")}</Link>
            </Button>
          </div>
        </section>
      </form>
    </SettingsLayout>
  );
}
