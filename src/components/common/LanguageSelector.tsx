import { Check, ChevronDown, Languages } from "lucide-react";
import { LOCALES, LOCALE_LABELS, useI18n, type Locale } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const SHORT_LABELS: Record<Locale, string> = { "pt-BR": "PT", en: "EN" };

export function LanguageSelector({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { locale, setLocale, t } = useI18n();

  if (variant === "full") {
    return (
      <div role="radiogroup" aria-label={t("settings.language")} className="flex flex-wrap gap-2">
        {LOCALES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={locale === value}
            onClick={() => setLocale(value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              locale === value
                ? "border-gold bg-gold-soft font-semibold text-gold-strong"
                : "border-border bg-surface font-medium text-muted-foreground hover:border-gold/40 hover:text-foreground",
            )}
          >
            {LOCALE_LABELS[value]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("settings.language")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-gold/40 hover:bg-elevated focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Languages aria-hidden="true" className="size-4 text-muted-foreground" />
          <span>{SHORT_LABELS[locale]}</span>
          <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-56 rounded-xl border-border bg-popover p-1.5 shadow-lift"
      >
        {LOCALES.map((value) => {
          const selected = locale === value;
          return (
            <DropdownMenuItem
              key={value}
              onSelect={() => setLocale(value)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 outline-none",
                "focus:bg-elevated focus:text-foreground",
                selected && "bg-gold-soft/55 text-gold-strong",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold">{LOCALE_LABELS[value]}</span>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {value === "pt-BR" ? "PT-BR" : "EN"}
                </span>
              </span>
              {selected ? <Check aria-hidden="true" className="size-4 shrink-0 text-gold-strong" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
