import { Award, CalendarDays, Clock3, Star } from "lucide-react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export type PublicSteamGameHighlight = {
  appId: number;
  name: string;
  iconUrl: string | null;
  playtimeMinutes: number | null;
  startedYear: number | null;
  startedOn: string | null;
  achievements: Array<{
    apiName: string;
    name: string;
    description: string | null;
    unlockTime: string | null;
    iconUrl: string | null;
  }>;
};

export function SteamFavoriteGameHighlight({
  highlight,
  locale,
}: {
  highlight: PublicSteamGameHighlight;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const playingSince = highlight.startedOn
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${highlight.startedOn}T00:00:00Z`))
    : highlight.startedYear
      ? String(highlight.startedYear)
      : null;

  return (
    <section className="surface-panel overflow-hidden rounded-2xl">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.13),transparent_52%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-gold/25 bg-black/25">
            {highlight.iconUrl ? (
              <img src={highlight.iconUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Star className="size-7 text-gold-strong" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-gold-strong">
              <Star className="size-3.5" />
              {copy("Jogo principal", "Main game", "Juego principal")}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
              {highlight.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {playingSince ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-gold-strong" />
                  {copy("Joga desde", "Playing since", "Juega desde")} {playingSince}
                </span>
              ) : null}
              {highlight.playtimeMinutes != null ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-gold-strong" />
                  {Math.round(highlight.playtimeMinutes / 60)}h Steam
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {highlight.achievements?.length ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-gold-strong" />
            <h3 className="font-display text-base font-semibold text-foreground">
              {copy(
                "Conquistas que tenho orgulho",
                "Achievements I'm proud of",
                "Logros de los que me enorgullezco",
              )}
            </h3>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {highlight.achievements.slice(0, 3).map((achievement) => (
              <article
                key={achievement.apiName}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/10 p-3"
              >
                {achievement.iconUrl ? (
                  <img
                    src={achievement.iconUrl}
                    alt=""
                    className="size-11 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-background">
                    <Award className="size-4 text-muted-foreground" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-5 text-foreground">{achievement.name}</p>
                  {achievement.description ? (
                    <p className="mt-1 line-clamp-2 text-[0.68rem] leading-5 text-muted-foreground">
                      {achievement.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
