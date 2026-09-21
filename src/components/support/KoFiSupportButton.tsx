import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SUPPORT_KOFI_ID, SUPPORT_KOFI_URL } from "@/config/support";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { DEFAULT_ACCENT_COLOR, useTheme } from "@/lib/theme";

declare global {
  interface Window {
    kofiwidget2?: {
      init: (label: string, color: string, id: string, selector?: string) => void;
      getHTML?: () => string;
      draw?: () => void;
    };
  }
}

const KOFI_SCRIPT_ID = "mgp-kofi-widget-script";
const KOFI_SCRIPT_SRC = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";

function ensureKoFiScript() {
  if (typeof document === "undefined") return Promise.resolve(false);
  if (window.kofiwidget2) return Promise.resolve(true);

  const existing = document.getElementById(KOFI_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<boolean>((resolve) => {
      if (window.kofiwidget2) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(Boolean(window.kofiwidget2)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.id = KOFI_SCRIPT_ID;
    script.src = KOFI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.kofiwidget2));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function KoFiSupportButton() {
  const { locale } = useI18n();
  const { accentColor } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [officialReady, setOfficialReady] = useState(false);
  const accent = accentColor ?? DEFAULT_ACCENT_COLOR;
  const label = localeCopy(
    locale,
    "Apoiar no Ko-fi",
    "Support me on Ko-fi",
    "Apoyar en Ko-fi",
  );

  useEffect(() => {
    let active = true;

    void ensureKoFiScript().then((loaded) => {
      if (!active || !loaded || !containerRef.current || !window.kofiwidget2) return;
      try {
        window.kofiwidget2.init(label, accent, SUPPORT_KOFI_ID);
        const html = window.kofiwidget2.getHTML?.();
        if (html) {
          containerRef.current.innerHTML = html;
          const link = containerRef.current.querySelector("a");
          if (link) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noreferrer");
          }
          setOfficialReady(true);
        }
      } catch (error) {
        console.warn("[MGP] Ko-fi widget fallback", error);
        setOfficialReady(false);
      }
    });

    return () => {
      active = false;
    };
  }, [accent, label]);

  return (
    <div className="min-h-11">
      <div
        ref={containerRef}
        className={officialReady ? "min-h-11 [&_a]:!no-underline" : "hidden"}
        aria-label={label}
      />
      {!officialReady ? (
        <a
          href={SUPPORT_KOFI_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
          style={{ backgroundColor: accent, color: "var(--mgp-user-accent-foreground, #111318)" }}
        >
          {label}
          <ExternalLink className="size-4" />
        </a>
      ) : null}
    </div>
  );
}
