import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/i18n";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AudioControl } from "@/components/common/AudioControl";

export const Route = createFileRoute("/_authenticated/settings/appearance")({
  head: () => ({
    meta: [
      { title: "Aparência — MGP" },
      { name: "description", content: "Personalize a aparência do My Gamer Profile." },
    ],
  }),
  component: SettingsAppearancePage,
});

function SettingsAppearancePage() {
  const { t } = useI18n();
  const { preference, setPreference } = useTheme();

  return (
    <SettingsLayout>
      <div className="surface-panel rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">{t("settings.appearance")}</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">{t("settings.theme")}</Label>
            <RadioGroup value={preference} onValueChange={(value) => setPreference(value as "light" | "dark" | "system")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">{t("theme.light")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">{t("theme.dark")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">{t("theme.system")}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="border-t border-border pt-4">
            <Label className="mb-3 block">Áudio</Label>
            <AudioControl />
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
