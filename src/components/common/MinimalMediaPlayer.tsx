import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
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
    onError: () => void;
    onAutoplayBlocked: () => void;
  };
};

type YouTubeApi = {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayerInstance;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
  };
};

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
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
    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const cleanup = () => {
      window.clearTimeout(timeout);
      script?.removeEventListener("error", fail);
      if (window.onYouTubeIframeAPIReady === onReady) { if (previousReady) window.onYouTubeIframeAPIReady = previousReady; else delete window.onYouTubeIframeAPIReady; }
    };
    const fail = () => {
      cleanup();
      script?.remove();
      reject(new Error("youtube_api_load_failed"));
    };
    const onReady = () => {
      cleanup();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("youtube_api_unavailable"));
      previousReady?.();
    };
    const timeout = window.setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = onReady;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    } else {
      script.addEventListener("error", fail, { once: true });
    }
  }).catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
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
  const [attempt, setAttempt] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
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
    setReady(false);
    setPlaying(false);
    setError(false);
    setBuffering(true);
    setCurrentTime(0);
    setDuration(0);
    const mobileOrTouch = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const shouldAutoPlay = autoPlay && !mobileOrTouch && !connection?.saveData && document.visibilityState !== "hidden";
    const readyTimeout = window.setTimeout(() => {
      if (!cancelled) { setError(true); setBuffering(false); }
    }, 20000);

    void loadYouTubeApi()
      .then((api) => {
        if (cancelled || !mountRef.current) return;
        // YouTube replaces its target node. Keep React's container intact across retries and StrictMode cleanup.
        const targetElement = document.createElement("div");
        mount.replaceChildren(targetElement);
        const player = new api.Player(targetElement, {
          width: "100%",
          height: "100%",
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: shouldAutoPlay ? 1 : 0,
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
              if (cancelled) return;
              window.clearTimeout(readyTimeout);
              setError(false);
              setBuffering(false);
              target.setVolume(72);
              setVolumeState(72);
              setDuration(target.getDuration() || 0);
              setReady(true);
              if (shouldAutoPlay && document.visibilityState !== "hidden") target.playVideo();
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              if (data === api.PlayerState.PLAYING && document.visibilityState === "hidden") {
                playerRef.current?.pauseVideo();
                return;
              }
              setPlaying(data === api.PlayerState.PLAYING);
              setBuffering(data === 3);
              setCurrentTime(playerRef.current?.getCurrentTime() || 0);
              setDuration(playerRef.current?.getDuration() || 0);
              if (data === api.PlayerState.ENDED) {
                setCurrentTime(playerRef.current?.getDuration() ?? 0);
              }
            },
            onError: () => {
              if (cancelled) return;
              window.clearTimeout(readyTimeout);
              setError(true);
              setPlaying(false);
              setBuffering(false);
            },
            onAutoplayBlocked: () => {
              if (!cancelled) { setPlaying(false); setBuffering(false); }
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) { setReady(false); setError(true); setBuffering(false); }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimeout);
      playerRef.current?.destroy();
      playerRef.current = null;
      mount.replaceChildren();
    };
  }, [autoPlay, videoId, attempt]);

  useEffect(() => {
    if (!ready || !playing) return;
    const mobileOrTouch = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || document.visibilityState === "hidden") return;
      setCurrentTime(player.getCurrentTime() || 0);
      const nextDuration = player.getDuration() || 0;
      setDuration(nextDuration);
    }, mobileOrTouch ? 750 : 250);
    return () => window.clearInterval(timer);
  }, [playing, ready]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.visibilityState === "hidden" && ready) playerRef.current?.pauseVideo();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [ready]);

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
      <PlayerStatus buffering={buffering} error={error} locale={locale} onRetry={() => setAttempt((value) => value + 1)} />
      <PlayerControls
        playing={playing}
        ready={ready && !error}
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
        progressLabel={copy("Progresso do vídeo", "Video progress", "Progreso del video")}
        muteLabel={volume === 0 ? copy("Ativar som", "Unmute", "Activar sonido") : copy("Silenciar", "Mute", "Silenciar")}
      />
    </div>
  );
}

export function MinimalVideoPlayer({
  src,
  locale,
  autoPlay = true,
  autoPlayOnTouch = false,
  className,
}: {
  src: string;
  locale: Locale;
  autoPlay?: boolean;
  autoPlayOnTouch?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const lastProgressRef = useRef(0);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(72);
  const [preload, setPreload] = useState<"none" | "metadata" | "auto">("none");
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimerRef = useRef<number | null>(null);
  const lastAudibleVolumeRef = useRef(72);
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  useEffect(() => {
    setPlaying(false);
    setReady(false);
    setError(false);
    setControlsVisible(true);
    lastProgressRef.current = 0;
    setBuffering(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current != null) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  const revealControls = useCallback((linger = 2200) => {
    setControlsVisible(true);
    clearControlsTimer();
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, linger);
  }, [clearControlsTimer]);

  useEffect(() => () => clearControlsTimer(), [clearControlsTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const saveData = connection?.saveData === true;
    const effectiveType = connection?.effectiveType ?? "";
    const slowConnection = effectiveType === "slow-2g" || effectiveType === "2g";
    const mobileOrTouch = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

    setPreload(saveData || slowConnection || mobileOrTouch ? "none" : "metadata");

    const touchAutoPlay = mobileOrTouch && autoPlayOnTouch;
    if (!autoPlay || (mobileOrTouch && !touchAutoPlay) || saveData || slowConnection || document.visibilityState === "hidden") return;

    if (touchAutoPlay) {
      video.muted = true;
      video.volume = 0;
      setVolumeState(0);
    }

    setBuffering(true);
    void video.play().catch(() => setBuffering(false));
  }, [autoPlay, autoPlayOnTouch, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = volume === 0;
    video.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(100, nextVolume));
    setVolumeState(safeVolume);
    if (safeVolume > 0) lastAudibleVolumeRef.current = safeVolume;
  }, []);

  const toggleMute = () => setVolume(volume === 0 ? lastAudibleVolumeRef.current || 72 : 0);

  const requestPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setError(false);
      setBuffering(true);
      if (video.error) video.load();
      // play() itself starts loading when preload is none; never gate this gesture on metadata.
      void video.play().catch((reason: unknown) => {
        setBuffering(false);
        if (reason instanceof DOMException && reason.name !== "NotAllowedError" && reason.name !== "AbortError") setError(true);
      });
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    if (!ready) return;
    revealControls(playing ? 1700 : 2600);
  }, [playing, ready, revealControls]);

  return (
    <div
      className={cn("group/player relative isolate overflow-hidden bg-black", className)}
      onMouseMove={() => revealControls()}
      onMouseEnter={() => revealControls()}
      onMouseLeave={() => {
        clearControlsTimer();
        setControlsVisible(false);
      }}
      onPointerDown={() => revealControls(2600)}
      onFocusCapture={() => {
        clearControlsTimer();
        setControlsVisible(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) revealControls(900);
      }}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload={preload}
        className="mx-auto h-full max-h-[68dvh] w-full bg-black object-contain"
        onLoadedMetadata={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
          setReady(true);
        }}
        onLoadedData={() => {
          setReady(true);
          setBuffering(false);
        }}
        onCanPlay={() => setBuffering(false)}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          const now = performance.now();
          if (now - lastProgressRef.current < 250 && !video.paused && !video.ended) return;
          lastProgressRef.current = now;
          setCurrentTime(video.currentTime);
        }}
        onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onError={() => { setError(true); setBuffering(false); setPlaying(false); }}
        onPlay={() => setPlaying(true)}
        onPlaying={(event) => {
          if (document.visibilityState === "hidden") { event.currentTarget.pause(); return; }
          setPlaying(true);
          setBuffering(false);
        }}
        onWaiting={() => setBuffering(true)}
        onStalled={(event) => { if (!event.currentTarget.paused) setBuffering(true); }}
        onPause={() => {
          setPlaying(false);
          setBuffering(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setBuffering(false);
        }}
        onClick={() => {
          revealControls();
          requestPlay();
        }}
      />
      <PlayerStatus buffering={buffering} error={error} locale={locale} onRetry={requestPlay} />
      {!playing && !buffering && !error && !ready ? (
        <button type="button" onClick={requestPlay} className="absolute left-1/2 top-1/3 z-10 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label={copy("Reproduzir", "Play", "Reproducir")}>
          <Play className="size-5 fill-current" aria-hidden="true" />
        </button>
      ) : null}
      <PlayerControls
        className={cn(
          "transition-all duration-300",
          controlsVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
        playing={playing}
        ready={ready}
        canPlay={!error}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={requestPlay}
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
        progressLabel={copy("Progresso do vídeo", "Video progress", "Progreso del video")}
        muteLabel={volume === 0 ? copy("Ativar som", "Unmute", "Activar sonido") : copy("Silenciar", "Mute", "Silenciar")}
      />
    </div>
  );
}

function PlayerStatus({ buffering, error, locale, onRetry }: { buffering: boolean; error: boolean; locale: Locale; onRetry: () => void }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  if (error) return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/90 p-3 text-center text-white" role="alert">
      <p className="text-sm">{copy("Não foi possível carregar este vídeo.", "This video could not be loaded.", "No se pudo cargar este video.")}</p>
      <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        <RotateCcw className="size-4" aria-hidden="true" />{copy("Tentar novamente", "Try again", "Volver a intentar")}
      </button>
    </div>
  );
  if (!buffering) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" role="status">
      <span className="grid size-11 place-items-center rounded-full bg-black/60 text-white">
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <span className="sr-only">{copy("Carregando vídeo", "Loading video", "Cargando video")}</span>
      </span>
    </div>
  );
}

function PlayerControls({
  className,
  playing,
  ready,
  canPlay = ready,
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
  progressLabel,
  muteLabel,
}: {
  className?: string;
  playing: boolean;
  ready: boolean;
  canPlay?: boolean;
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
  progressLabel: string;
  muteLabel: string;
}) {
  const safeDuration = duration > 0 ? duration : 0;
  const safeCurrent = safeDuration > 0 ? Math.min(currentTime, safeDuration) : 0;

  return (
    <div className={cn("absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-3 pt-10 sm:px-4", className)}>
      <input
        type="range"
        min={0}
        max={safeDuration || 1}
        step={0.05}
        value={safeCurrent}
        disabled={!ready || safeDuration <= 0}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-primary disabled:cursor-default disabled:opacity-45"
        aria-label={progressLabel}
      />
      <div className="mt-2 flex items-center gap-2.5 text-white">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!canPlay}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label={playing ? pauseLabel : playLabel}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>

        <span className="min-w-[4.2rem] text-[0.65rem] font-semibold tabular-nums text-white/75">
          {formatTime(safeCurrent)} / {formatTime(safeDuration)}
        </span>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            className="grid size-11 shrink-0 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label={muteLabel}
            aria-pressed={volume === 0}
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
            className="hidden h-6 w-20 cursor-pointer accent-primary sm:block sm:w-24"
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

