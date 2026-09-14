import { Languages } from "lucide-react";
import { LOCALES, LOCALE_LABELS, useI18n, type Locale } from "@/i18n";

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
            className={
              locale === value
                ? "rounded-full border border-gold bg-gold-soft px-4 py-2 text-sm font-semibold text-gold-strong"
                : "rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {LOCALE_LABELS[value]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5">
      <Languages aria-hidden="true" className="size-4 text-muted-foreground" />
      <span className="sr-only">{t("settings.language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="bg-transparent text-xs font-semibold text-foreground outline-none"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {SHORT_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
