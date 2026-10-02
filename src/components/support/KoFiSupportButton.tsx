import { ExternalLink } from "lucide-react";

import { SUPPORT_KOFI_URL } from "@/config/support";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { DEFAULT_ACCENT_COLOR, useTheme } from "@/lib/theme";

export function KoFiSupportButton() {
  const { locale } = useI18n();
  const { accentColor } = useTheme();
  const accent = accentColor ?? DEFAULT_ACCENT_COLOR;
  const label = localeCopy(locale, "Apoiar no Ko-fi", "Support me on Ko-fi", "Apoyar en Ko-fi");

  return (
    <a
      href={SUPPORT_KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
      style={{
        backgroundColor: accent,
        color: "var(--mgp-user-accent-foreground, #111318)",
      }}
    >
      {label}
      <ExternalLink className="size-4" />
    </a>
  );
}
