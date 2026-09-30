import { useEffect, useState } from "react";
import { Globe2, MapPin, UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

type PublicIdentity = {
  gender_label: string | null;
  country_code: string | null;
  subdivision_code: string | null;
};

function countryFlag(code?: string | null) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;
  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function PublicProfileIdentity({ userId, locale }: { userId: string; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [identity, setIdentity] = useState<PublicIdentity | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.rpc("get_public_profile_identity", { p_user_id: userId });
      if (!active || error) return;
      setIdentity((data?.[0] ?? null) as PublicIdentity | null);
    };
    load();
    return () => {
      active = false;
    };
  }, [userId]);

  if (!identity) return null;
  const hasAny = identity.gender_label || identity.country_code || identity.subdivision_code;
  if (!hasAny) return null;

  const flag = countryFlag(identity.country_code);

  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
      {identity.gender_label ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5">
          <UserRound className="size-3.5" />
          {identity.gender_label}
        </span>
      ) : null}
      {identity.country_code ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5" title={copy("País", "Country", "País")}>
          <Globe2 className="size-3.5" />
          {flag ? <span aria-hidden="true">{flag}</span> : null}
          {identity.country_code}
        </span>
      ) : null}
      {identity.subdivision_code ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5" title={copy("Estado / província", "State / province", "Estado / provincia")}>
          <MapPin className="size-3.5" />
          {identity.subdivision_code}
        </span>
      ) : null}
    </div>
  );
}
