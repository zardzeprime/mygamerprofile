import { ExternalLink, Gamepad2, Package, ShieldCheck, Trophy } from "lucide-react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import type { PublicSteamShowcase } from "@/lib/steamSync.functions";

function hours(minutes: number | null) {
  if (!minutes) return "0h";
  if (minutes < 60) return `${minutes}m`;
  const value = minutes / 60;
  return value >= 100 ? `${Math.round(value)}h` : `${value.toFixed(1)}h`;
}

export function SteamProfileShowcase({
  steam,
  locale,
}: {
  steam: PublicSteamShowcase;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const achievement = steam.achievementSummary;

  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-muted/25 text-gold-strong">
            <Gamepad2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-lg font-semibold">Steam</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-emerald-500">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {copy("Vinculada", "Linked", "Vinculada")}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {steam.personaName || copy("Conta Steam", "Steam account", "Cuenta de Steam")}
            </p>
          </div>
        </div>

        {steam.profileUrl ? (
          <a
            href={steam.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline"
          >
            {copy("Abrir na Steam", "Open on Steam", "Abrir en Steam")}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <Metric
          label={copy("Nível Steam", "Steam level", "Nivel de Steam")}
          value={steam.steamLevel ?? "—"}
        />
        <Metric
          label={copy("Jogos importados", "Imported games", "Juegos importados")}
          value={steam.games.length}
        />
        <Metric
          label={copy("Conquistas", "Achievements", "Logros")}
          value={achievement ? `${achievement.unlocked}/${achievement.total}` : "—"}
        />
        <Metric
          label={copy("Insígnias", "Badges", "Insignias")}
          value={steam.badgeCount ?? "—"}
        />
      </div>

      {steam.games.length > 0 ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-4 text-gold-strong" aria-hidden="true" />
            <h3 className="font-display text-sm font-semibold">
              {copy("Mais jogados", "Most played", "Más jugados")}
            </h3>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {steam.games.slice(0, 9).map((game) => (
              <div
                key={game.appId}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/15 p-3"
              >
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-background">
                  {game.iconUrl ? (
                    <img src={game.iconUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <Gamepad2 className="size-4 text-muted-foreground" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{game.name}</span>
                  <span className="block truncate text-[0.7rem] text-muted-foreground">
                    {game.playtimeMinutes !== null
                      ? `${hours(game.playtimeMinutes)} · `
                      : ""}
                    {game.achievementsTotal
                      ? `${game.achievementsUnlocked ?? 0}/${game.achievementsTotal} ${copy("conquistas", "achievements", "logros")}`
                      : copy("sem conquistas sincronizadas", "no synced achievements", "sin logros sincronizados")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {steam.recentGames.length > 0 ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-gold-strong" aria-hidden="true" />
            <h3 className="font-display text-sm font-semibold">
              {copy("Jogados recentemente", "Recently played", "Jugados recientemente")}
            </h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {steam.recentGames.map((game) => (
              <span
                key={game.appId}
                className="rounded-full border border-border bg-muted/15 px-3 py-1.5 text-xs text-muted-foreground"
              >
                <strong className="text-foreground">{game.name}</strong>
                {" · "}
                {hours(game.recentMinutes)}
                {" "}
                {copy("nas últimas 2 semanas", "in the last 2 weeks", "en las últimas 2 semanas")}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {(steam.inventoryItemCount ?? 0) > 0 ? (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <Package className="size-4 text-gold-strong" aria-hidden="true" />
          {copy("Itens públicos sincronizados:", "Public items synced:", "Objetos públicos sincronizados:")}
          <strong className="text-foreground">{steam.inventoryItemCount}</strong>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
