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
import type { Database } from "@/integrations/supabase/types";

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

type ProfileAppearanceRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "theme_preference"
> & { accent_color?: string | null };
type ProfileAppearanceUpdate = Database["public"]["Tables"]["profiles"]["Update"] & {
  accent_color?: string | null;
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
  const luminance = 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
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

  // Match the cursor body to the active theme. Contrast comes from a slim
  // neutral outer keyline instead of inverting the entire cursor.
  const bodyTop = dark ? "#252a32" : "#ffffff";
  const bodyBottom = dark ? "#101318" : "#e9e3d8";
  const neutralOutline = dark ? "#f2eee5" : "#24272d";
  const highlight = dark ? "#59616d" : "#ffffff";
  const shadow = dark ? "#000000" : "#202329";

  const arrowPath = "M6.2 4.6 27.1 17.1 18.3 19.2 14.2 29.3 10.4 27.5 13.9 18.5 6.2 15.9Z";

  const arrow = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <defs>
        <linearGradient id="body" x1="7" y1="5" x2="18" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${bodyTop}"/>
          <stop offset="1" stop-color="${bodyBottom}"/>
        </linearGradient>
      </defs>
      <path d="${arrowPath}" fill="${shadow}" opacity="0.18" transform="translate(1.15 1.15)"/>
      <path d="${arrowPath}" fill="url(#body)" stroke="${neutralOutline}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${arrowPath}" fill="none" stroke="${accent}" stroke-width="1.45" stroke-linejoin="round"/>
      <path d="M8.4 8.1 21.5 15.9" fill="none" stroke="${highlight}" stroke-width="1.3" stroke-linecap="round" opacity="0.48"/>
      <path d="M12.3 25.8 15.6 18.2" fill="none" stroke="${accent}" stroke-width="1.15" stroke-linecap="round" opacity="0.82"/>
    </svg>
  `;

  const pointer = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <defs>
        <radialGradient id="body" cx="38%" cy="32%" r="72%">
          <stop offset="0" stop-color="${bodyTop}"/>
          <stop offset="1" stop-color="${bodyBottom}"/>
        </radialGradient>
      </defs>
      <circle cx="20.9" cy="20.9" r="10.4" fill="${shadow}" opacity="0.16"/>
      <circle cx="20" cy="20" r="10" fill="url(#body)" stroke="${neutralOutline}" stroke-width="3"/>
      <circle cx="20" cy="20" r="10" fill="none" stroke="${accent}" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="2" fill="${accent}"/>
      <g fill="none" stroke="${accent}" stroke-width="1.8" stroke-linecap="round">
        <path d="M20 5.2v5.1M20 29.7v5.1"/>
        <path d="M5.2 20h5.1M29.7 20h5.1"/>
      </g>
      <path d="M15.2 15.1a6.7 6.7 0 0 1 4.1-1.7" fill="none" stroke="${highlight}" stroke-width="1.2" stroke-linecap="round" opacity="0.42"/>
    </svg>
  `;

  root.style.setProperty("--mgp-cursor-default", `${cursorDataUri(arrow)} 6 5`);
  root.style.setProperty("--mgp-cursor-pointer", `${cursorDataUri(pointer)} 20 20`);
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

async function persistAccountPreference(patch: {
  theme_preference?: ThemePreference;
  accent_color?: string | null;
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const appearanceProfiles = supabase.from("profiles") as unknown as {
      update: (values: ProfileAppearanceUpdate) => {
        eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await appearanceProfiles.update(patch).eq("id", user.id);

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
  const dark = preference === "dark" || (preference === "system" && systemPrefersDark());
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
      const { data: rawProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      const profile = rawProfile as ProfileAppearanceRow | null;

      if (!active || error || !profile) return;

      // A late account fetch must never undo a color/theme the user just picked.
      if (userChangeRevision.current !== revisionAtStart) return;

      const accountTheme = isThemePreference(profile.theme_preference)
        ? profile.theme_preference
        : null;
      const accountAccent = isHexColor(profile.accent_color ?? null)
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
        const appearanceProfiles = supabase.from("profiles") as unknown as {
          update: (values: ProfileAppearanceUpdate) => {
            eq: (column: "id", value: string) => Promise<unknown>;
          };
        };
        void appearanceProfiles.update({ accent_color: initialAccent }).eq("id", userId);
      }
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void hydrateAccount(data.user.id);
    });

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void hydrateAccount(session.user.id);
      }
    });

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
