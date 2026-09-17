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

// Custom color is decorative. Readable text and the institutional gold stay semantic.
function applyAccentColor(value: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Clean up tokens written by older versions before applying the CSS-driven palette.
  ["--mgp-user-accent-soft", "--mgp-user-accent-strong", "--accent", "--accent-foreground"].forEach((token) => root.style.removeProperty(token));
  if (isHexColor(value)) {
    root.style.setProperty("--mgp-user-accent", value);
    root.dataset["accent"] = "custom";
  } else {
    root.style.removeProperty("--mgp-user-accent");
    delete root.dataset["accent"];
  }
}

function readStored(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function persist(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* Preferences still work when browser storage is unavailable. */ }
}

/** Apply before first paint, including when storage is blocked. */
export const themeBootstrapScript = `(function(){var p="system",c=null;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";c=localStorage.getItem("${ACCENT_STORAGE_KEY}");}catch(e){}var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var d=p==="dark"||(p!=="light"&&p!=="dark"&&m);var r=document.documentElement;r.classList.toggle("dark",!!d);r.style.colorScheme=d?"dark":"light";if(c&&/^#[0-9a-f]{6}$/i.test(c)){r.style.setProperty("--mgp-user-accent",c);r.dataset.accent="custom";}})();`;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
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
    const stored = readStored(THEME_STORAGE_KEY) as ThemePreference | null;
    const initial: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const storedAccent = readStored(ACCENT_STORAGE_KEY);
    const initialAccent = isHexColor(storedAccent) ? storedAccent : null;

    setPreferenceState(initial);
    setResolved(applyTheme(initial));
    setAccentColorState(initialAccent);
    applyAccentColor(initialAccent);
  }, []);

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preference === "system") setResolved(applyTheme("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    persist(THEME_STORAGE_KEY, value);
    setResolved(applyTheme(value));
  }, []);

  const setAccentColor = useCallback((value: string) => {
    if (!isHexColor(value)) return;
    const normalized = value.toLowerCase();
    setAccentColorState(normalized);
    persist(ACCENT_STORAGE_KEY, normalized);
    applyAccentColor(normalized);
  }, []);

  const resetAccentColor = useCallback(() => {
    setAccentColorState(null);
    persist(ACCENT_STORAGE_KEY, null);
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

