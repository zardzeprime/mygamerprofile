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

export const THEME_STORAGE_KEY = "mgp-theme";
export const ACCENT_STORAGE_KEY = "mgp-accent-color";
export const DEFAULT_ACCENT_COLOR = "#c9a95d";

type ThemeContextValue = {
  accentColor: string | null;
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
  const inlineAccent = root.style.getPropertyValue("--mgp-user-accent").trim();
  const accent =
    root.dataset["accent"] === "custom" && isHexColor(inlineAccent)
      ? inlineAccent
      : DEFAULT_ACCENT_COLOR;

  const bodyTop = "#252a32";
  const bodyBottom = "#101318";
  const neutralOutline = "#f2eee5";
  const highlight = "#59616d";
  const shadow = "#000000";

  // Default cursor: a slim sword. Keep cursor rendering data-driven so future
  // cosmetics (axe, knife, reticle, etc.) can plug into the same pipeline.
  const sword = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <path d="M7 33 31.5 8.5 35 5 33.2 10.2 10.5 35Z" fill="${shadow}" opacity=".22" transform="translate(1 1)"/>
      <path d="M7 33 31.5 8.5 35 5 33.2 10.2 10.5 35Z" fill="${bodyTop}" stroke="${neutralOutline}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 30 31.5 8.5" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M7 27 13 33M5.5 30.5 9.5 34.5" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M8.5 34.5 5.5 37.5" stroke="${neutralOutline}" stroke-width="2.5" stroke-linecap="round"/>
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

  root.style.setProperty("--mgp-cursor-default", `${cursorDataUri(sword)} 34 6`);
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
  theme_preference?: "dark";
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

/** Lock dark mode before first paint and preserve the independent accent preference. */
export const themeBootstrapScript = `(function(){var c=null;try{localStorage.setItem("mgp-theme","dark");c=localStorage.getItem("mgp-accent-color");}catch(e){}var r=document.documentElement;r.classList.add("dark");r.style.colorScheme="dark";if(c&&/^#[0-9a-f]{6}$/i.test(c)){r.style.setProperty("--mgp-user-accent",c);r.dataset.accent="custom";}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<string | null>(null);
  const userChangeRevision = useRef(0);

  useEffect(() => {
    let active = true;

    const storedAccent = readStored(ACCENT_STORAGE_KEY);
    const initialAccent = isHexColor(storedAccent) ? storedAccent.toLowerCase() : null;

    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    persist(THEME_STORAGE_KEY, "dark");
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

      // A late account fetch must never undo a color the user just picked.
      if (userChangeRevision.current !== revisionAtStart) return;

      const rawAccountAccent = profile.accent_color ?? null;
      const accountAccent = isHexColor(rawAccountAccent) ? rawAccountAccent.toLowerCase() : null;

      if (profile.theme_preference !== "dark") {
        void persistAccountPreference({ theme_preference: "dark" });
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
      accentColor,
      setAccentColor,
      resetAccentColor,
    }),
    [accentColor, setAccentColor, resetAccentColor],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
