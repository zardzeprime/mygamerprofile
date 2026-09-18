import { Link } from "@tanstack/react-router";
import { Check, Palette, Settings2 } from "lucide-react";

import { ThemeSelector } from "@/components/common/ThemeSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  DEFAULT_ACCENT_COLOR,
  useTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const QUICK_PALETTES = [
  { name: "MGP", color: null },
  { name: "Jade", color: "#22a875" },
  { name: "Íris", color: "#6488ea" },
  { name: "Ametista", color: "#ad78db" },
  { name: "Cobre", color: "#d78360" },
  { name: "Rubra", color: "#d65d69" },
] as const;

export function AppearanceQuickPanel() {
  const { locale } = useI18n();
  const { accentColor, setAccentColor, resetAccentColor } = useTheme();
  const copy = (pt: string, en: string, es: string) =>
    localeCopy(locale, pt, en, es);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="appearance-dial"
          aria-label={copy(
            "Personalizar aparência",
            "Customize appearance",
            "Personalizar apariencia",
          )}
          title={copy(
            "Personalizar aparência",
            "Customize appearance",
            "Personalizar apariencia",
          )}
        >
          <Palette className="size-4" aria-hidden="true" />
          <span
            className="appearance-dial-swatch"
            style={{ backgroundColor: accentColor ?? DEFAULT_ACCENT_COLOR }}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,23rem)] rounded-2xl border-border/80 bg-popover/96 p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-b border-border px-4 py-4">
          <p className="section-kicker">
            {copy("Interface pessoal", "Personal interface", "Interfaz personal")}
          </p>
          <h2 className="mt-1 font-display text-base font-semibold">
            {copy(
              "Seu MGP, sem trocar de página",
              "Your MGP, without leaving the page",
              "Tu MGP, sin salir de la página",
            )}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy(
              "Tema e cor são aplicados na hora. Logado, o estilo acompanha sua conta.",
              "Theme and color apply instantly. When signed in, your style follows your account.",
              "El tema y el color se aplican al instante. Con sesión iniciada, tu estilo sigue tu cuenta.",
            )}
          </p>
        </div>

        <div className="space-y-4 p-4">
          <ThemeSelector showLabels />

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {copy("Sinais da interface", "Interface signal", "Señal de interfaz")}
            </p>
            <div
              className="grid grid-cols-6 gap-2"
              role="group"
              aria-label={copy("Paletas rápidas", "Quick palettes", "Paletas rápidas")}
            >
              {QUICK_PALETTES.map((palette) => {
                const active = palette.color === accentColor;
                const label =
                  palette.color === null
                    ? copy("Original MGP", "Original MGP", "MGP original")
                    : palette.name;
                return (
                  <button
                    key={palette.name}
                    type="button"
                    aria-label={label}
                    aria-pressed={active}
                    onClick={() =>
                      palette.color
                        ? setAccentColor(palette.color)
                        : resetAccentColor()
                    }
                    className={cn(
                      "group relative grid aspect-square place-items-center rounded-xl border transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5",
                      active
                        ? "border-gold bg-gold-soft"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <span
                      className="size-5 rounded-full border border-black/10 shadow-sm"
                      style={{
                        backgroundColor:
                          palette.color ?? DEFAULT_ACCENT_COLOR,
                      }}
                      aria-hidden="true"
                    />
                    {active ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            to="/settings/appearance"
            className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-gold/45 hover:bg-muted"
          >
            <span>
              {copy(
                "Abrir personalização completa",
                "Open full customization",
                "Abrir personalización completa",
              )}
            </span>
            <Settings2 className="size-4 text-gold-strong" aria-hidden="true" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
