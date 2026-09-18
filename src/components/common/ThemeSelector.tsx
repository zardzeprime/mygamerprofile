import { Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { DEFAULT_ACCENT_COLOR, useTheme, type ThemePreference } from "@/lib/theme";
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
    <div className="inline-flex max-w-full flex-wrap items-center gap-1.5">
      <div
        role="group"
        aria-label={t("settings.theme")}
        className="inline-flex items-center gap-1 rounded-[0.9rem_0.9rem_0.42rem_0.9rem] border border-border bg-surface p-1"
      >
        {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              aria-label={t(labelKey)}
              onClick={() => setPreference(value)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-[0.7rem_0.7rem_0.3rem_0.7rem] px-2.5 py-1.5 text-xs font-semibold transition-[background-color,color,transform,border-color] duration-200 active:scale-95",
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

      <div className="inline-flex items-center gap-1 rounded-[0.9rem_0.9rem_0.42rem_0.9rem] border border-border bg-surface p-1">
        <label
          className={cn(
            "relative inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[0.7rem_0.7rem_0.3rem_0.7rem] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 px-2.5 text-xs font-semibold text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground active:scale-95",
            accentColor && "text-foreground",
          )}
          title={pickerLabel}
        >
          <Palette aria-hidden="true" className="size-4" />
          {showLabels ? <span>{pickerLabel}</span> : null}
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: accentColor ?? DEFAULT_ACCENT_COLOR }}
          />
          <input
            type="color"
            value={accentColor ?? DEFAULT_ACCENT_COLOR}
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
            className="grid size-10 place-items-center rounded-[0.7rem_0.7rem_0.3rem_0.7rem] text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-muted hover:text-foreground active:scale-95"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

