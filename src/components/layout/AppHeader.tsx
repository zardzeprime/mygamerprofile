import { Link } from "@tanstack/react-router";
import { Menu, Search, X, Settings, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { AppearanceQuickPanel } from "@/components/common/AppearanceQuickPanel";
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
import { supabase } from "@/integrations/supabase/client";

const NAV: { to: string; key: TranslationKey }[] = [
  { to: "/", key: "navigation.home" },
  { to: "/games", key: "navigation.games" },
  { to: "/communities", key: "navigation.communities" },
  { to: "/lfg", key: "navigation.lfg" },
];

export function AppHeader() {
  const { t, locale } = useI18n();
  const { user, loading, signOut } = useAuth();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButtonRef.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setProfileUsername(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    void Promise.resolve(supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle())
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[MGP] Failed to load current profile username", error);
          setProfileUsername(null);
          return;
        }
        setProfileUsername(data?.username ?? null);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profileLabel = locale === "pt-BR" ? "Ver meu perfil" : locale === "es" ? "Ver mi perfil" : "View my profile";
  const profileUnavailableLabel = locale === "pt-BR" ? "Perfil indisponível" : locale === "es" ? "Perfil no disponible" : "Profile unavailable";

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
          {profileUsername ? (
            <DropdownMenuItem asChild>
              <Link to="/u/$username" params={{ username: profileUsername }} className="flex items-center gap-2">
                <UserRound className="size-4" />
                {profileLabel}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <UserRound className="size-4" />
              {profileLoading ? profileLabel : profileUnavailableLabel}
            </DropdownMenuItem>
          )}
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
    <header ref={headerRef} className="mgp-header sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto grid h-[4.25rem] w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-6">
        <BrandLogoPlaceholder />

        <nav aria-label={t("navigation.menu")} className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "mgp-nav-link-active" }}
              className="mgp-nav-link px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <Link to="/games" className="mgp-header-action hidden min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground sm:flex" aria-label={t("games.search")}>
            <Search aria-hidden="true" className="size-4" />
            <span className="hidden 2xl:inline">{t("games.search")}</span>
          </Link>
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageSelector />
            <AppearanceQuickPanel />
          </div>
          <AudioControl />
          <div className="hidden xl:block">
            <AuthSection />
          </div>
          <button
            type="button"
            ref={menuButtonRef}
            aria-controls="site-mobile-navigation"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t("navigation.closeMenu") : t("navigation.openMenu")}
            className="mgp-icon-button inline-flex size-11 shrink-0 items-center justify-center text-foreground xl:hidden"
          >
            {open ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="site-mobile-navigation" className="mgp-mobile-panel max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-border bg-surface px-4 py-4 xl:hidden">
          <nav aria-label={t("navigation.menu")} className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "mgp-nav-link-active" }}
                className="mgp-nav-link rounded-lg px-3 py-2.5 text-sm font-medium text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSelector />
              <AppearanceQuickPanel />
              <AudioControl />
            </div>
            {!loading && !user ? (
              <div className="flex flex-col gap-2">
                <Button asChild><Link to="/register" onClick={() => setOpen(false)}>{t("auth.register")}</Link></Button>
                <Button variant="outline" asChild><Link to="/login" onClick={() => setOpen(false)}>{t("auth.login")}</Link></Button>
              </div>
            ) : null}
            {!loading && user ? (
              <div className="flex flex-col gap-2">
                {profileUsername ? (
                  <Button variant="outline" asChild>
                    <Link to="/u/$username" params={{ username: profileUsername }} onClick={() => setOpen(false)}>
                      <UserRound className="mr-2 size-4" />
                      {profileLabel}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <UserRound className="mr-2 size-4" />
                    {profileLoading ? profileLabel : profileUnavailableLabel}
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/settings/profile" onClick={() => setOpen(false)}>
                    <Settings className="mr-2 size-4" />
                    {t("navigation.settings")}
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => { void signOut(); setOpen(false); }}>
                  <LogOut className="mr-2 size-4" />
                  {t("auth.logout")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

