import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { useI18n, type TranslationKey } from "@/i18n";

const NAV: { to: string; key: TranslationKey }[] = [
  { to: "/", key: "navigation.home" },
  { to: "/games", key: "navigation.games" },
];

export function AppHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <BrandLogoPlaceholder />

        <nav aria-label={t("navigation.menu")} className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-gold-soft/60 text-gold-strong" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            <span className="sr-only">{t("common.search")}</span>
            <input
              type="search"
              placeholder={t("common.search")}
              className="w-28 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground lg:w-40"
            />
          </label>
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <ThemeSelector />
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t("navigation.closeMenu") : t("navigation.openMenu")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {open ? (
              <X aria-hidden="true" className="size-4" />
            ) : (
              <Menu aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-4 py-4 lg:hidden">
          <nav aria-label={t("navigation.menu")} className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-gold-strong" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <LanguageSelector />
            <ThemeSelector />
          </div>
        </div>
      ) : null}
    </header>
  );
}
