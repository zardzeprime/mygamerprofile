import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { signInWithGoogle } from "@/lib/googleAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — MGP" },
      { name: "description", content: "Entre na sua conta do ÍMPAR." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function LoginPage() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setOauthLoading(true);
    setError("");
    try {
      await signInWithGoogle("/onboarding");
    } catch {
      setOauthLoading(false);
      setError(
        copy(
          "Não foi possível iniciar o login com Google agora. Tente novamente.",
          "Could not start Google sign-in right now. Please try again.",
          "No se pudo iniciar sesión con Google ahora. Inténtalo de nuevo.",
        ),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !data.user) {
      setLoading(false);
      setError(t("auth.errors.invalidCredentials"));
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", data.user.id)
      .maybeSingle();

    setLoading(false);
    if (profileError) {
      setError(t("auth.errors.generic"));
      return;
    }

    if (!profile) {
      router.navigate({ to: "/onboarding" });
      return;
    }

    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
          <CardTitle className="font-display text-2xl">{t("auth.login")}</CardTitle>
          <CardDescription>ÍMPAR — {t("brand.full")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
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
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || oauthLoading}>
              {loading ? t("common.loading") : t("auth.submitLogin")}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            <Link to="/forgot-password" className="text-gold hover:underline">
              {t("auth.forgotPassword")}
            </Link>
            <Link to="/register" className="text-gold hover:underline">
              {t("auth.needAccount")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
