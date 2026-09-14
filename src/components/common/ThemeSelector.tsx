import { Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; icon: typeof Sun; labelKey: "theme.light" | "theme.dark" | "theme.system" }[] = [
  { value: "light", icon: Sun, labelKey: "theme.light" },
  { value: "dark", icon: Moon, labelKey: "theme.dark" },
  { value: "system", icon: Monitor, labelKey: "theme.system" },
];

export function ThemeSelector({ showLabels = false }: { showLabels?: boolean }) {
  const { preference, setPreference } = useTheme();
  const { t } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={t("settings.theme")}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(labelKey)}
            onClick={() => setPreference(value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-gold-soft text-gold-strong"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {showLabels ? <span>{t(labelKey)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
