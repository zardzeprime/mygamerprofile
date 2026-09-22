import { Award, Gamepad2, Loader2, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type SteamGame = {
  app_id: number;
  name: string;
  icon_url: string | null;
  playtime_forever: number;
  achievements_unlocked: number;
  achievements_total: number;
};

type Achievement = {
  api_name: string;
  display_name: string | null;
  description: string | null;
  unlock_time: string | null;
  icon_url: string | null;
};

type Preference = {
  favorite_app_id: number | null;
  favorite_started_year: number | null;
  favorite_started_on: string | null;
  favorite_show_playtime: boolean;
  proud_achievement_api_names: string[];
};

export function SteamFavoriteGameEditor({
  userId,
  locale,
}: {
  userId: string;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const db = supabase;
  const [games, setGames] = useState<SteamGame[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [startedYear, setStartedYear] = useState("");
  const [startedOn, setStartedOn] = useState("");
  const [showPlaytime, setShowPlaytime] = useState(true);
  const [proud, setProud] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [achievementLoading, setAchievementLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [migrationMissing, setMigrationMissing] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      db
        .from("steam_profiles")
        .select(
          "favorite_app_id,favorite_started_year,favorite_started_on,favorite_show_playtime,proud_achievement_api_names",
        )
        .eq("user_id", userId)
        .maybeSingle(),
      db
        .from("steam_games")
        .select(
          "app_id,name,icon_url,playtime_forever,achievements_unlocked,achievements_total",
        )
        .eq("user_id", userId)
        .eq("owned", true)
        .order("playtime_forever", { ascending: false })
        .limit(300),
    ])
      .then(([profileResult, gameResult]) => {
        if (!active) return;
        if (profileResult.error) {
          const code = String(profileResult.error.code ?? "");
          setMigrationMissing(code === "42703" || code === "PGRST204" || code === "PGRST205");
        }
        const nextGames = (gameResult.data ?? []) as SteamGame[];
        setGames(nextGames);
        const preference = profileResult.data as Preference | null;
        const nextAppId = preference?.favorite_app_id ?? nextGames[0]?.app_id ?? null;
        setSelectedAppId(nextAppId);
        setStartedYear(preference?.favorite_started_year ? String(preference.favorite_started_year) : "");
        setStartedOn(preference?.favorite_started_on ?? "");
        setShowPlaytime(preference?.favorite_show_playtime !== false);
        setProud(
          Array.isArray(preference?.proud_achievement_api_names)
            ? preference.proud_achievement_api_names.slice(0, 3)
            : [],
        );
      })
      .catch((error: unknown) => {
        console.warn("[SteamFavoriteGameEditor] load failed", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    setAchievements([]);
    if (!selectedAppId) return;

    setAchievementLoading(true);
    const loadAchievements = async () => {
      try {
        const { data, error } = await db
          .from("steam_achievements")
          .select("api_name,display_name,description,unlock_time,icon_url")
          .eq("user_id", userId)
          .eq("app_id", selectedAppId)
          .eq("achieved", true)
          .order("unlock_time", { ascending: false })
          .limit(200);
        if (!active) return;
        if (error) throw error;
        setAchievements(data ?? []);
      } catch (error) {
        console.warn("[SteamFavoriteGameEditor] achievements failed", error);
      } finally {
        if (active) setAchievementLoading(false);
      }
    };
    void loadAchievements();

    return () => {
      active = false;
    };
  }, [selectedAppId, userId]);

  const visibleGames = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    if (!normalized) return games.slice(0, 36);
    return games
      .filter((game) => game.name.toLocaleLowerCase(locale).includes(normalized))
      .slice(0, 60);
  }, [games, locale, query]);

  const selectedGame = games.find((game) => game.app_id === selectedAppId) ?? null;

  const selectGame = (appId: number) => {
    if (appId === selectedAppId) return;
    setSelectedAppId(appId);
    setProud([]);
    setMessage("");
  };

  const toggleAchievement = (apiName: string) => {
    setProud((current) => {
      if (current.includes(apiName)) return current.filter((name) => name !== apiName);
      if (current.length >= 3) return current;
      return [...current, apiName];
    });
    setMessage("");
  };

  const save = async () => {
    if (saving || migrationMissing) return;
    setSaving(true);
    setMessage("");
    try {
      const parsedYear = startedYear.trim() ? Number(startedYear) : null;
      if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100)) {
        throw new Error("invalid_year");
      }
      const exactYear = startedOn ? Number(startedOn.slice(0, 4)) : parsedYear;
      const { error } = await db
        .from("steam_profiles")
        .update({
          favorite_app_id: selectedAppId,
          favorite_started_year: exactYear,
          favorite_started_on: startedOn || null,
          favorite_show_playtime: showPlaytime,
          proud_achievement_api_names: proud.slice(0, 3),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      setStartedYear(exactYear ? String(exactYear) : "");
      setMessage(copy("Destaque salvo.", "Highlight saved.", "Destacado guardado."));
    } catch (error) {
      console.warn("[SteamFavoriteGameEditor] save failed", error);
      setMessage(
        copy(
          "Não foi possível salvar o destaque agora.",
          "Could not save the highlight right now.",
          "No se pudo guardar el destacado ahora.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="surface-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold-strong" />
          {copy("Lendo sua biblioteca Steam…", "Reading your Steam library…", "Leyendo tu biblioteca de Steam…")}
        </div>
      </section>
    );
  }

  if (!games.length) {
    return (
      <section className="surface-panel rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <Gamepad2 className="size-4 text-gold-strong" />
          <h2 className="font-display text-lg font-semibold">
            {copy("Destaque da biblioteca Steam", "Steam library highlight", "Destacado de la biblioteca Steam")}
          </h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy(
            "Conecte e sincronize a Steam para escolher um jogo favorito, conquistas e tempo de jogo.",
            "Connect and sync Steam to choose a favorite game, achievements and playtime.",
            "Conecta y sincroniza Steam para elegir un juego favorito, logros y tiempo de juego.",
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="surface-panel rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Star className="size-4 text-gold-strong" />
        <h2 className="font-display text-lg font-semibold">
          {copy("Seu jogo principal", "Your main game", "Tu juego principal")}
        </h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {copy(
          "Escolha diretamente da sua biblioteca Steam. Depois selecione até três conquistas que você quer exibir no perfil.",
          "Choose directly from your Steam library, then pick up to three achievements to display on your profile.",
          "Elige directamente de tu biblioteca Steam y luego selecciona hasta tres logros para mostrar en tu perfil.",
        )}
      </p>

      {migrationMissing ? (
        <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          {copy(
            "O banco ainda não recebeu a atualização de destaque Steam.",
            "The database has not received the Steam highlight update yet.",
            "La base de datos aún no recibió la actualización del destacado Steam.",
          )}
        </p>
      ) : null}

      <label className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-muted/10 px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          placeholder={copy("Buscar na sua biblioteca", "Search your library", "Buscar en tu biblioteca")}
        />
      </label>

      <div className="mt-4 grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleGames.map((game) => {
          const selected = game.app_id === selectedAppId;
          return (
            <button
              key={game.app_id}
              type="button"
              onClick={() => selectGame(game.app_id)}
              className={cn(
                "flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition",
                selected
                  ? "border-gold/60 bg-gold/[0.08] ring-1 ring-gold/15"
                  : "border-border bg-muted/10 hover:border-gold/30",
              )}
            >
              {game.icon_url ? (
                <img src={game.icon_url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-background">
                  <Gamepad2 className="size-5 text-muted-foreground" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block line-clamp-2 text-sm font-bold text-foreground">{game.name}</span>
                <span className="mt-1 block text-[0.66rem] text-muted-foreground">
                  {Math.round(game.playtime_forever / 60)}h · {game.achievements_unlocked}/{game.achievements_total}{" "}
                  {copy("conquistas", "achievements", "logros")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selectedGame ? (
        <div className="mt-6 space-y-5 border-t border-border pt-5">
          <div className="grid gap-4 md:grid-cols-[12rem_14rem_1fr]">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                {copy("Jogo desde o ano", "Playing since year", "Juego desde el año")}
              </span>
              <Input
                type="number"
                min={1970}
                max={2100}
                value={startedYear}
                onChange={(event) => {
                  setStartedYear(event.target.value);
                  if (startedOn && event.target.value !== startedOn.slice(0, 4)) setStartedOn("");
                }}
                placeholder="2016"
                className="mt-2"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                {copy("Data exata (opcional)", "Exact date (optional)", "Fecha exacta (opcional)")}
              </span>
              <Input
                type="date"
                value={startedOn}
                onChange={(event) => {
                  setStartedOn(event.target.value);
                  if (event.target.value) setStartedYear(event.target.value.slice(0, 4));
                }}
                className="mt-2"
              />
            </label>
            <div className="rounded-xl border border-border bg-muted/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {copy("Mostrar tempo de jogo", "Show playtime", "Mostrar tiempo de juego")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.round(selectedGame.playtime_forever / 60)}h {copy("sincronizadas", "synced", "sincronizadas")}
                  </p>
                </div>
                <Switch checked={showPlaytime} onCheckedChange={setShowPlaytime} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-gold-strong" />
                <h3 className="font-display text-base font-semibold">
                  {copy("Conquistas que você se orgulha", "Achievements you're proud of", "Logros de los que te enorgulleces")}
                </h3>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{proud.length}/3</span>
            </div>
            {achievementLoading ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {copy("Carregando conquistas…", "Loading achievements…", "Cargando logros…")}
              </p>
            ) : achievements.length ? (
              <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {achievements.map((achievement) => {
                  const selected = proud.includes(achievement.api_name);
                  const disabled = !selected && proud.length >= 3;
                  return (
                    <button
                      key={achievement.api_name}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleAchievement(achievement.api_name)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                        selected
                          ? "border-gold/60 bg-gold/[0.08]"
                          : "border-border bg-muted/10 hover:border-gold/30",
                        disabled && "cursor-not-allowed opacity-45",
                      )}
                    >
                      {achievement.icon_url ? (
                        <img src={achievement.icon_url} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border">
                          <Award className="size-4 text-muted-foreground" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-foreground">
                          {achievement.display_name || achievement.api_name}
                        </span>
                        {achievement.description ? (
                          <span className="mt-1 line-clamp-2 block text-[0.68rem] leading-5 text-muted-foreground">
                            {achievement.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {copy(
                  "Nenhuma conquista desbloqueada foi sincronizada para este jogo ainda.",
                  "No unlocked achievements have been synced for this game yet.",
                  "Todavía no se sincronizaron logros desbloqueados para este juego.",
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void save()} disabled={saving || migrationMissing}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Star className="mr-2 size-4" />}
              {copy("Salvar destaque", "Save highlight", "Guardar destacado")}
            </Button>
            {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
