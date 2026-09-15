import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const doUpdate = useServerFn(updateProfile);
  const checkUsername = useServerFn(checkUsernameAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          bio: bio.trim(),
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          language,
        },
      });
      setLocale(language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (normalized !== profile.username) {
        router.navigate({ to: "/u/$username", params: { username: normalized } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const url = await uploadImage("avatars", file);
      setAvatarUrl(url);
    } catch {
      setError(copy("Não foi possível enviar o avatar.", "Could not upload the avatar.", "No se pudo subir el avatar."));
    } finally {
      e.target.value = "";
    }
  };

  const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const url = await uploadImage("banners", file);
      setBannerUrl(url);
    } catch {
      setError(copy("Não foi possível enviar o banner.", "Could not upload the banner.", "No se pudo subir el banner."));
    } finally {
      e.target.value = "";
    }
  };

  return (
    <SettingsLayout>
      <div className="surface-panel rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">{t("settings.profile")}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <Label>{copy("Avatar", "Avatar", "Avatar")}</Label>
              <UserAvatar src={avatarUrl} name={displayName} size="lg" />
              <input
                ref={avatarInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatar}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => avatarInput.current?.click()}>
                {copy("Alterar avatar", "Change avatar", "Cambiar avatar")}
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="banner">{copy("Banner", "Banner", "Banner")}</Label>
              <div className="h-24 overflow-hidden rounded-lg border border-border bg-muted">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {copy("Sem banner", "No banner", "Sin banner")}
                  </div>
                )}
              </div>
              <input
                ref={bannerInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBanner}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => bannerInput.current?.click()}>
                {copy("Alterar banner", "Change banner", "Cambiar banner")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">{t("auth.displayName")}</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{t("auth.username")}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">{t("auth.errors.invalidUsername")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t("auth.bio")}</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} />
            <p className="text-right text-xs tabular-nums text-muted-foreground">{bio.length}/500</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">{t("settings.language")}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Locale)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-success">{t("settings.saved")}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("common.loading") : t("settings.save")}
          </Button>
        </form>
      </div>
    </SettingsLayout>
  );
}
