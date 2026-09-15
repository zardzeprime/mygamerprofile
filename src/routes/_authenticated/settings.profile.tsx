import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, Eye, LockKeyhole, Palette } from "lucide-react";
import { getCurrentProfile, updateProfile, checkUsernameAvailable } from "@/lib/profiles.functions";
import { uploadImage } from "@/lib/uploads";
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
import { useServerFn } from "@tanstack/react-start";
import {
  PROFILE_BACKGROUNDS,
  getProfileBackground,
  type ProfileBackgroundKey,
} from "@/config/profileBackgrounds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  loader: async () => {
    const profile = await getCurrentProfile();
    return { profile };
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
  const { profile } = Route.useLoaderData();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [language, setLanguage] = useState<Locale>((profile.language as Locale) ?? locale);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [background, setBackground] = useState<ProfileBackgroundKey>(
    getProfileBackground(profile.profile_background).key,
  );
  const [visibility, setVisibility] = useState<"public" | "private">(
    profile.visibility === "private" ? "private" : "public",
  );
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);

  const doUpdate = useServerFn(updateProfile);
  const checkUsername = useServerFn(checkUsernameAvailable);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setError(t("auth.errors.invalidUsername"));
      return;
    }
    if (normalized !== profile.username) {
      const { available } = await checkUsername({ data: { username: normalized, excludeUserId: profile.id } });
      if (!available) {
        setError(t("auth.errors.usernameTaken"));
        return;
      }
    }

    setLoading(true);
    try {
      await doUpdate({
        data: {
          display_name: displayName.trim(),
          username: normalized,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          language,
          visibility,
          profile_background: background,
        },
      });
      setLocale(language);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      if (normalized !== profile.username) {
        router.navigate({ to: "/u/$username", params: { username: normalized } });
      } else {
        router.invalidate();
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

  const selectedBackground = getProfileBackground(background);

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
                  className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft transition-transform hover:scale-105"
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
                {copy("Apenas o avatar é enviado por você. O plano de fundo usa presets do MGP.", "Only your avatar is uploaded. The background uses MGP presets.", "Solo subes tu avatar. El fondo usa presets de MGP.")}
              </p>
            </div>
            <Button asChild type="button" variant="outline" size="sm">
              <Link to="/u/$username" params={{ username: profile.username }}>
                <Eye className="mr-2 size-4" />
                {copy("Ver perfil", "View profile", "Ver perfil")}
              </Link>
            </Button>
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-gold-strong" />
            <h2 className="font-display text-lg font-semibold">{copy("Plano de fundo", "Background", "Fondo")}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Escolha um visual oficial do MGP. Planos animados e cosméticos premium chegam mais tarde sem permitir upload livre de banners.",
              "Choose an official MGP look. Animated and premium cosmetics will arrive later without unrestricted banner uploads.",
              "Elige un aspecto oficial de MGP. Los fondos animados y cosméticos premium llegarán más adelante sin permitir cargas libres de banners.",
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PROFILE_BACKGROUNDS.map((preset) => {
              const selected = background === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setBackground(preset.key)}
                  className={cn(
                    "overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5",
                    selected ? "border-gold/60 ring-2 ring-gold/15" : "border-border hover:border-gold/30",
                  )}
                >
                  <div className={cn("relative h-24", preset.className)}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/75 to-transparent" />
                    {selected ? <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-gold text-gold-foreground"><Check className="size-4" /></span> : null}
                  </div>
                  <div className="bg-surface p-3">
                    <p className="text-sm font-semibold">{preset.name[locale]}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{preset.description[locale]}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-4 sm:p-6">
          <h2 className="mb-5 font-display text-xl font-semibold">{t("settings.profile")}</h2>
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
