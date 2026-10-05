import { Clock3, Crown, ExternalLink, Gamepad2, Package, ShieldCheck, Trophy } from "lucide-react";
import { useState } from "react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import type { PublicSteamShowcase } from "@/lib/steamSync.functions";
import { cn } from "@/lib/utils";

function hours(minutes: number | null) {
  if (!minutes) return "0h";
  if (minutes < 60) return `${minutes}m`;
  const value = minutes / 60;
  return value >= 100 ? `${Math.round(value)}h` : `${value.toFixed(1)}h`;
}

function steamHeader(appId: number) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
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
  const libraryShared =
    steam.showLibrary ?? (steam.libraryGameCount !== null || steam.games.length > 0);
  const playtimeShared =
    steam.showPlaytime ??
    (steam.games.some((game) => game.playtimeMinutes !== null) || steam.recentGames.length > 0);
  const achievementsShared = steam.showAchievements ?? steam.achievementSummary !== null;
  const badgesShared = steam.showBadges ?? (steam.steamLevel !== null || steam.badgeCount !== null);
  const hiddenValue = copy("Oculto", "Hidden", "Oculto");

  return (
    <section className="surface-panel overflow-hidden">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(102,192,244,.10),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(201,169,93,.11),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-[0.95rem_0.95rem_0.4rem_0.95rem] border border-white/10 bg-gradient-to-br from-[#18212c] to-[#0b1017] text-[#66c0f4] shadow-lg">
              <Gamepad2 className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-lg font-semibold">
                  {steam.personaName || "Steam"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-emerald-500">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {copy("Steam vinculada", "Steam linked", "Steam vinculada")}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy(
                  "Dados verificados da conta conectada",
                  "Verified data from the connected account",
                  "Datos verificados de la cuenta conectada",
                )}
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
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5 sm:p-5">
        <Metric
          icon={Crown}
          label={copy("Nível Steam", "Steam level", "Nivel Steam")}
          value={badgesShared ? (steam.steamLevel ?? "—") : hiddenValue}
        />
        <Metric
          icon={Gamepad2}
          label={copy("Biblioteca", "Library", "Biblioteca")}
          value={libraryShared ? (steam.libraryGameCount ?? steam.games.length) : hiddenValue}
        />
        <Metric
          icon={Trophy}
          label={copy("Conquistas", "Achievements", "Logros")}
          value={achievementsShared ? (achievement ? achievement.unlocked : "—") : hiddenValue}
          {...(achievementsShared && achievement ? { helper: `/${achievement.total}` } : {})}
        />
        <Metric
          icon={ShieldCheck}
          label={copy("Jogos 100%", "100% games", "Juegos 100%")}
          value={achievementsShared ? (steam.perfectGames ?? "—") : hiddenValue}
        />
        <Metric
          icon={Package}
          label={copy("Insígnias", "Badges", "Insignias")}
          value={badgesShared ? (steam.badgeCount ?? "—") : hiddenValue}
        />
      </div>

      {steam.games.length > 0 ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-gold-strong" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold">
                  {playtimeShared
                    ? copy("Mais jogados", "Most played", "Más jugados")
                    : copy("Biblioteca", "Library", "Biblioteca")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {playtimeShared
                  ? copy(
                      "Sua vitrine é ordenada pelo tempo total jogado.",
                      "Your showcase is ordered by total playtime.",
                      "Tu vitrina está ordenada por tiempo total jugado.",
                    )
                  : copy(
                      "As horas estão ocultas; os jogos são exibidos em ordem alfabética.",
                      "Playtime is hidden; games are shown alphabetically.",
                      "Las horas están ocultas; los juegos se muestran en orden alfabético.",
                    )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {steam.games.slice(0, 9).map((game, index) => (
              <SteamGameCard
                key={game.appId}
                game={game}
                {...(playtimeShared ? { rank: index + 1 } : {})}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ) : null}

      {steam.recentGames.length > 0 ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-gold-strong" aria-hidden="true" />
            <h3 className="font-display text-sm font-semibold">
              {copy("Jogados recentemente", "Recently played", "Jugados recientemente")}
            </h3>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {steam.recentGames.map((game) => (
              <div
                key={game.appId}
                className="group relative min-w-0 overflow-hidden rounded-xl border border-border bg-muted/10"
              >
                <SteamBackdrop appId={game.appId} />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/82 to-background/55" />
                <div className="relative flex min-w-0 items-center gap-3 p-3">
                  <GameIcon iconUrl={game.iconUrl} name={game.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{game.name}</p>
                    <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
                      {hours(game.recentMinutes)}{" "}
                      {copy(
                        "nas últimas 2 semanas",
                        "in the last 2 weeks",
                        "en las últimas 2 semanas",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(steam.inventoryItems?.length ?? 0) > 0 ? (
        <div className="border-t border-border p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Package className="size-4 text-gold-strong" aria-hidden="true" />
                <h3 className="font-display text-sm font-semibold">
                  {copy("Inventário Steam", "Steam inventory", "Inventario de Steam")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy(
                  "Prévia dos itens que este perfil escolheu tornar públicos.",
                  "Preview of items this profile chose to make public.",
                  "Vista previa de los objetos que este perfil eligió hacer públicos.",
                )}
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {steam.inventoryItemCount ?? steam.inventoryItems?.length ?? 0}{" "}
              {copy("itens", "items", "objetos")}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {steam.inventoryItems?.map((item, index) => (
              <div
                key={`${item.appId}-${item.name ?? "item"}-${index}`}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted/10 p-3"
              >
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-black/20">
                  {item.iconUrl ? (
                    <img
                      src={item.iconUrl}
                      alt=""
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Package className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.name || copy("Item Steam", "Steam item", "Objeto de Steam")}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">
                    {steamInventoryGame(item.appId)}
                    {item.type ? ` · ${item.type}` : ""}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5 text-[0.62rem] font-semibold text-muted-foreground">
                    {item.amount > 1 ? <span>×{item.amount}</span> : null}
                    {item.tradable ? (
                      <span>{copy("Negociável", "Tradable", "Intercambiable")}</span>
                    ) : null}
                    {item.marketable ? (
                      <span>{copy("Mercado", "Marketable", "Comercializable")}</span>
                    ) : null}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (steam.inventoryItemCount ?? 0) > 0 ? (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <Package className="size-4 text-gold-strong" aria-hidden="true" />
          {copy(
            "Itens públicos sincronizados:",
            "Public items synced:",
            "Objetos públicos sincronizados:",
          )}
          <strong className="text-foreground">{steam.inventoryItemCount}</strong>
        </div>
      ) : null}
    </section>
  );
}

function SteamGameCard({
  game,
  rank,
  locale,
}: {
  game: PublicSteamShowcase["games"][number];
  rank?: number;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const percent =
    game.achievementPercent === null || game.achievementPercent === undefined
      ? null
      : Math.max(0, Math.min(100, Number(game.achievementPercent)));

  return (
    <article className="group relative min-h-40 overflow-hidden rounded-[1rem_1rem_0.45rem_1rem] border border-border bg-[#0c0f13] transition duration-200 hover:-translate-y-0.5 hover:border-gold/30">
      <SteamBackdrop appId={game.appId} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/78 to-[#090b0e]/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/28 to-transparent" />

      <div className="relative flex min-h-40 flex-col justify-between p-3.5">
        <div className="flex items-start justify-between gap-3">
          {rank ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/35 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-white/75 backdrop-blur">
              {rank <= 3 ? `TOP ${rank}` : `#${rank}`}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          {percent === 100 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-black/45 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-gold-strong backdrop-blur">
              <Trophy className="size-3" />
              100%
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 items-end gap-3">
          <GameIcon iconUrl={game.iconUrl} name={game.name} large />
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-display text-sm font-semibold text-white">{game.name}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-white/62">
              {game.playtimeMinutes !== null ? <span>{hours(game.playtimeMinutes)}</span> : null}
              {game.achievementsTotal ? (
                <span>
                  {game.achievementsUnlocked ?? 0}/{game.achievementsTotal}{" "}
                  {copy("conquistas", "achievements", "logros")}
                </span>
              ) : null}
            </div>
            {percent !== null && game.achievementsTotal ? (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold transition-[width]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function steamInventoryGame(appId: number) {
  if (appId === 753) return "Steam Community";
  if (appId === 730) return "Counter-Strike 2";
  if (appId === 570) return "Dota 2";
  if (appId === 440) return "Team Fortress 2";
  return `Steam App ${appId}`;
}

function SteamBackdrop({ appId }: { appId: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(102,192,244,.16),transparent_35%),radial-gradient(circle_at_18%_82%,rgba(201,169,93,.10),transparent_28%),linear-gradient(145deg,#171a20,#090b0e)]" />
    );
  }
  return (
    <img
      src={steamHeader(appId)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover opacity-68 transition duration-300 group-hover:scale-[1.025] group-hover:opacity-80"
    />
  );
}

function GameIcon({
  iconUrl,
  name,
  large = false,
}: {
  iconUrl: string | null;
  name: string;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl border border-white/12 bg-black/38 p-1.5 shadow-lg backdrop-blur",
        large ? "size-12" : "size-10",
      )}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-[0.62rem] font-bold uppercase text-white/65">{name.slice(0, 2)}</span>
      )}
    </span>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Gamepad2;
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <div className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="size-3.5 text-gold-strong" />
        {label}
      </div>
      <p className="mt-2 font-display text-xl font-bold">
        {value}
        {helper ? (
          <span className="ml-1 text-xs font-medium text-muted-foreground">{helper}</span>
        ) : null}
      </p>
    </div>
  );
}
