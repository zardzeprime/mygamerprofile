import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { getAuthRedirectUrl } from "@/lib/siteUrl";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Recuperar senha — MGP" },
      { name: "description", content: "Recupere sua senha do My Gamer Profile." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function ForgotPasswordPage() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl("/"),
    });
    setLoading(false);
    if (resetError) {
      const message = (resetError.message || "").toLowerCase();
      const deliveryUnavailable =
        message.includes("email address not authorized") ||
        message.includes("smtp") ||
        message.includes("email rate limit") ||
        message.includes("error sending");

      setError(
        deliveryUnavailable
          ? copy(
              "A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.",
              "Email recovery is temporarily unavailable. Please try again later.",
              "La recuperación por correo está temporalmente no disponible. Inténtalo de nuevo más tarde.",
            )
          : resetError.message || t("auth.errors.generic"),
      );
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogoPlaceholder size="lg" className="mx-auto mb-4" />
          <CardTitle className="font-display text-2xl">{t("auth.forgotPassword")}</CardTitle>
          <CardDescription>MGP — {t("brand.full")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">{t("auth.resetSent")}</p>
              <Link to="/login" className="text-gold hover:underline">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.submitReset")}
              </Button>
              <div className="text-center text-sm">
                <Link to="/login" className="text-gold hover:underline">
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
