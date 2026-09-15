import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SoundEvent = "hover" | "click" | "navigation" | "open" | "close" | "success" | "error";

type AudioPreferences = {
  uiEnabled: boolean;
  ambienceEnabled: boolean;
  uiVolume: number;
  ambienceVolume: number;
};

type SoundContextValue = AudioPreferences & {
  setUiEnabled: (value: boolean) => void;
  setAmbienceEnabled: (value: boolean) => void;
  setUiVolume: (value: number) => void;
  setAmbienceVolume: (value: number) => void;
  play: (event: SoundEvent) => void;
};

const STORAGE_KEY = "mgp-audio";
const DEFAULTS: AudioPreferences = { uiEnabled: false, ambienceEnabled: false, uiVolume: 12, ambienceVolume: 18 };
const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AudioPreferences>(DEFAULTS);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPreferences({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {
      setPreferences(DEFAULTS);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const play = useCallback((event: SoundEvent) => {
    if (!preferences.uiEnabled || preferences.uiVolume === 0) return;
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const tones: Record<SoundEvent, [number, number]> = {
      hover: [720, 0.025], click: [410, 0.045], navigation: [520, 0.06], open: [560, 0.07],
      close: [360, 0.055], success: [760, 0.12], error: [190, 0.09],
    };
    const [frequency, duration] = tones[event];
    oscillator.type = event === "error" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (event === "success") oscillator.frequency.exponentialRampToValueAtTime(1040, now + duration);
    const peak = Math.min(0.035, (preferences.uiVolume / 100) * 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  }, [preferences.uiEnabled, preferences.uiVolume]);

  useEffect(() => {
    if (!preferences.uiEnabled) return;
    let lastHover = 0;
    const onPointerOver = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const target = event.target instanceof Element ? event.target.closest("a,button,[role='button'],input,select") : null;
      if (!target || Date.now() - lastHover < 90) return;
      lastHover = Date.now();
      play("hover");
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
      if (target) play(target instanceof HTMLAnchorElement ? "navigation" : "click");
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("click", onClick);
    };
  }, [play, preferences.uiEnabled]);

  const value = useMemo<SoundContextValue>(() => ({
    ...preferences,
    setUiEnabled: (uiEnabled) => setPreferences((current) => ({ ...current, uiEnabled })),
    setAmbienceEnabled: (ambienceEnabled) => setPreferences((current) => ({ ...current, ambienceEnabled })),
    setUiVolume: (uiVolume) => setPreferences((current) => ({ ...current, uiVolume })),
    setAmbienceVolume: (ambienceVolume) => setPreferences((current) => ({ ...current, ambienceVolume })),
    play,
  }), [play, preferences]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used inside SoundProvider");
  return context;
}

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}