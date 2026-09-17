import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "mgp-theme";
export const ACCENT_STORAGE_KEY = "mgp-accent-color";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: "light" | "dark";
  accentColor: string | null;
  setPreference: (value: ThemePreference) => void;
  setAccentColor: (value: string) => void;
  resetAccentColor: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isHexColor(value: string | null): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function applyAccentColor(value: string | null) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (!isHexColor(value)) {
    root.style.removeProperty("--mgp-user-accent");
    root.style.removeProperty("--mgp-user-accent-soft");
    root.style.removeProperty("--mgp-user-accent-strong");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    delete root.dataset.accent;
    return;
  }

  root.style.setProperty("--mgp-user-accent", value);
  root.style.setProperty(
    "--mgp-user-accent-soft",
    "color-mix(in oklab, var(--mgp-user-accent) 18%, transparent)",
  );
  root.style.setProperty(
    "--mgp-user-accent-strong",
    "color-mix(in oklab, var(--mgp-user-accent) 78%, var(--foreground))",
  );
  root.style.setProperty(
    "--accent",
    "color-mix(in oklab, var(--mgp-user-accent) 16%, var(--surface))",
  );
  root.style.setProperty(
    "--accent-foreground",
    "color-mix(in oklab, var(--mgp-user-accent) 70%, var(--foreground))",
  );
  root.dataset.accent = "custom";
}

/**
 * Applied before first paint (see themeBootstrapScript) to avoid theme/accent flash.
 */
export const themeBootstrapScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var a="${ACCENT_STORAGE_KEY}";var p=localStorage.getItem(k)||"system";var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=p==="dark"||(p==="system"&&m);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var c=localStorage.getItem(a);if(c&&/^#[0-9a-f]{6}$/i.test(c)){r.style.setProperty("--mgp-user-accent",c);r.style.setProperty("--mgp-user-accent-soft","color-mix(in oklab, var(--mgp-user-accent) 18%, transparent)");r.style.setProperty("--mgp-user-accent-strong","color-mix(in oklab, var(--mgp-user-accent) 78%, var(--foreground))");r.style.setProperty("--accent","color-mix(in oklab, var(--mgp-user-accent) 16%, var(--surface))");r.style.setProperty("--accent-foreground","color-mix(in oklab, var(--mgp-user-accent) 70%, var(--foreground))");r.dataset.accent="custom";}}catch(e){}})();`;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(preference: ThemePreference): "light" | "dark" {
  const dark = preference === "dark" || (preference === "system" && systemPrefersDark());
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }
  return dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [accentColor, setAccentColorState] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    const initial: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const storedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    const initialAccent = isHexColor(storedAccent) ? storedAccent : null;

    setPreferenceState(initial);
    setResolved(applyTheme(initial));
    setAccentColorState(initialAccent);
    applyAccentColor(initialAccent);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preference === "system") setResolved(applyTheme("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
    setResolved(applyTheme(value));
  }, []);

  const setAccentColor = useCallback((value: string) => {
    if (!isHexColor(value)) return;
    const normalized = value.toLowerCase();
    setAccentColorState(normalized);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, normalized);
    applyAccentColor(normalized);
  }, []);

  const resetAccentColor = useCallback(() => {
    setAccentColorState(null);
    window.localStorage.removeItem(ACCENT_STORAGE_KEY);
    applyAccentColor(null);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      accentColor,
      setPreference,
      setAccentColor,
      resetAccentColor,
    }),
    [preference, resolved, accentColor, setPreference, setAccentColor, resetAccentColor],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
