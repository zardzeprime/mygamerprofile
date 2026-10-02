import { createFileRoute, redirect } from "@tanstack/react-router";

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
      { title: "Dados e privacidade — ÍMPAR" },
      {
        name: "description",
        content: "Controle dados opcionais de identidade e privacidade do seu perfil ÍMPAR.",
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
          <p className="section-kicker">ÍMPAR / 0.1.9</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
            {copy("Dados opcionais & privacidade", "Optional data & privacy", "Datos opcionales y privacidad")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Controle aqui apenas os dados opcionais exibidos no perfil e a privacidade de cada campo. Títulos, fundos, molduras e outros cosméticos ficam concentrados em Perfil.",
              "Control only optional profile data and field-level privacy here. Titles, backgrounds, frames and other cosmetics now live together under Profile.",
              "Controla aquí solo los datos opcionales del perfil y la privacidad de cada campo. Los títulos, fondos, marcos y demás cosméticos quedan reunidos en Perfil.",
            )}
          </p>
        </div>

        <ProfileIdentityPrivacy userId={userId} locale={locale} />
      </div>
    </SettingsLayout>
  );
}
