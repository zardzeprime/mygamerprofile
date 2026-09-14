import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { checkUsernameAvailable, createProfile } from "@/lib/profiles.functions";
import { LOCALES, type Locale } from "@/i18n/translations";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Complete seu perfil — MGP" },
      { name: "description", content: "Finalize seu perfil no My Gamer Profile." },
    ],
  }),
});

function OnboardingPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<Locale>(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setError(t("auth.errors.invalidUsername"));
      return;
    }
    if (!displayName.trim()) {
      setError(t("auth.errors.generic"));
      return;
    }
    setLoading(true);
    const { available } = await checkUsernameAvailable({ data: { username: normalized } });
    if (!available) {
      setLoading(false);
      setError(t("auth.errors.usernameTaken"));
      return;
    }
    try {
      const profile = await createProfile({
        data: {
          username: normalized,
          display_name: displayName.trim(),
          language,
        },
      });
      setLocale(language);
      router.navigate({ to: "/u/$username", params: { username: profile.username } });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : t("auth.errors.generic"));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
          <CardTitle className="font-display text-2xl">{t("auth.onboarding.title")}</CardTitle>
          <CardDescription>{t("auth.onboarding.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="zardze"
                required
              />
              <p className="text-xs text-muted-foreground">{t("auth.errors.invalidUsername")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("auth.displayName")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Locale)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === "pt-BR" ? "Português (Brasil)" : "English"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("auth.onboarding.finish")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
