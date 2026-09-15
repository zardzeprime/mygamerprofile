import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type YouTubeStateEvent = { data: number };
type YouTubeReadyEvent = { target: YouTubePlayerInstance };

type YouTubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
};

type YouTubePlayerOptions = {
  width: string;
  height: string;
  videoId: string;
  host?: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady: (event: YouTubeReadyEvent) => void;
    onStateChange: (event: YouTubeStateEvent) => void;
  };
};

type YouTubeApi = {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayerInstance;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("youtube_api_unavailable"));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("youtube_api_load_failed"));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

export function MinimalYouTubePlayer({
  videoId,
  locale,
  autoPlay = true,
  className,
}: {
  videoId: string;
  locale: Locale;
  autoPlay?: boolean;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(72);
  const lastAudibleVolumeRef = useRef(72);
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  useEffect(() => {
    let cancelled = false;
    const mount = mountRef.current;
    if (!mount) return;

    void loadYouTubeApi()
      .then((api) => {
        if (cancelled || !mountRef.current) return;
        const player = new api.Player(mountRef.current, {
          width: "100%",
          height: "100%",
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              target.setVolume(volume);
              setDuration(target.getDuration() || 0);
              setReady(true);
              if (autoPlay) target.playVideo();
            },
            onStateChange: ({ data }) => {
              setPlaying(data === api.PlayerState.PLAYING);
              if (data === api.PlayerState.ENDED) {
                setCurrentTime(playerRef.current?.getDuration() ?? 0);
              }
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [autoPlay, videoId]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime() || 0);
      const nextDuration = player.getDuration() || 0;
      if (nextDuration !== duration) setDuration(nextDuration);
    }, 250);
    return () => window.clearInterval(timer);
  }, [duration, ready]);

  const setVolume = useCallback((nextVolume: number) => {
    const player = playerRef.current;
    const safeVolume = Math.max(0, Math.min(100, nextVolume));
    setVolumeState(safeVolume);
    if (safeVolume > 0) lastAudibleVolumeRef.current = safeVolume;
    if (!player) return;
    if (safeVolume === 0) player.mute();
    else {
      player.unMute();
      player.setVolume(safeVolume);
    }
  }, []);

  const toggleMute = () => setVolume(volume === 0 ? lastAudibleVolumeRef.current || 72 : 0);

  return (
    <div className={cn("relative isolate h-full w-full overflow-hidden bg-black", className)}>
      <div ref={mountRef} className="pointer-events-none absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
      <PlayerControls
        locale={locale}
        playing={playing}
        ready={ready}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={() => {
          const player = playerRef.current;
          if (!player) return;
          if (playing) player.pauseVideo();
          else player.playVideo();
        }}
        onSeek={(seconds) => {
          playerRef.current?.seekTo(seconds, true);
          setCurrentTime(seconds);
        }}
        onVolume={setVolume}
        onToggleMute={toggleMute}
        playLabel={copy("Reproduzir", "Play", "Reproducir")}
        pauseLabel={copy("Pausar", "Pause", "Pausar")}
        volumeLabel={copy("Volume", "Volume", "Volumen")}
      />
    </div>
  );
}

export function MinimalVideoPlayer({
  src,
  locale,
  autoPlay = true,
  className,
}: {
  src: string;
  locale: Locale;
  autoPlay?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(72);
  const lastAudibleVolumeRef = useRef(72);
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume / 100;
    if (autoPlay) void video.play().catch(() => undefined);
  }, [autoPlay, src, volume]);

  const setVolume = useCallback((nextVolume: number) => {
    const video = videoRef.current;
    const safeVolume = Math.max(0, Math.min(100, nextVolume));
    setVolumeState(safeVolume);
    if (safeVolume > 0) lastAudibleVolumeRef.current = safeVolume;
    if (!video) return;
    video.muted = safeVolume === 0;
    video.volume = safeVolume / 100;
  }, []);

  const toggleMute = () => setVolume(volume === 0 ? lastAudibleVolumeRef.current || 72 : 0);

  return (
    <div className={cn("relative isolate overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="mx-auto h-full max-h-[68dvh] w-full bg-black object-contain"
        onLoadedMetadata={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
          setReady(true);
        }}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) void video.play().catch(() => undefined);
          else video.pause();
        }}
      />
      <PlayerControls
        locale={locale}
        playing={playing}
        ready={ready}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) void video.play().catch(() => undefined);
          else video.pause();
        }}
        onSeek={(seconds) => {
          const video = videoRef.current;
          if (!video) return;
          video.currentTime = seconds;
          setCurrentTime(seconds);
        }}
        onVolume={setVolume}
        onToggleMute={toggleMute}
        playLabel={copy("Reproduzir", "Play", "Reproducir")}
        pauseLabel={copy("Pausar", "Pause", "Pausar")}
        volumeLabel={copy("Volume", "Volume", "Volumen")}
      />
    </div>
  );
}

function PlayerControls({
  playing,
  ready,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onVolume,
  onToggleMute,
  playLabel,
  pauseLabel,
  volumeLabel,
}: {
  locale: Locale;
  playing: boolean;
  ready: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
  playLabel: string;
  pauseLabel: string;
  volumeLabel: string;
}) {
  const safeDuration = duration > 0 ? duration : 0;
  const safeCurrent = safeDuration > 0 ? Math.min(currentTime, safeDuration) : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-3 pt-10 sm:px-4">
      <input
        type="range"
        min={0}
        max={safeDuration || 1}
        step={0.05}
        value={safeCurrent}
        disabled={!ready || safeDuration <= 0}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-default disabled:opacity-45"
        aria-label="Video progress"
      />
      <div className="mt-2 flex items-center gap-2.5 text-white">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!ready}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-45"
          aria-label={playing ? pauseLabel : playLabel}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>

        <span className="hidden min-w-[5.2rem] text-[0.68rem] font-semibold tabular-nums text-white/75 sm:inline">
          {formatTime(safeCurrent)} / {formatTime(safeDuration)}
        </span>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="grid size-8 shrink-0 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={volumeLabel}
          >
            {volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(event) => onVolume(Number(event.target.value))}
            className="h-1.5 w-20 cursor-pointer accent-primary sm:w-24"
            aria-label={volumeLabel}
          />
        </div>
      </div>
    </div>
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
