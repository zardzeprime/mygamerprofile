import { createFileRoute, redirect } from "@tanstack/react-router";

import { ProfileCosmeticsPreview } from "@/components/profile/ProfileCosmeticsPreview";
import { ProfileIdentityPrivacy } from "@/components/profile/ProfileIdentityPrivacy";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export const Route = createFileRoute("/_authenticated/settings/identity")({
  loader: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { userId: data.user.id };
  },
  head: () => ({
    meta: [
      { title: "Identidade e cosméticos — MGP" },
      {
        name: "description",
        content: "Controle dados opcionais de identidade, privacidade e cosméticos do seu perfil MGP.",
      },
    ],
  }),
  component: IdentitySettingsPage,
});

function IdentitySettingsPage() {
  const { userId } = Route.useLoaderData();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <SettingsLayout>
      <div className="space-y-5">
        <div>
          <p className="section-kicker">MGP / 0.1.9</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
            {copy("Identidade & cosméticos", "Identity & cosmetics", "Identidad y cosméticos")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "A base da 0.2 separa dados pessoais opcionais das escolhas visuais do perfil, com privacidade por campo.",
              "The 0.2 foundation separates optional personal details from profile visual choices, with field-level privacy.",
              "La base de 0.2 separa los datos personales opcionales de las opciones visuales del perfil, con privacidad por campo.",
            )}
          </p>
        </div>

        <ProfileIdentityPrivacy userId={userId} locale={locale} />
        <ProfileCosmeticsPreview locale={locale} />
      </div>
    </SettingsLayout>
  );
}
