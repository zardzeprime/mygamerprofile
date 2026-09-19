import { Link } from "@tanstack/react-router";
import { useI18n, type TranslationKey } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const TABS: { to: string; key: TranslationKey | null; label?: [string, string, string] }[] = [
  { to: "/settings/profile", key: "settings.profile" },
  { to: "/settings/identity", key: null, label: ["Dados & privacidade", "Data & privacy", "Datos y privacidad"] },
  { to: "/settings/account", key: "settings.account" },
  { to: "/settings/connections", key: null, label: ["Conexões", "Connections", "Conexiones"] },
  { to: "/settings/appearance", key: "settings.appearance" },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

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
              {tab.key
                ? t(tab.key)
                : tab.label
                  ? copy(...tab.label)
                  : copy("Conexões", "Connections", "Conexiones")}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}
