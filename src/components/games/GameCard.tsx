import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import type { GameConfig } from "@/config/games";
import { ArrowUpRight, Play, X } from "lucide-react";
import { useSound } from "@/lib/sound";
import { GameArtwork } from "@/components/games/GameArtwork";
import { MinimalYouTubePlayer } from "@/components/common/MinimalMediaPlayer";

export function GameCard({ game }: { game: GameConfig }) {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { uiEnabled, uiVolume } = useSound();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const hoveredRef = useRef(false);

  const clearFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const fadeAudio = useCallback(
    (target: number, duration: number, onDone?: () => void) => {
      const audio = audioRef.current;
      if (!audio) return;
      clearFade();
      const startVolume = audio.volume;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        audio.volume = Math.max(0, Math.min(1, startVolume + (target - startVolume) * eased));
        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
          onDone?.();
        }
      };

      fadeFrameRef.current = window.requestAnimationFrame(step);
    },
    [clearFade],
  );

  const targetVolume = Math.min(0.085, Math.max(0.018, (uiVolume / 100) * 0.12));

  useEffect(() => {
    const source = game.visual.hoverAudio;
    if (!source) return;

    const audio = new Audio(source);
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      clearFade();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [clearFade, game.visual.hoverAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!uiEnabled || trailerOpen) {
      fadeAudio(0, 180, () => audio.pause());
    } else if (hoveredRef.current && !audio.paused) {
      fadeAudio(targetVolume, 180);
    }
  }, [fadeAudio, targetVolume, trailerOpen, uiEnabled]);

  const handlePointerEnter = () => {
    hoveredRef.current = true;
    if (trailerOpen || !game.visual.hoverAudio || !uiEnabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(audio.volume, targetVolume);
    void audio
      .play()
      .then(() => fadeAudio(targetVolume, 320))
      .catch(() => undefined);
  };

  const handlePointerLeave = () => {
    hoveredRef.current = false;
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    fadeAudio(0, 380, () => {
      if (!hoveredRef.current) audio.pause();
    });
  };

  const openHub = () => {
    const preferredEntries = ["builds", "warframes", "agents", "champions", "competitive", "weapons", "bosses", "items", "guides", "news"] as const;
    const entryModule = preferredEntries.find((module) => game.modules.includes(module)) ?? "overview";
    void navigate({
      to: "/games/$slug",
      params: { slug: game.slug },
      search: { module: entryModule },
    });
  };

  const toggleTrailer = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      fadeAudio(0, 120, () => audio.pause());
    }
    setTrailerOpen((current) => !current);
  };

  return (
    <article
      className="game-card group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="link"
      tabIndex={0}
      aria-label={`${game.name} hub`}
      onClick={openHub}
      onKeyDown={(event) => {
        if (event.key === "Enter") openHub();
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="game-card-media relative aspect-[16/10] overflow-hidden">
        {trailerOpen && game.visual.trailerYoutubeId ? (
          <div
            className="absolute inset-0 z-10 animate-in fade-in zoom-in-95 bg-black duration-300"
            data-card-control
            onClick={(event) => event.stopPropagation()}
          >
            <MinimalYouTubePlayer videoId={game.visual.trailerYoutubeId} locale={locale} autoPlay />
          </div>
        ) : (
          <GameArtwork game={game} className="game-card-image" />
        )}
        {!trailerOpen ? <div className="game-card-scrim absolute inset-0" /> : null}
        {!trailerOpen ? (
          <div className="game-card-sheen absolute inset-0" aria-hidden="true" />
        ) : null}
        {!trailerOpen ? (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
            <span className="rounded-sm border border-border-strong bg-background/80 px-2 py-1 text-[0.65rem] font-bold uppercase text-foreground backdrop-blur">
              {game.genre}
            </span>
            <span className="rounded-sm bg-background/80 px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground backdrop-blur">
              {game.ageRating}
            </span>
          </div>
        ) : null}
        {game.visual.trailerYoutubeId ? (
          <button
            type="button"
            data-card-control
            onClick={(event) => {
              event.stopPropagation();
              toggleTrailer();
            }}
            className="absolute right-4 top-4 z-30 grid size-10 place-items-center rounded-full bg-black/70 text-white shadow-lift backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-black/85 active:scale-95"
            aria-label={
              trailerOpen ? `Fechar trailer de ${game.name}` : `Assistir trailer de ${game.name}`
            }
          >
            {trailerOpen ? <X className="size-4" /> : <Play className="size-4 fill-current" />}
          </button>
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{game.name}</h3>
          {game.visual.trailerUrl ? (
            <a
              data-card-control
              href={game.visual.trailerUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="grid size-8 shrink-0 place-items-center rounded-full text-gold-strong transition-all hover:-translate-y-0.5 hover:translate-x-0.5 hover:bg-gold-soft/20"
              aria-label={`Abrir trailer oficial de ${game.name} em nova guia`}
              title="Trailer oficial"
            >
              <ArrowUpRight className="size-4" />
            </a>
          ) : (
            <ArrowUpRight className="size-4 shrink-0 text-gold-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {game.description[locale]}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {game.platforms.map((platform) => (
            <li
              key={platform}
              className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground"
            >
              {platform}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
