import { Link } from "@tanstack/react-router";
import { useI18n, type TranslationKey } from "@/i18n";

const TABS: { to: string; key: TranslationKey }[] = [
  { to: "/settings/profile", key: "settings.profile" },
  { to: "/settings/account", key: "settings.account" },
  { to: "/settings/appearance", key: "settings.appearance" },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">{t("settings.title")}</h1>
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <nav aria-label={t("settings.title")} className="flex flex-row gap-2 overflow-x-auto md:flex-col">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              activeProps={{ className: "bg-gold-soft/60 text-gold-strong" }}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(tab.key)}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}
