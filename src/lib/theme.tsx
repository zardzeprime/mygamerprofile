import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const THEME_STORAGE_KEY = "mgp-theme";
export const ACCENT_STORAGE_KEY = "mgp-accent-color";
export const CURSOR_STORAGE_KEY = "mgp-cursor";
export const DEFAULT_ACCENT_COLOR = "#c9a95d";
export type CursorStyle = "sword" | "axe" | "reticle";

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
const isCursor=(v:string|null):v is CursorStyle=>v==="sword"||v==="axe"||v==="reticle";
function readableForeground(v:string):"#111318"|"#ffffff"{const x=[1,3,5].map(i=>Number.parseInt(v.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*x[0]+.7152*x[1]+.0722*x[2]>.42?"#111318":"#ffffff"}
const uri=(svg:string)=>`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
function applyCursor(style:CursorStyle){
 if(typeof document==="undefined")return; const r=document.documentElement,a=r.style.getPropertyValue("--mgp-user-accent").trim(),accent=r.dataset.accent==="custom"&&isHexColor(a)?a:DEFAULT_ACCENT_COLOR;
 const sword=`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M7 33 31.5 8.5 35 5 33.2 10.2 10.5 35Z" fill="#252a32" stroke="#f2eee5" stroke-width="2"/><path d="M10 30 31.5 8.5M7 27 13 33" stroke="${accent}" stroke-width="2"/><path d="M8.5 34.5 5.5 37.5" stroke="#f2eee5" stroke-width="2.5"/></svg>`;
 const axe=`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M9 35 27 9" stroke="#f2eee5" stroke-width="5" stroke-linecap="round"/><path d="M22 7c6-4 11-2 14 1-2 7-7 11-14 10 2-3 2-7 0-11Z" fill="${accent}" stroke="#f2eee5" stroke-width="1.5"/></svg>`;
 const reticle=`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="9" fill="#101318" stroke="#f2eee5" stroke-width="2"/><circle cx="20" cy="20" r="2" fill="${accent}"/><path d="M20 4v9m0 14v9M4 20h9m14 0h9" stroke="${accent}" stroke-width="2"/></svg>`;
 const map={sword:[sword,"34 6"],axe:[axe,"9 35"],reticle:[reticle,"20 20"]} as const; const [svg,hot]=map[style];
 r.style.setProperty("--mgp-cursor-default",`${uri(svg)} ${hot}`);r.style.setProperty("--mgp-cursor-pointer",`${uri(reticle)} 20 20`);
}
function applyAccent(v:string|null, cursor:CursorStyle){if(typeof document==="undefined")return;const r=document.documentElement;r.style.removeProperty("--mgp-user-accent-foreground");if(isHexColor(v)){r.style.setProperty("--mgp-user-accent",v);r.style.setProperty("--mgp-user-accent-foreground",readableForeground(v));r.dataset.accent="custom"}else{r.style.removeProperty("--mgp-user-accent");delete r.dataset.accent}applyCursor(cursor)}
function read(k:string){try{return localStorage.getItem(k)}catch{return null}} function store(k:string,v:string|null){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}}
async function persistAccountPreference(patch:{theme_preference?:"dark";accent_color?:string|null}){try{const{data:{user}}=await supabase.auth.getUser();if(!user)return;const p=supabase.from("profiles") as unknown as {update:(v:ProfileAppearanceUpdate)=>{eq:(c:"id",v:string)=>Promise<{error:{message:string}|null}>}};const{error}=await p.update(patch).eq("id",user.id);if(error)console.warn("[MGP] appearance sync",error.message)}catch(e){console.warn("[MGP] appearance local only",e)}}
export const themeBootstrapScript=`(function(){try{localStorage.setItem("mgp-theme","dark")}catch(e){}var r=document.documentElement;r.classList.add("dark");r.style.colorScheme="dark";})();`;
export function ThemeProvider({children}:{children:ReactNode}){
 const [accentColor,setAccentState]=useState<string|null>(null),[cursorStyle,setCursorState]=useState<CursorStyle>("sword");const rev=useRef(0);
 useEffect(()=>{let active=true;const sa=read(ACCENT_STORAGE_KEY),a=isHexColor(sa)?sa.toLowerCase():null,c=isCursor(read(CURSOR_STORAGE_KEY))?read(CURSOR_STORAGE_KEY) as CursorStyle:"sword";document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";store(THEME_STORAGE_KEY,"dark");setAccentState(a);setCursorState(c);applyAccent(a,c);
 const hydrate=async(id:string)=>{const at=rev.current;const{data:raw,error}=await supabase.from("profiles").select("*").eq("id",id).maybeSingle();const p=raw as ProfileAppearanceRow|null;if(!active||error||!p||rev.current!==at)return;if(p.theme_preference!=="dark")void persistAccountPreference({theme_preference:"dark"});const aa=isHexColor(p.accent_color??null)?p.accent_color!.toLowerCase():null;if(aa){setAccentState(aa);store(ACCENT_STORAGE_KEY,aa);applyAccent(aa,c)}};void supabase.auth.getUser().then(({data})=>{if(active&&data.user)void hydrate(data.user.id)});const{data:s}=supabase.auth.onAuthStateChange((e,x)=>{if(e==="SIGNED_IN"&&x?.user)void hydrate(x.user.id)});return()=>{active=false;s.subscription.unsubscribe()}},[]);
 const setAccentColor=useCallback((v:string)=>{if(!isHexColor(v))return;rev.current++;const n=v.toLowerCase();setAccentState(n);store(ACCENT_STORAGE_KEY,n);applyAccent(n,cursorStyle);void persistAccountPreference({accent_color:n})},[cursorStyle]);
 const resetAccentColor=useCallback(()=>{rev.current++;setAccentState(null);store(ACCENT_STORAGE_KEY,null);applyAccent(null,cursorStyle);void persistAccountPreference({accent_color:null})},[cursorStyle]);
 const setCursorStyle=useCallback((v:CursorStyle)=>{setCursorState(v);store(CURSOR_STORAGE_KEY,v);applyCursor(v)},[]);
 const value=useMemo(()=>({accentColor,cursorStyle,setAccentColor,resetAccentColor,setCursorStyle}),[accentColor,cursorStyle,setAccentColor,resetAccentColor,setCursorStyle]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
export function useTheme(){const c=useContext(ThemeContext);if(!c)throw new Error("useTheme must be used inside ThemeProvider");return c}
