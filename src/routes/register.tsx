import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";

const PROD_SITE_URL = (import.meta.env["VITE_SITE_URL"] || "https://mygamerprofile.lovable.app").replace(/\/$/, "");

function getConfirmationRedirect() {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.origin}/onboarding`;
  }
  return `${PROD_SITE_URL}/onboarding`;
}

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
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
          emailRedirectTo: getConfirmationRedirect(),
          data: { i18n: locale },
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
              {copy("Confere seu e-mail", "Check your email", "Revisa tu correo")}
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
          <CardTitle className="font-display text-2xl">{t("auth.register")}</CardTitle>
          <CardDescription>MGP — {t("brand.full")}</CardDescription>
        </CardHeader>
        <CardContent>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
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
