import { Link } from "@tanstack/react-router";
import { Menu, Search, X, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { useI18n, type TranslationKey } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/common/UserAvatar";
import { AudioControl } from "@/components/common/AudioControl";

const NAV: { to: string; key: TranslationKey }[] = [
  { to: "/", key: "navigation.home" },
  { to: "/games", key: "navigation.games" },
  { to: "/games", key: "navigation.communities" },
  { to: "/lfg", key: "navigation.lfg" },
];

export function AppHeader() {
  const { t } = useI18n();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const AuthSection = () => {
    if (loading) return null;
    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">{t("auth.login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">{t("auth.register")}</Link>
          </Button>
        </div>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("navigation.menu")}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 text-sm font-medium transition-colors hover:bg-muted"
          >
            <UserAvatar user={user} size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/settings/profile" className="flex items-center gap-2">
              <Settings className="size-4" />
              {t("navigation.settings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
            <LogOut className="size-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
        <BrandLogoPlaceholder />

        <nav aria-label={t("navigation.menu")} className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-gold-soft/60 text-gold-strong" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
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
          <AudioControl />
          <div className="hidden lg:block">
            <AuthSection />
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
                key={item.key}
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
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSelector />
              <ThemeSelector />
              <AudioControl />
            </div>
            {!loading && !user && (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    {t("auth.register")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t("auth.login")}
                  </Link>
                </Button>
              </div>
            )}
            {!loading && user && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                  <Link to="/settings/profile" onClick={() => setOpen(false)}>
                    <Settings className="mr-2 size-4" />
                    {t("navigation.settings")}
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => { signOut(); setOpen(false); }}>
                  <LogOut className="mr-2 size-4" />
                  {t("auth.logout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
