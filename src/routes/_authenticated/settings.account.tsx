import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings/account")({
  head: () => ({
    meta: [
      { title: "Configurações de conta — ÍMPAR" },
      { name: "description", content: "Gerencie sua conta no ÍMPAR." },
    ],
  }),
  component: SettingsAccountPage,
});

function SettingsAccountPage() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirm) {
      setError(t("settings.account.passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("auth.errors.weakPassword"));
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setError(t("settings.account.passwordError"));
      return;
    }
    setMessage(t("settings.account.passwordUpdated"));
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
  };

  return (
    <SettingsLayout>
      <div className="surface-panel rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">{t("settings.account")}</h2>
        <div className="space-y-4">
          <div>
            <Label>{t("settings.account.email")}</Label>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 border-t border-border pt-4">
            <h3 className="font-medium">{t("settings.account.changePassword")}</h3>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("settings.account.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-success">{message}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : t("settings.account.changePassword")}
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <Button variant="destructive" onClick={signOut}>
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
