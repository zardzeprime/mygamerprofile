import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — MGP" },
      { name: "description", content: "Entre na sua conta do My Gamer Profile." },
    ],
  }),
});

function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(t("auth.errors.invalidCredentials"));
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
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
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
