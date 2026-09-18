import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Check, Gamepad2, ShieldCheck } from "lucide-react";
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
import { LEGAL_ACCEPTANCE_VERSION } from "@/config/legal";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Complete seu perfil — MGP" },
      { name: "description", content: "Finalize seu perfil no My Gamer Profile." },
    ],
  }),
});

type OnboardingRpcClient = {
  rpc: (
    fn: "complete_mgp_onboarding_v1",
    args: {
      p_username: string;
      p_display_name: string;
      p_language: Locale;
      p_birth_date: string;
      p_gender_identity: GenderIdentity;
      p_gender_custom_label: string | null;
      p_favorite_game_slugs: string[];
    },
  ) => Promise<{
    data: Array<{ username: string; display_name: string }> | null;
    error: { code?: string; message?: string } | null;
  }>;
};

type GenderIdentity = "male" | "female" | "non_binary" | "custom" | "prefer_not_to_say";

function ageFromBirthDate(value: string, today = new Date()) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

function OnboardingPage() {
  const { t, locale, setLocale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity>("prefer_not_to_say");
  const [customGender, setCustomGender] = useState("");
  const [language, setLanguage] = useState<Locale>(locale);
  const [favoriteGameSlugs, setFavoriteGameSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [error, setError] = useState("");

  const age = birthDate ? ageFromBirthDate(birthDate) : null;
  const minorNeedsSupervision = age !== null && age >= 13 && age < 18;

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

    if (!acceptedLegal) {
      setError(
        copy(
          "Você precisa aceitar os Termos de Uso e a Política de Privacidade para concluir seu perfil.",
          "You need to accept the Terms of Use and Privacy Policy to finish your profile.",
          "Debes aceptar los Términos de Uso y la Política de Privacidad para completar tu perfil.",
        ),
      );
      return;
    }

    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      setError(t("auth.errors.invalidUsername"));
      return;
    }
    if (!displayName.trim()) {
      setError(t("auth.errors.generic"));
      return;
    }

    if (genderIdentity === "custom" && !customGender.trim()) {
      setError(copy("Descreva seu gênero personalizado ou escolha outra opção.", "Describe your custom gender or choose another option.", "Describe tu género personalizado o elige otra opción."));
      return;
    }

    const calculatedAge = ageFromBirthDate(birthDate);
    if (calculatedAge === null || calculatedAge > 120 || calculatedAge < 0) {
      setError(copy("Informe uma data de nascimento válida.", "Enter a valid birth date.", "Ingresa una fecha de nacimiento válida."));
      return;
    }
    if (calculatedAge < 13) {
      setError(
        copy(
          "O MGP não permite criação de conta para menores de 13 anos.",
          "MGP does not allow account creation for users under 13.",
          "MGP no permite crear cuentas a menores de 13 años.",
        ),
      );
      return;
    }

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (userError || !user) {
        throw new Error(copy("Sua sessão expirou. Entre novamente.", "Your session expired. Sign in again.", "Tu sesión expiró. Inicia sesión de nuevo."));
      }

      const acceptedAt = new Date().toISOString();
      const { error: legalMetadataError } = await supabase.auth.updateUser({
        data: {
          legal_terms_version: LEGAL_ACCEPTANCE_VERSION,
          legal_accepted_at: acceptedAt,
        },
      });
      if (legalMetadataError) throw legalMetadataError;

      const { data: usernameRows, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", normalized)
        .limit(1);
      if (usernameError) throw usernameError;
      if ((usernameRows?.length ?? 0) > 0) {
        setError(t("auth.errors.usernameTaken"));
        return;
      }

      const onboardingClient = supabase as unknown as OnboardingRpcClient;
      const { data: onboardingRows, error: onboardingError } = await onboardingClient.rpc(
        "complete_mgp_onboarding_v1",
        {
          p_username: normalized,
          p_display_name: displayName.trim(),
          p_language: language,
          p_birth_date: birthDate,
          p_gender_identity: genderIdentity,
          p_gender_custom_label:
            genderIdentity === "custom" ? customGender.trim().slice(0, 60) : null,
          p_favorite_game_slugs: favoriteGameSlugs,
        },
      );

      if (onboardingError) {
        if (onboardingError.message?.includes("MGP_USERNAME_TAKEN")) {
          setError(t("auth.errors.usernameTaken"));
          return;
        }
        throw new Error(
          onboardingError.message ||
            copy(
              "Não foi possível concluir seu perfil com segurança.",
              "Could not securely complete your profile.",
              "No se pudo completar tu perfil de forma segura.",
            ),
        );
      }

      const profile = onboardingRows?.[0];
      if (!profile?.username) {
        throw new Error(
          copy(
            "O perfil não retornou um username válido.",
            "The profile did not return a valid username.",
            "El perfil no devolvió un nombre de usuario válido.",
          ),
        );
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
                <Label htmlFor="birthDate">{copy("Data de nascimento", "Date of birth", "Fecha de nacimiento")}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  autoComplete="bday"
                  required
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Usada de forma privada para segurança etária e regras da comunidade. Ela não aparece no seu perfil e não deve ser usada para personalizar anúncios.",
                    "Used privately for age safety and community rules. It is not shown on your profile and must not be used to personalize ads.",
                    "Se usa de forma privada para seguridad por edad y reglas de la comunidad. No aparece en tu perfil ni debe usarse para personalizar anuncios.",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genderIdentity">{copy("Gênero", "Gender", "Género")}</Label>
                <Select value={genderIdentity} onValueChange={(value) => setGenderIdentity(value as GenderIdentity)}>
                  <SelectTrigger id="genderIdentity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{copy("Masculino", "Male", "Masculino")}</SelectItem>
                    <SelectItem value="female">{copy("Feminino", "Female", "Femenino")}</SelectItem>
                    <SelectItem value="non_binary">{copy("Não binário", "Non-binary", "No binario")}</SelectItem>
                    <SelectItem value="custom">{copy("Personalizado", "Custom", "Personalizado")}</SelectItem>
                    <SelectItem value="prefer_not_to_say">{copy("Prefiro não dizer", "Prefer not to say", "Prefiero no decirlo")}</SelectItem>
                  </SelectContent>
                </Select>
                {genderIdentity === "custom" ? (
                  <Input
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value.slice(0, 60))}
                    placeholder={copy("Como você prefere descrever", "How you prefer to describe it", "Cómo prefieres describirlo")}
                    maxLength={60}
                  />
                ) : null}
                <p className="text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Opcional para sua experiência de conta, mantido de forma privada e fora da segmentação de anúncios.",
                    "Optional account information, kept private and excluded from ad targeting.",
                    "Información opcional de la cuenta, privada y excluida de la segmentación publicitaria.",
                  )}
                </p>
              </div>

              {minorNeedsSupervision ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm leading-relaxed text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-amber-500" />
                    {copy("Conta de adolescente", "Teen account", "Cuenta adolescente")}
                  </div>
                  {copy(
                    "Contas de 13 a 17 anos ficam sujeitas às regras de supervisão do MGP. Recursos sociais sensíveis podem permanecer restritos até a confirmação de um responsável conforme a faixa etária e a legislação aplicável.",
                    "Accounts ages 13–17 are subject to MGP supervision rules. Sensitive social features may remain restricted until guardian confirmation according to age and applicable law.",
                    "Las cuentas de 13 a 17 años están sujetas a las reglas de supervisión de MGP. Algunas funciones sociales pueden permanecer restringidas hasta la confirmación de un responsable.",
                  )}
                </div>
              ) : null}
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
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-muted/15 p-3">
                <input
                  id="onboarding-legal-acceptance"
                  type="checkbox"
                  checked={acceptedLegal}
                  onChange={(event) => setAcceptedLegal(event.target.checked)}
                  required
                  className="mt-1 size-4 shrink-0 accent-[var(--color-gold)]"
                />
                <Label
                  htmlFor="onboarding-legal-acceptance"
                  className="text-xs font-normal leading-5 text-muted-foreground"
                >
                  {copy("Li e aceito os", "I have read and accept the", "He leído y acepto los")}{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-gold-strong underline-offset-4 hover:underline"
                  >
                    {copy("Termos de Uso", "Terms of Use", "Términos de Uso")}
                  </Link>{" "}
                  {copy("e a", "and the", "y la")}{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-gold-strong underline-offset-4 hover:underline"
                  >
                    {copy("Política de Privacidade", "Privacy Policy", "Política de Privacidad")}
                  </Link>.
                </Label>
              </div>
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
