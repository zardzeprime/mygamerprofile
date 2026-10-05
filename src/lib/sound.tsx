import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

type SoundSignature = {
  frequency: number;
  overtone: number;
  duration: number;
  type: OscillatorType;
  endFrequency?: number;
  overtoneEndFrequency?: number;
};

const STORAGE_KEY = "mgp-audio";
const DEFAULTS: AudioPreferences = {
  uiEnabled: true,
  ambienceEnabled: false,
  uiVolume: 24,
  ambienceVolume: 18,
};

function clampVolume(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
}

const SOUND_SIGNATURES: Record<SoundEvent, SoundSignature> = {
  hover: { frequency: 760, overtone: 1140, duration: 0.032, type: "sine" },
  click: { frequency: 390, overtone: 585, duration: 0.05, type: "sine" },
  navigation: {
    frequency: 480,
    overtone: 720,
    duration: 0.072,
    type: "sine",
    endFrequency: 560,
    overtoneEndFrequency: 840,
  },
  open: {
    frequency: 540,
    overtone: 810,
    duration: 0.085,
    type: "sine",
    endFrequency: 660,
    overtoneEndFrequency: 990,
  },
  close: {
    frequency: 430,
    overtone: 645,
    duration: 0.07,
    type: "sine",
    endFrequency: 340,
    overtoneEndFrequency: 510,
  },
  success: {
    frequency: 650,
    overtone: 975,
    duration: 0.13,
    type: "sine",
    endFrequency: 980,
    overtoneEndFrequency: 1470,
  },
  error: {
    frequency: 230,
    overtone: 345,
    duration: 0.11,
    type: "triangle",
    endFrequency: 175,
    overtoneEndFrequency: 262,
  },
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AudioPreferences>(DEFAULTS);
  const contextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const lastSoundRef = useRef(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          uiEnabled: typeof parsed?.uiEnabled === "boolean" ? parsed.uiEnabled : DEFAULTS.uiEnabled,
          ambienceEnabled:
            typeof parsed?.ambienceEnabled === "boolean"
              ? parsed.ambienceEnabled
              : DEFAULTS.ambienceEnabled,
          uiVolume: clampVolume(parsed?.uiVolume, DEFAULTS.uiVolume),
          ambienceVolume: clampVolume(parsed?.ambienceVolume, DEFAULTS.ambienceVolume),
        });
      }
    } catch {
      setPreferences(DEFAULTS);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      /* Session-only preferences remain available. */
    }
  }, [preferences, hydrated]);

  useEffect(
    () => () => {
      const context = contextRef.current;
      contextRef.current = null;
      unlockedRef.current = false;
      if (context && context.state !== "closed") void context.close().catch(() => {});
    },
    [],
  );

  const ensureContext = useCallback(async () => {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    let context: AudioContext;
    try {
      context = contextRef.current ?? new AudioContextClass();
    } catch {
      return null;
    }
    contextRef.current = context;
    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return null;
      }
    }
    unlockedRef.current = context.state === "running";
    return context;
  }, []);

  useEffect(() => {
    if (!preferences.uiEnabled) return;
    const unlock = () => {
      void ensureContext();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [ensureContext, preferences.uiEnabled]);

  const play = useCallback(
    (event: SoundEvent) => {
      if (!preferences.uiEnabled || preferences.uiVolume === 0 || document.hidden) return;
      // Avoid overlapping oscillators during rapid navigation or nested pointer events.
      const stamp = performance.now();
      if (stamp - lastSoundRef.current < (event === "hover" ? 180 : 45)) return;
      lastSoundRef.current = stamp;
      const context = contextRef.current;
      if (!context || context.state !== "running" || !unlockedRef.current) return;

      const signature = SOUND_SIGNATURES[event];
      const now = context.currentTime;
      const volumeScale = preferences.uiVolume / 100;
      const master = context.createGain();
      const filter = context.createBiquadFilter();
      const primary = context.createOscillator();
      const overtone = context.createOscillator();
      const primaryGain = context.createGain();
      const overtoneGain = context.createGain();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(event === "error" ? 1500 : 3200, now);
      filter.Q.setValueAtTime(0.6, now);

      primary.type = signature.type;
      overtone.type = event === "error" ? "sine" : signature.type;
      primary.frequency.setValueAtTime(signature.frequency, now);
      overtone.frequency.setValueAtTime(signature.overtone, now);

      if (signature.endFrequency) {
        primary.frequency.exponentialRampToValueAtTime(
          signature.endFrequency,
          now + signature.duration,
        );
      }
      if (signature.overtoneEndFrequency) {
        overtone.frequency.exponentialRampToValueAtTime(
          signature.overtoneEndFrequency,
          now + signature.duration,
        );
      }

      const peak = Math.max(
        0.0002,
        Math.min(0.028, volumeScale * 0.065) * (event === "hover" ? 0.4 : 1),
      );
      const attack = Math.min(0.009, signature.duration * 0.22);
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(peak, now + attack);
      master.gain.exponentialRampToValueAtTime(0.0001, now + signature.duration);

      primaryGain.gain.setValueAtTime(1, now);
      overtoneGain.gain.setValueAtTime(event === "hover" ? 0.12 : 0.2, now);

      primary.connect(primaryGain).connect(filter);
      overtone.connect(overtoneGain).connect(filter);
      filter.connect(master).connect(context.destination);

      overtone.onended = () => {
        primary.disconnect();
        overtone.disconnect();
        primaryGain.disconnect();
        overtoneGain.disconnect();
        filter.disconnect();
        master.disconnect();
      };
      primary.start(now);
      overtone.start(now);
      primary.stop(now + signature.duration + 0.015);
      overtone.stop(now + signature.duration + 0.015);
    },
    [preferences.uiEnabled, preferences.uiVolume],
  );

  useEffect(() => {
    if (!preferences.uiEnabled) return;
    let lastHover = 0;
    const onPointerOver = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const target =
        event.target instanceof Element
          ? event.target.closest("a,button,[role='button'],input,select")
          : null;
      if (
        !target ||
        target.matches(":disabled,[aria-disabled='true']") ||
        (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) ||
        Date.now() - lastHover < 220
      )
        return;
      lastHover = Date.now();
      play("hover");
    };
    const onClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
      if (target && !target.matches(":disabled,[aria-disabled='true']"))
        play(target instanceof HTMLAnchorElement ? "navigation" : "click");
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("click", onClick);
    };
  }, [play, preferences.uiEnabled]);

  const value = useMemo<SoundContextValue>(
    () => ({
      ...preferences,
      setUiEnabled: (uiEnabled) => setPreferences((current) => ({ ...current, uiEnabled })),
      setAmbienceEnabled: (ambienceEnabled) =>
        setPreferences((current) => ({ ...current, ambienceEnabled })),
      setUiVolume: (uiVolume) =>
        setPreferences((current) => ({
          ...current,
          uiVolume: clampVolume(uiVolume, current.uiVolume),
        })),
      setAmbienceVolume: (ambienceVolume) =>
        setPreferences((current) => ({
          ...current,
          ambienceVolume: clampVolume(ambienceVolume, current.ambienceVolume),
        })),
      play,
    }),
    [play, preferences],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used inside SoundProvider");
  return context;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
