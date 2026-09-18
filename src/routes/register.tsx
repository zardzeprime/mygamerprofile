import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { LEGAL_ACCEPTANCE_VERSION } from "@/config/legal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { signInWithGoogle } from "@/lib/googleAuth";
import { getAuthRedirectUrl } from "@/lib/siteUrl";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Criar perfil — MGP" },
      { name: "description", content: "Crie sua conta no My Gamer Profile." },
    ],
  }),
});

function RegisterPage() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) =>
    localeCopy(locale, pt, en, es);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError("");
    if (!acceptedLegal) {
      setError(
        copy(
          "Você precisa aceitar os Termos de Uso e a Política de Privacidade antes de continuar com o Google.",
          "You need to accept the Terms of Use and Privacy Policy before continuing with Google.",
          "Debes aceptar los Términos de Uso y la Política de Privacidad antes de continuar con Google.",
        ),
      );
      return;
    }

    setOauthLoading(true);
    try {
      await signInWithGoogle("/onboarding");
    } catch (err) {
      setOauthLoading(false);
      setError(
        err instanceof Error && err.message
          ? err.message
          : copy(
              "Não foi possível iniciar o login com Google.",
              "Could not start Google sign-in.",
              "No se pudo iniciar sesión con Google.",
            ),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!acceptedLegal) {
      setError(
        copy(
          "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
          "You need to accept the Terms of Use and Privacy Policy.",
          "Debes aceptar los Términos de Uso y la Política de Privacidad.",
        ),
      );
      return;
    }
    if (password.length < 6) {
      setError(t("auth.errors.weakPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("/onboarding"),
          data: {
            i18n: locale,
            legal_terms_version: LEGAL_ACCEPTANCE_VERSION,
            legal_accepted_at: new Date().toISOString(),
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message || t("auth.errors.generic"));
        return;
      }

      if (!data.session) {
        setPendingEmail(email);
        return;
      }

      await router.navigate({ to: "/onboarding" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg overflow-hidden border-gold/20 shadow-lift">
          <CardHeader className="bg-gold/5 text-center">
            <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-gold-soft text-gold-strong">
              <MailCheck className="size-6" />
            </div>
            <CardTitle className="font-display text-2xl">
              {copy(
                "Confere seu e-mail",
                "Check your email",
                "Revisa tu correo",
              )}
            </CardTitle>
            <CardDescription className="mx-auto max-w-md leading-relaxed">
              {copy(
                `Enviamos a confirmação para ${pendingEmail}. Depois de confirmar, você segue direto para criar seu username e escolher seus jogos favoritos.`,
                `We sent a confirmation to ${pendingEmail}. After confirming, you can create your username and choose your favorite games.`,
                `Enviamos una confirmación a ${pendingEmail}. Después de confirmar, podrás crear tu username y elegir tus juegos favoritos.`,
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {copy(
                "Se não aparecer em alguns minutos, confira também a caixa de spam.",
                "If it does not arrive in a few minutes, check your spam folder too.",
                "Si no llega en unos minutos, revisa también la carpeta de spam.",
              )}
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">{t("auth.login")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
          <CardTitle className="font-display text-2xl">
            {t("auth.register")}
          </CardTitle>
          <CardDescription>MGP — {t("brand.full")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void handleGoogle()}
            disabled={oauthLoading || loading}
          >
            <span className="mr-2 grid size-5 place-items-center rounded-full border border-border bg-background text-xs font-bold">G</span>
            {oauthLoading
              ? t("common.loading")
              : copy("Continuar com Google", "Continue with Google", "Continuar con Google")}
          </Button>

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {copy("ou e-mail", "or email", "o correo")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/15 p-3">
              <input
                id="legal-acceptance"
                type="checkbox"
                checked={acceptedLegal}
                onChange={(event) => setAcceptedLegal(event.target.checked)}
                required
                className="mt-1 size-4 shrink-0 accent-[var(--color-gold)]"
              />
              <Label
                htmlFor="legal-acceptance"
                className="text-xs font-normal leading-5 text-muted-foreground"
              >
                {copy(
                  "Li e aceito os",
                  "I have read and accept the",
                  "He leído y acepto los",
                )}{" "}
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
                  {copy(
                    "Política de Privacidade",
                    "Privacy Policy",
                    "Política de Privacidad",
                  )}
                </Link>
                .
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || oauthLoading}>
              {loading ? t("common.loading") : t("auth.submitRegister")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-gold hover:underline">
              {t("auth.alreadyHaveAccount")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
