import { useEffect, useRef } from "react";
import { useSound } from "@/lib/sound";

export function useGameAmbience(source?: string) {
  const { ambienceEnabled, ambienceVolume } = useSound();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambienceVolumeRef = useRef(ambienceVolume);

  useEffect(() => {
    ambienceVolumeRef.current = ambienceVolume;
    if (audioRef.current) audioRef.current.volume = Math.min(1, ambienceVolume / 100);
  }, [ambienceVolume]);

  useEffect(() => {
    if (!source || !ambienceEnabled) return;
    const audio = new Audio(source);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    audioRef.current = audio;
    void audio.play().catch(() => undefined);
    const target = Math.min(1, ambienceVolumeRef.current / 100);
    const interval = window.setInterval(() => {
      audio.volume = Math.min(target, audio.volume + 0.02);
      if (audio.volume >= target) window.clearInterval(interval);
    }, 50);
    return () => {
      window.clearInterval(interval);
      const fade = window.setInterval(() => {
        audio.volume = Math.max(0, audio.volume - 0.04);
        if (audio.volume <= 0) {
          window.clearInterval(fade);
          audio.pause();
          audio.removeAttribute("src");
        }
      }, 40);
      audioRef.current = null;
    };
  }, [ambienceEnabled, source]);
}
