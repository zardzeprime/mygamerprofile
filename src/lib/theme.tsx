import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const THEME_STORAGE_KEY = "mgp-theme";
export const ACCENT_STORAGE_KEY = "mgp-accent-color";
export const CURSOR_STORAGE_KEY = "mgp-cursor-v2";
export const DEFAULT_ACCENT_COLOR = "#c9a95d";
export type CursorStyle = "classic" | "sword" | "axe" | "reticle";

type ThemeContextValue = {
  accentColor: string | null;
  cursorStyle: CursorStyle;
  setAccentColor: (value: string) => void;
  resetAccentColor: () => void;
  setCursorStyle: (value: CursorStyle) => void;
};
type ProfileAppearanceRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "theme_preference"> & { accent_color?: string | null };
type ProfileAppearanceUpdate = Database["public"]["Tables"]["profiles"]["Update"] & { accent_color?: string | null };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const isHexColor=(v:string|null):v is string=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v);
const isCursor=(v:string|null):v is CursorStyle=>v==="classic"||v==="sword"||v==="axe"||v==="reticle";
function readableForeground(v:string):"#111318"|"#ffffff"{const x=[1,3,5].map(i=>Number.parseInt(v.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);const [red=0,green=0,blue=0]=x;return .2126*red+.7152*green+.0722*blue>.42?"#111318":"#ffffff"}
const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

function classicCursor(accent: string, active: boolean) {
  if (active) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="30" viewBox="0 0 28 30">
      <path d="M9.1 2.7v10.2-5.6c0-1.3.9-2.3 2-2.3 1.2 0 2 .9 2 2.2v4.1-5.1c0-1.2.9-2.2 2-2.2 1.1 0 2 .9 2 2.1v5.3-3.8c0-1.2.8-2 1.9-2 1.2 0 2 .9 2 2.1v4.6-2.7c0-1.1.8-1.9 1.8-1.9 1.1 0 1.9.8 1.9 2v6.4c0 6.6-3.6 10.4-9.5 10.4-4.6 0-7-2.2-9.4-6.2L3 15.9c-.7-1.1-.3-2.5.8-3.2 1-.6 2.2-.4 3 .5l2.3 2.8V2.8c0-1.2.9-2.2 2-2.2 1.1 0 2 .9 2 2.1" fill="#f4f1ea" stroke="#0b0d10" stroke-width="2" stroke-linejoin="round"/>
      <path d="M9.2 3.2v10.9" stroke="${accent}" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30">
    <path d="M3 2.3 19.4 16l-7.2 1.3 4.2 8-4 2.1-4.1-8-5.3 5.2Z" fill="#f4f1ea" stroke="#0b0d10" stroke-width="2.1" stroke-linejoin="round"/>
    <path d="M4.7 5.8 14.6 14l-4.8.9" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function swordCursor(accent: string, active: boolean) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
    <path d="M4.2 4.1 18.9 18.8" stroke="#0b0d10" stroke-width="5.4" stroke-linecap="round"/>
    <path d="M4.2 4.1 18.9 18.8" stroke="#f4f1ea" stroke-width="3.1" stroke-linecap="round"/>
    <path d="m3.2 3.1 5.5 1.2-4.3 4.3Z" fill="${accent}" stroke="#0b0d10" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="m16.6 16.5 5.2 5.2" stroke="${accent}" stroke-width="${active ? 3 : 2.2}" stroke-linecap="round"/>
    <path d="m14.2 19 4.8-4.8" stroke="#f4f1ea" stroke-width="2.1" stroke-linecap="round"/>
    <path d="m21.4 21.4 3.7 3.7" stroke="#f4f1ea" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`;
}

function axeCursor(accent: string, active: boolean) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
    <path d="M6 5.2 20.2 23.8" stroke="#0b0d10" stroke-width="5.8" stroke-linecap="round"/>
    <path d="M6 5.2 20.2 23.8" stroke="#f4f1ea" stroke-width="3.1" stroke-linecap="round"/>
    <path d="M4 3.5c4.8-.8 8.5.8 11.1 4.2-2.7 3.4-6 5-10.1 4.8.9-2.4.6-5.2-1-9Z" fill="${accent}" stroke="#0b0d10" stroke-width="1.35" stroke-linejoin="round"/>
    ${active ? '<path d="M5.4 5.4 9 9" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>' : ""}
  </svg>`;
}

function reticleCursor(accent: string, active: boolean) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="${active ? 6.2 : 5.2}" fill="#0b0d10" stroke="#f4f1ea" stroke-width="1.7"/>
    <circle cx="14" cy="14" r="1.6" fill="${accent}"/>
    <path d="M14 2.5v5M14 20.5v5M2.5 14h5M20.5 14h5" stroke="${accent}" stroke-width="${active ? 2 : 1.6}" stroke-linecap="round"/>
  </svg>`;
}

function applyCursor(style: CursorStyle) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const customAccent = root.style.getPropertyValue("--mgp-user-accent").trim();
  const accent =
    root.dataset["accent"] === "custom" && isHexColor(customAccent)
      ? customAccent
      : DEFAULT_ACCENT_COLOR;

  const defaultSvg =
    style === "classic"
      ? classicCursor(accent, false)
      : style === "sword"
        ? swordCursor(accent, false)
        : style === "axe"
          ? axeCursor(accent, false)
          : reticleCursor(accent, false);
  const activeSvg =
    style === "classic"
      ? classicCursor(accent, true)
      : style === "sword"
        ? swordCursor(accent, true)
        : style === "axe"
          ? axeCursor(accent, true)
          : reticleCursor(accent, true);
  const hotSpot = style === "reticle" ? "14 14" : style === "classic" ? "3 2" : "4 4";

  root.style.setProperty("--mgp-cursor-default", `${uri(defaultSvg)} ${hotSpot}`);
  root.style.setProperty("--mgp-cursor-pointer", `${uri(activeSvg)} ${hotSpot}`);
}

function applyAccent(v:string|null, cursor:CursorStyle){if(typeof document==="undefined")return;const r=document.documentElement;r.style.removeProperty("--mgp-user-accent-foreground");if(isHexColor(v)){r.style.setProperty("--mgp-user-accent",v);r.style.setProperty("--mgp-user-accent-foreground",readableForeground(v));r.dataset["accent"]="custom"}else{r.style.removeProperty("--mgp-user-accent");delete r.dataset["accent"]}applyCursor(cursor)}
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Appearance preferences remain available in memory when storage is blocked.
  }
}
async function persistAccountPreference(patch:{theme_preference?:"dark";accent_color?:string|null}){try{const{data:{user}}=await supabase.auth.getUser();if(!user)return;const p=supabase.from("profiles") as unknown as {update:(v:ProfileAppearanceUpdate)=>{eq:(c:"id",v:string)=>Promise<{error:{message:string}|null}>}};const{error}=await p.update(patch).eq("id",user.id);if(error)console.warn("[MGP] appearance sync",error.message)}catch(e){console.warn("[MGP] appearance local only",e)}}
export const themeBootstrapScript=`(function(){var r=document.documentElement;r.classList.add("dark");r.style.colorScheme="dark";try{localStorage.setItem("mgp-theme","dark");var a=localStorage.getItem("mgp-accent-color");if(a&&/^#[0-9a-f]{6}$/i.test(a)){r.style.setProperty("--mgp-user-accent",a.toLowerCase());r.dataset.accent="custom"}else{r.style.removeProperty("--mgp-user-accent");delete r.dataset.accent}}catch(e){}})();`;
export function ThemeProvider({children}:{children:ReactNode}){
 const [accentColor,setAccentState]=useState<string|null>(null),[cursorStyle,setCursorState]=useState<CursorStyle>("classic");const rev=useRef(0);
 useEffect(()=>{let active=true;const sa=read(ACCENT_STORAGE_KEY),a=isHexColor(sa)?sa.toLowerCase():null,c=isCursor(read(CURSOR_STORAGE_KEY))?read(CURSOR_STORAGE_KEY) as CursorStyle:"classic";document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";store(THEME_STORAGE_KEY,"dark");setAccentState(a);setCursorState(c);applyAccent(a,c);
 const hydrate=async(id:string)=>{const at=rev.current;const{data:raw,error}=await supabase.from("profiles").select("*").eq("id",id).maybeSingle();const p=raw as ProfileAppearanceRow|null;if(!active||error||!p||rev.current!==at)return;if(p.theme_preference!=="dark")void persistAccountPreference({theme_preference:"dark"});const aa=isHexColor(p.accent_color??null)?p.accent_color!.toLowerCase():null;if(aa){setAccentState(aa);store(ACCENT_STORAGE_KEY,aa);applyAccent(aa,c)}};void supabase.auth.getUser().then(({data})=>{if(active&&data.user)void hydrate(data.user.id)});const{data:s}=supabase.auth.onAuthStateChange((e,x)=>{if(e==="SIGNED_IN"&&x?.user)void hydrate(x.user.id)});return()=>{active=false;s.subscription.unsubscribe()}},[]);
 const setAccentColor=useCallback((v:string)=>{if(!isHexColor(v))return;rev.current++;const n=v.toLowerCase();setAccentState(n);store(ACCENT_STORAGE_KEY,n);applyAccent(n,cursorStyle);void persistAccountPreference({accent_color:n})},[cursorStyle]);
 const resetAccentColor=useCallback(()=>{rev.current++;setAccentState(null);store(ACCENT_STORAGE_KEY,null);applyAccent(null,cursorStyle);void persistAccountPreference({accent_color:null})},[cursorStyle]);
 const setCursorStyle=useCallback((v:CursorStyle)=>{setCursorState(v);store(CURSOR_STORAGE_KEY,v);applyCursor(v)},[]);
 const value=useMemo(()=>({accentColor,cursorStyle,setAccentColor,resetAccentColor,setCursorStyle}),[accentColor,cursorStyle,setAccentColor,resetAccentColor,setCursorStyle]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
export function useTheme(){const c=useContext(ThemeContext);if(!c)throw new Error("useTheme must be used inside ThemeProvider");return c}
