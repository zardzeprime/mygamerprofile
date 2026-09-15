import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, Gamepad2 } from "lucide-react";
import { useI18n, LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
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
import { GameArtwork } from "@/components/games/GameArtwork";
import { GAMES } from "@/config/games";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<Locale>(locale);
  const [favoriteGameSlugs, setFavoriteGameSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleFavorite = (gameSlug: string) => {
    setFavoriteGameSlugs((current) =>
      current.includes(gameSlug)
        ? current.filter((slug) => slug !== gameSlug)
        : [...current, gameSlug],
    );
  };

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
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (userError || !user) {
        throw new Error(copy("Sua sessão expirou. Entre novamente.", "Your session expired. Sign in again.", "Tu sesión expiró. Inicia sesión de nuevo."));
      }

      const { data: usernameRows, error: usernameError } = await supabase
        .from("profile_usernames")
        .select("user_id")
        .ilike("username", normalized)
        .limit(1);
      if (usernameError) throw usernameError;
      if ((usernameRows?.length ?? 0) > 0) {
        setError(t("auth.errors.usernameTaken"));
        return;
      }

      let favoriteGames: Array<{ id: string; slug: string }> = [];
      if (favoriteGameSlugs.length > 0) {
        const { data: gameRows, error: gamesError } = await supabase
          .from("games")
          .select("id,slug")
          .in("slug", favoriteGameSlugs)
          .eq("active", true);

        if (gamesError) throw gamesError;
        favoriteGames = gameRows ?? [];

        if (favoriteGames.length !== favoriteGameSlugs.length) {
          throw new Error(
            copy(
              "Não foi possível localizar todos os jogos escolhidos.",
              "Could not find every selected game.",
              "No se pudieron encontrar todos los juegos elegidos.",
            ),
          );
        }
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: normalized,
          display_name: displayName.trim(),
          language,
          theme_preference: "system",
          visibility: "public",
          profile_background: "mgp-grid",
        })
        .select("username")
        .single();

      if (profileError) {
        if (profileError.code === "23505") {
          setError(t("auth.errors.usernameTaken"));
          return;
        }
        throw profileError;
      }

      if (favoriteGames.length > 0) {
        const rows = favoriteGames.map((game) => ({
          user_id: user.id,
          game_id: game.id,
          profile_data: { favorite: true },
          visibility: "public",
        }));
        const { error: favoritesError } = await supabase
          .from("game_profiles")
          .upsert(rows, { onConflict: "user_id,game_id" });

        // Favorite-game selection must never trap a user after the profile itself was created.
        if (favoritesError) console.error("[MGP onboarding] favorite games:", favoritesError);
      }

      setLocale(language);
      await router.navigate({ to: "/u/$username", params: { username: profile.username } });
    } catch (err) {
      console.error("[MGP onboarding] profile creation:", err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : copy(
              "Não foi possível concluir seu perfil. Tente novamente.",
              "Could not finish your profile. Try again.",
              "No se pudo completar tu perfil. Inténtalo de nuevo.",
            ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center px-4 py-12">
      <Card className="w-full overflow-hidden border-border/80 shadow-lift">
        <CardHeader className="border-b border-border bg-muted/20 px-6 py-7 text-center sm:px-8">
          <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
          <CardTitle className="font-display text-2xl sm:text-3xl">{t("auth.onboarding.title")}</CardTitle>
          <CardDescription className="mx-auto max-w-xl">
            {copy(
              "Escolha seu nome no MGP e marque os jogos que já fazem parte da sua identidade gamer.",
              "Choose your MGP name and mark the games that are already part of your gamer identity.",
              "Elige tu nombre en MGP y marca los juegos que ya forman parte de tu identidad gamer.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-5">
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
                  placeholder={copy("Como você quer aparecer", "How you want to appear", "Cómo quieres aparecer")}
                  required
                />
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

              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-relaxed text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <Gamepad2 className="size-4 text-gold-strong" />
                  {copy("Seu perfil começa aqui", "Your profile starts here", "Tu perfil empieza aquí")}
                </div>
                {copy(
                  "Depois você poderá completar builds, agentes, chefes favoritos e outras informações dentro de cada Game Profile.",
                  "Later you can complete builds, agents, favorite bosses and other details inside each Game Profile.",
                  "Después podrás completar builds, agentes, jefes favoritos y otros datos dentro de cada Game Profile.",
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="section-kicker">{copy("JOGOS FAVORITOS", "FAVORITE GAMES", "JUEGOS FAVORITOS")}</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                  {copy("O que você joga?", "What do you play?", "¿Qué juegas?")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy(
                    "Escolha quantos quiser. Você pode mudar isso depois.",
                    "Choose as many as you want. You can change this later.",
                    "Elige todos los que quieras. Puedes cambiarlo después.",
                  )}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {GAMES.map((game) => {
                  const selected = favoriteGameSlugs.includes(game.slug);
                  return (
                    <button
                      key={game.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleFavorite(game.slug)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border bg-surface text-left transition duration-200",
                        selected
                          ? "border-gold/70 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-gold)_35%,transparent)]"
                          : "border-border hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-soft",
                      )}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <GameArtwork game={game} className="h-full w-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                        <span
                          className={cn(
                            "absolute right-3 top-3 grid size-7 place-items-center rounded-full border backdrop-blur transition",
                            selected
                              ? "border-gold bg-gold text-gold-foreground"
                              : "border-white/20 bg-black/35 text-white/70",
                          )}
                        >
                          <Check className={cn("size-4", !selected && "opacity-0")} />
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-display text-sm font-semibold text-foreground">{game.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{game.genre}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full sm:w-auto sm:min-w-52" disabled={loading}>
                {loading ? t("common.loading") : t("auth.onboarding.finish")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
