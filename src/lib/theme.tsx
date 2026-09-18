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

import { supabase } from "@/integrations/supabase/client";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "mgp-theme";
export const ACCENT_STORAGE_KEY = "mgp-accent-color";
export const DEFAULT_ACCENT_COLOR = "#c9a95d";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: "light" | "dark";
  accentColor: string | null;
  setPreference: (value: ThemePreference) => void;
  setAccentColor: (value: string) => void;
  resetAccentColor: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function isHexColor(value: string | null): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function readableForeground(value: string): "#111318" | "#ffffff" {
  const red = Number.parseInt(value.slice(1, 3), 16) / 255;
  const green = Number.parseInt(value.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(value.slice(5, 7), 16) / 255;
  const linear = (channel: number) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance =
    0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  return luminance > 0.42 ? "#111318" : "#ffffff";
}

function cursorDataUri(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function applyCursorAppearance() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const dark = root.classList.contains("dark");
  const inlineAccent = root.style.getPropertyValue("--mgp-user-accent").trim();
  const accent =
    root.dataset["accent"] === "custom" && isHexColor(inlineAccent)
      ? inlineAccent
      : DEFAULT_ACCENT_COLOR;

  // Cursor body intentionally contrasts with the page theme.
  const bodyStart = dark ? "#ffffff" : "#30343b";
  const bodyMid = dark ? "#f2eee5" : "#171a20";
  const bodyEnd = dark ? "#d7d0c4" : "#090b0e";
  const lensStart = dark ? "#ffffff" : "#343a44";
  const lensEnd = dark ? "#ddd5c7" : "#0b0d11";
  const highlight = dark ? "#ffffff" : "#eef1f5";
  const shadow = dark ? "#0b0d11" : "#000000";

  const arrow = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="body" x1="5" y1="4" x2="19" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${bodyStart}"/>
          <stop offset="0.55" stop-color="${bodyMid}"/>
          <stop offset="1" stop-color="${bodyEnd}"/>
        </linearGradient>
      </defs>
      <path d="M5.2 4.8 23.25 15.15 15.3 17.45 11.05 26.05Z" fill="${shadow}" opacity="0.28" transform="translate(.9 .9)"/>
      <path d="M4.35 3.65 22.95 14.75 14.65 17.18 10.45 25.92Z" fill="url(#body)" stroke="${accent}" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M6.2 6.05 18.85 13.55" fill="none" stroke="${highlight}" stroke-width="1.05" stroke-linecap="round" opacity="0.34"/>
      <circle cx="24.2" cy="7.2" r="4.1" fill="${bodyMid}" fill-opacity="0.96" stroke="${accent}" stroke-width="1.2"/>
      <circle cx="24.2" cy="7.2" r="1.15" fill="${accent}"/>
      <g fill="none" stroke="${accent}" stroke-width="1.35" stroke-linecap="round">
        <path d="M24.2 2.25v2.25M24.2 9.9v2.25"/>
        <path d="M19.25 7.2h2.25M26.9 7.2h2.25"/>
      </g>
    </svg>
  `;

  const pointer = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="lens" cx="35%" cy="30%" r="72%">
          <stop offset="0" stop-color="${lensStart}"/>
          <stop offset="1" stop-color="${lensEnd}"/>
        </radialGradient>
      </defs>
      <circle cx="16.7" cy="16.8" r="10" fill="${shadow}" opacity="0.24"/>
      <circle cx="16" cy="16" r="9.7" fill="url(#lens)" stroke="${accent}" stroke-width="1.75"/>
      <circle cx="16" cy="16" r="6.4" fill="none" stroke="${accent}" stroke-width="0.95" opacity="0.42"/>
      <circle cx="16" cy="16" r="1.55" fill="${accent}"/>
      <circle cx="14.2" cy="13.8" r="2.25" fill="${highlight}" opacity="0.2"/>
      <g fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round">
        <path d="M16 3.5v5.2M16 23.3v5.2"/>
        <path d="M3.5 16h5.2M23.3 16h5.2"/>
      </g>
    </svg>
  `;

  root.style.setProperty("--mgp-cursor-default", `${cursorDataUri(arrow)} 4 4`);
  root.style.setProperty("--mgp-cursor-pointer", `${cursorDataUri(pointer)} 16 16`);
}

function applyAccentColor(value: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.removeProperty("--mgp-user-accent-foreground");

  if (isHexColor(value)) {
    root.style.setProperty("--mgp-user-accent", value);
    root.style.setProperty("--mgp-user-accent-foreground", readableForeground(value));
    root.dataset["accent"] = "custom";
  } else {
    root.style.removeProperty("--mgp-user-accent");
    delete root.dataset["accent"];
  }

  applyCursorAppearance();
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function persist(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Preferences still work when browser storage is unavailable.
  }
}

async function persistAccountPreference(
  patch: { theme_preference?: ThemePreference; accent_color?: string | null },
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id);

    if (error) console.warn("[MGP] Could not sync appearance preference", error.message);
  } catch (error) {
    console.warn("[MGP] Appearance preference remains local", error);
  }
}

/** Apply local preferences before first paint; account sync follows after hydration. */
export const themeBootstrapScript = `(function(){var p="system",c=null;try{p=localStorage.getItem("mgp-theme")||"system";c=localStorage.getItem("mgp-accent-color");}catch(e){}var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var d=p==="dark"||(p!=="light"&&p!=="dark"&&m);var r=document.documentElement;r.classList.toggle("dark",!!d);r.style.colorScheme=d?"dark":"light";if(c&&/^#[0-9a-f]{6}$/i.test(c)){var h=c.slice(1),R=parseInt(h.slice(0,2),16)/255,G=parseInt(h.slice(2,4),16)/255,B=parseInt(h.slice(4,6),16)/255,L=function(x){return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)},Y=.2126*L(R)+.7152*L(G)+.0722*L(B);r.style.setProperty("--mgp-user-accent",c);r.style.setProperty("--mgp-user-accent-foreground",Y>.42?"#111318":"#ffffff");r.dataset.accent="custom";}})();`;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(preference: ThemePreference): "light" | "dark" {
  const dark =
    preference === "dark" || (preference === "system" && systemPrefersDark());
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    applyCursorAppearance();
  }
  return dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [accentColor, setAccentColorState] = useState<string | null>(null);
  const userChangeRevision = useRef(0);

  useEffect(() => {
    let active = true;

    const storedTheme = readStored(THEME_STORAGE_KEY);
    const initialPreference: ThemePreference = isThemePreference(storedTheme)
      ? storedTheme
      : "system";
    const storedAccent = readStored(ACCENT_STORAGE_KEY);
    const initialAccent = isHexColor(storedAccent) ? storedAccent.toLowerCase() : null;

    setPreferenceState(initialPreference);
    setResolved(applyTheme(initialPreference));
    setAccentColorState(initialAccent);
    applyAccentColor(initialAccent);

    const hydrateAccount = async (userId: string) => {
      const revisionAtStart = userChangeRevision.current;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("theme_preference,accent_color")
        .eq("id", userId)
        .maybeSingle();

      if (!active || error || !profile) return;

      // A late account fetch must never undo a color/theme the user just picked.
      if (userChangeRevision.current !== revisionAtStart) return;

      const accountTheme = isThemePreference(profile.theme_preference)
        ? profile.theme_preference
        : null;
      const accountAccent = isHexColor(profile.accent_color)
        ? profile.accent_color.toLowerCase()
        : null;

      if (accountTheme) {
        setPreferenceState(accountTheme);
        persist(THEME_STORAGE_KEY, accountTheme);
        setResolved(applyTheme(accountTheme));
      }

      if (accountAccent) {
        setAccentColorState(accountAccent);
        persist(ACCENT_STORAGE_KEY, accountAccent);
        applyAccentColor(accountAccent);
      } else if (initialAccent) {
        void supabase
          .from("profiles")
          .update({ accent_color: initialAccent })
          .eq("id", userId);
      }
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void hydrateAccount(data.user.id);
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          void hydrateAccount(session.user.id);
        }
      },
    );

    return () => {
      active = false;
      authSubscription.subscription.unsubscribe();
    };
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
    userChangeRevision.current += 1;
    setPreferenceState(value);
    persist(THEME_STORAGE_KEY, value);
    setResolved(applyTheme(value));
    void persistAccountPreference({ theme_preference: value });
  }, []);

  const setAccentColor = useCallback((value: string) => {
    if (!isHexColor(value)) return;
    userChangeRevision.current += 1;
    const normalized = value.toLowerCase();
    setAccentColorState(normalized);
    persist(ACCENT_STORAGE_KEY, normalized);
    applyAccentColor(normalized);
    void persistAccountPreference({ accent_color: normalized });
  }, []);

  const resetAccentColor = useCallback(() => {
    userChangeRevision.current += 1;
    setAccentColorState(null);
    persist(ACCENT_STORAGE_KEY, null);
    applyAccentColor(null);
    void persistAccountPreference({ accent_color: null });
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
