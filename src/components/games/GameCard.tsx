import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { useI18n } from "@/i18n";
import type { GameConfig } from "@/config/games";
import { ArrowUpRight, Play } from "lucide-react";
import { useSound } from "@/lib/sound";
import { GameArtwork } from "@/components/games/GameArtwork";

export function GameCard({ game }: { game: GameConfig }) {
  const { locale, t } = useI18n();
  const { uiEnabled, uiVolume } = useSound();
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
    if (!uiEnabled) {
      fadeAudio(0, 180, () => audio.pause());
    } else if (hoveredRef.current && !audio.paused) {
      fadeAudio(targetVolume, 180);
    }
  }, [fadeAudio, targetVolume, uiEnabled]);

  const handlePointerEnter = () => {
    if (!game.visual.hoverAudio || !uiEnabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const audio = audioRef.current;
    if (!audio) return;
    hoveredRef.current = true;
    audio.volume = Math.min(audio.volume, targetVolume);
    void audio.play().then(() => fadeAudio(targetVolume, 320)).catch(() => undefined);
  };

  const handlePointerLeave = () => {
    hoveredRef.current = false;
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    fadeAudio(0, 380, () => {
      if (!hoveredRef.current) audio.pause();
    });
  };

  return (
    <article
      className="game-card group overflow-hidden"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="game-card-media relative aspect-[16/10] overflow-hidden">
        <GameArtwork game={game} className="game-card-image" />
        <div className="game-card-scrim absolute inset-0" />
        <div className="game-card-sheen absolute inset-0" aria-hidden="true" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-sm border border-border-strong bg-background/80 px-2 py-1 text-[0.65rem] font-bold uppercase text-foreground backdrop-blur">
            {game.genre}
          </span>
          <span className="rounded-sm bg-background/80 px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground backdrop-blur">
            {game.ageRating}
          </span>
        </div>
        <span
          className="absolute bottom-4 right-4 grid size-9 translate-y-2 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden="true"
        >
          <Play className="size-4 fill-current" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{game.name}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-gold-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{game.description[locale]}</p>
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
        <Link
          to="/games/$slug"
          params={{ slug: game.slug }}
          className="story-link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-strong"
        >
          {t("games.openHub")}
        </Link>
      </div>
    </article>
  );
}
