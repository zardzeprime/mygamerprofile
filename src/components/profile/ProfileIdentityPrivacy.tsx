import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Globe2, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

type Visibility = "public" | "private";

type IdentityState = {
  genderLabel: string;
  countryCode: string;
  subdivisionCode: string;
  genderVisibility: Visibility;
  countryVisibility: Visibility;
  subdivisionVisibility: Visibility;
};

const EMPTY_IDENTITY: IdentityState = {
  genderLabel: "",
  countryCode: "",
  subdivisionCode: "",
  genderVisibility: "private",
  countryVisibility: "private",
  subdivisionVisibility: "private",
};

const COMMON_COUNTRIES = [
  ["BR", "Brasil"],
  ["PT", "Portugal"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["MX", "México"],
  ["AR", "Argentina"],
  ["CL", "Chile"],
  ["CO", "Colombia"],
  ["PE", "Perú"],
  ["UY", "Uruguay"],
  ["ES", "España"],
  ["FR", "France"],
  ["DE", "Deutschland"],
  ["GB", "United Kingdom"],
  ["JP", "日本"],
  ["KR", "대한민국"],
] as const;

function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function ProfileIdentityPrivacy({ userId, locale }: { userId: string; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [state, setState] = useState<IdentityState>(EMPTY_IDENTITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedCountryLabel = useMemo(() => {
    const item = COMMON_COUNTRIES.find(([code]) => code === state.countryCode);
    return item ? `${countryFlag(item[0])} ${item[1]}` : "";
  }, [state.countryCode]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const { data, error: loadError } = await supabase
        .from("profile_identity_details")
        .select(
          "gender_label,country_code,subdivision_code,gender_visibility,country_visibility,subdivision_visibility",
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;
      if (loadError) {
        setError(loadError.message);
      } else if (data) {
        setState({
          genderLabel: data.gender_label ?? "",
          countryCode: data.country_code ?? "",
          subdivisionCode: data.subdivision_code ?? "",
          genderVisibility: data.gender_visibility === "public" ? "public" : "private",
          countryVisibility: data.country_visibility === "public" ? "public" : "private",
          subdivisionVisibility: data.subdivision_visibility === "public" ? "public" : "private",
        });
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    const countryCode = state.countryCode.trim().toUpperCase();
    if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) {
      setSaving(false);
      setError(copy("Escolha um país válido.", "Choose a valid country.", "Elige un país válido."));
      return;
    }

    const { error: saveError } = await supabase.from("profile_identity_details").upsert(
      {
        user_id: userId,
        gender_label: state.genderLabel.trim() || null,
        country_code: countryCode || null,
        subdivision_code: state.subdivisionCode.trim() || null,
        gender_visibility: state.genderVisibility,
        country_visibility: state.countryVisibility,
        subdivision_visibility: state.subdivisionVisibility,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (saveError) {
      setError(saveError.message);
    } else {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <section className="surface-panel grid min-h-44 place-items-center rounded-2xl p-6 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </section>
    );
  }

  return (
    <section className="surface-panel rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-gold-strong" />
            <h2 className="font-display text-lg font-semibold">
              {copy("Identidade e privacidade", "Identity and privacy", "Identidad y privacidad")}
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Esses campos são opcionais e começam privados. Você decide separadamente o que aparece no seu perfil público. Data de nascimento nunca aparece aqui.",
              "These fields are optional and start private. You decide separately what appears on your public profile. Birth date is never shown here.",
              "Estos campos son opcionales y empiezan privados. Tú decides por separado qué aparece en tu perfil público. La fecha de nacimiento nunca se muestra aquí.",
            )}
          </p>
        </div>
        <Globe2 className="size-5 shrink-0 text-gold-strong" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <IdentityField
          label={copy(
            "Gênero / como quer se identificar",
            "Gender / how you identify",
            "Género / cómo te identificas",
          )}
          visibility={state.genderVisibility}
          onVisibility={(visibility) =>
            setState((current) => ({ ...current, genderVisibility: visibility }))
          }
          copy={copy}
        >
          <Input
            value={state.genderLabel}
            onChange={(event) =>
              setState((current) => ({ ...current, genderLabel: event.target.value }))
            }
            maxLength={60}
            placeholder={copy("Opcional", "Optional", "Opcional")}
          />
        </IdentityField>

        <IdentityField
          label={copy("País", "Country", "País")}
          visibility={state.countryVisibility}
          onVisibility={(visibility) =>
            setState((current) => ({ ...current, countryVisibility: visibility }))
          }
          copy={copy}
        >
          <Select
            value={state.countryCode || "none"}
            onValueChange={(value) =>
              setState((current) => ({ ...current, countryCode: value === "none" ? "" : value }))
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={copy("Selecionar país", "Select country", "Seleccionar país")}
              >
                {selectedCountryLabel || copy("Não informar", "Do not specify", "No indicar")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                {copy("Não informar", "Do not specify", "No indicar")}
              </SelectItem>
              {COMMON_COUNTRIES.map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {countryFlag(code)} {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </IdentityField>

        <IdentityField
          label={copy("Estado / província", "State / province", "Estado / provincia")}
          visibility={state.subdivisionVisibility}
          onVisibility={(visibility) =>
            setState((current) => ({ ...current, subdivisionVisibility: visibility }))
          }
          copy={copy}
        >
          <Input
            value={state.subdivisionCode}
            onChange={(event) =>
              setState((current) => ({ ...current, subdivisionCode: event.target.value }))
            }
            maxLength={12}
            placeholder={copy("Ex.: BA, SP, CA", "e.g. BA, SP, CA", "Ej.: BA, SP, CA")}
          />
        </IdentityField>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {saved ? (
        <p className="mt-4 text-sm text-success">
          {copy("Privacidade salva.", "Privacy saved.", "Privacidad guardada.")}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-xs leading-5 text-muted-foreground">
          {copy(
            "O perfil público recebe apenas os campos marcados como públicos através de uma função segura do banco.",
            "The public profile receives only fields marked public through a safe database function.",
            "El perfil público recibe únicamente los campos marcados como públicos mediante una función segura de la base de datos.",
          )}
        </p>
        <Button type="button" onClick={save} disabled={saving} className="shrink-0">
          {saving
            ? copy("Salvando…", "Saving…", "Guardando…")
            : copy("Salvar privacidade", "Save privacy", "Guardar privacidad")}
        </Button>
      </div>
    </section>
  );
}

function IdentityField({
  label,
  visibility,
  onVisibility,
  copy,
  children,
}: {
  label: string;
  visibility: Visibility;
  onVisibility: (visibility: Visibility) => void;
  copy: (pt: string, en: string, es: string) => string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-4">
      <Label>{label}</Label>
      {children}
      <button
        type="button"
        onClick={() => onVisibility(visibility === "public" ? "private" : "public")}
        className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {visibility === "public" ? (
          <Eye className="size-3.5 text-gold-strong" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
        {visibility === "public"
          ? copy("Visível no perfil", "Visible on profile", "Visible en el perfil")
          : copy("Privado", "Private", "Privado")}
      </button>
    </div>
  );
}
