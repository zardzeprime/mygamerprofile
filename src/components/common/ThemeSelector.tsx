import { Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; icon: typeof Sun; labelKey: "theme.light" | "theme.dark" | "theme.system" }[] = [
  { value: "light", icon: Sun, labelKey: "theme.light" },
  { value: "dark", icon: Moon, labelKey: "theme.dark" },
  { value: "system", icon: Monitor, labelKey: "theme.system" },
];

export function ThemeSelector({ showLabels = false }: { showLabels?: boolean }) {
  const {
    preference,
    accentColor,
    setPreference,
    setAccentColor,
    resetAccentColor,
  } = useTheme();
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const pickerLabel = copy("Personalizar cor", "Customize color", "Personalizar color");
  const resetLabel = copy("Restaurar cor padrão", "Reset default color", "Restaurar color predeterminado");

  return (
    <div className="inline-flex items-center gap-1.5">
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
                "inline-flex min-h-8 items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-[background-color,color,transform] duration-200 active:scale-95",
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

      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        <label
          className={cn(
            "relative inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-2.5 text-xs font-semibold text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground active:scale-95",
            accentColor && "text-foreground",
          )}
          title={pickerLabel}
        >
          <Palette aria-hidden="true" className="size-4" />
          {showLabels ? <span>{pickerLabel}</span> : null}
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: accentColor ?? "#d4a72c" }}
          />
          <input
            type="color"
            value={accentColor ?? "#d4a72c"}
            onChange={(event) => setAccentColor(event.target.value)}
            aria-label={pickerLabel}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>

        {accentColor ? (
          <button
            type="button"
            onClick={resetAccentColor}
            aria-label={resetLabel}
            title={resetLabel}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-muted hover:text-foreground active:scale-95"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
