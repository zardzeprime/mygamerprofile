import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Clock3,
  Gamepad2,
  Globe2,
  Link2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShieldQuestion,
  Swords,
} from "lucide-react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings/connections")({
  head: () => ({
    meta: [
      { title: "Contas conectadas e verificação — MGP" },
      {
        name: "description",
        content: "Gerencie Steam, Riot, Google e o estado de verificação etária da sua conta MGP.",
      },
    ],
  }),
  component: SettingsConnectionsPage,
});

type Provider = "steam" | "riot" | "google";

type ConnectedAccount = {
  provider: Provider;
  display_name: string | null;
  status: "connected" | "reauth_required" | "disconnected";
  connected_at: string;
  last_synced_at: string | null;
};

type VerificationState = {
  status: "unverified" | "pending" | "verified" | "rejected" | "expired";
  verified_over_18: boolean;
  method: string | null;
  provider_name: string | null;
  verified_at: string | null;
  expires_at: string | null;
};

type ConnectedAccountsReadClient = {
  from: (table: "connected_accounts") => {
    select: (columns: string) => {
      eq: (
        column: "user_id",
        value: string,
      ) => Promise<{ data: ConnectedAccount[] | null; error: { message?: string } | null }>;
    };
  };
};

type VerificationReadClient = {
  from: (table: "account_age_verifications") => {
    select: (columns: string) => {
      eq: (column: "user_id", value: string) => {
        maybeSingle: () => Promise<{ data: VerificationState | null; error: { message?: string } | null }>;
      };
    };
  };
};

const PROVIDERS: Array<{
  key: Provider;
  name: string;
  icon: typeof Gamepad2;
  purpose: [string, string, string];
  futureData: [string, string, string];
}> = [
  {
    key: "steam",
    name: "Steam",
    icon: Gamepad2,
    purpose: [
      "Biblioteca, horas jogadas e conquistas quando a privacidade da Steam permitir.",
      "Library, playtime and achievements when Steam privacy allows it.",
      "Biblioteca, horas jugadas y logros cuando la privacidad de Steam lo permita.",
    ],
    futureData: ["Steam OpenID + Web API", "Steam OpenID + Web API", "Steam OpenID + Web API"],
  },
  {
    key: "riot",
    name: "Riot Games",
    icon: Swords,
    purpose: [
      "Vincular Riot ID e importar dados compatíveis de VALORANT e League com opt-in.",
      "Link Riot ID and import supported VALORANT and League data with opt-in.",
      "Vincular Riot ID e importar datos compatibles de VALORANT y League con autorización.",
    ],
    futureData: ["Riot Sign On (RSO)", "Riot Sign On (RSO)", "Riot Sign On (RSO)"],
  },
  {
    key: "google",
    name: "Google",
    icon: Globe2,
    purpose: [
      "Login simplificado e identidade básica com escopos mínimos.",
      "Simplified sign-in and basic identity with minimal scopes.",
      "Inicio de sesión simplificado e identidad básica con permisos mínimos.",
    ],
    futureData: ["OpenID · email · profile", "OpenID · email · profile", "OpenID · email · profile"],
  },
];

function SettingsConnectionsPage() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const accountsClient = supabase as unknown as ConnectedAccountsReadClient;
      const verificationClient = supabase as unknown as VerificationReadClient;

      const [accountsResult, verificationResult] = await Promise.all([
        accountsClient
          .from("connected_accounts")
          .select("provider,display_name,status,connected_at,last_synced_at")
          .eq("user_id", user.id),
        verificationClient
          .from("account_age_verifications")
          .select("status,verified_over_18,method,provider_name,verified_at,expires_at")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      if (!accountsResult.error) setAccounts(accountsResult.data ?? []);
      if (!verificationResult.error) setVerification(verificationResult.data);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const byProvider = useMemo(
    () => new Map(accounts.map((account) => [account.provider, account])),
    [accounts],
  );

  return (
    <SettingsLayout>
      <div className="space-y-5">
        <section className="surface-panel rounded-xl p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">MGP / CONNECT</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                {copy("Contas conectadas", "Connected accounts", "Cuentas conectadas")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {copy(
                  "Conecte serviços oficiais para transformar dados declarados em informações verificadas no seu Game Profile. O MGP nunca pede sua senha Steam, Riot ou Google.",
                  "Connect official services to turn declared data into verified Game Profile information. MGP never asks for your Steam, Riot or Google password.",
                  "Conecta servicios oficiales para convertir datos declarados en información verificada. MGP nunca solicita tu contraseña de Steam, Riot o Google.",
                )}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <LockKeyhole className="size-3.5 text-gold-strong" />
              {copy("OAuth / login oficial", "Official OAuth / sign-in", "OAuth / acceso oficial")}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {PROVIDERS.map((provider) => {
              const account = byProvider.get(provider.key);
              return (
                <ProviderCard
                  key={provider.key}
                  provider={provider}
                  account={account}
                  locale={locale}
                  loading={loading}
                />
              );
            })}
          </div>
        </section>

        <section className="surface-panel overflow-hidden rounded-xl">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="section-kicker">MGP / AGE ASSURANCE</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
                  {copy("Verificação para conteúdo 18+", "18+ content verification", "Verificación para contenido 18+")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {copy(
                    "Sua data de nascimento organiza as faixas Livre, 12, 14 e 16. Para áreas realmente 18+, o MGP exigirá uma verificação mais forte de maioridade antes de liberar o conteúdo.",
                    "Your birth date handles general, 12, 14 and 16 age bands. Truly 18+ areas will require stronger adult verification before access is unlocked.",
                    "Tu fecha de nacimiento gestiona las franjas general, 12, 14 y 16. Las áreas realmente 18+ exigirán una verificación de mayoría de edad más fuerte.",
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <VerificationStatus verification={verification} loading={loading} locale={locale} />
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {copy("Como o documento será tratado", "How the document will be handled", "Cómo se tratará el documento")}
                </p>
                <p className="mt-2">
                  {copy(
                    "O fluxo será feito por um verificador seguro. O objetivo do MGP é receber e guardar apenas o resultado da checagem (18+ confirmado), referência do provedor e datas necessárias — não manter RG, CNH ou passaporte disponível no perfil ou no banco comum.",
                    "The flow will use a secure verifier. MGP aims to retain only the verification result (18+ confirmed), provider reference and required dates — not keep an ID card, driver's license or passport in the normal profile/database.",
                    "El flujo utilizará un verificador seguro. MGP busca conservar solo el resultado (18+ confirmado), la referencia del proveedor y las fechas necesarias, no el documento en el perfil o base común.",
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {copy("Fluxo previsto", "Planned flow", "Flujo previsto")}
              </p>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <FlowStep n="1" text={copy("Abrir verificação segura", "Open secure verification", "Abrir verificación segura")} />
                <FlowStep n="2" text={copy("Comprovar 18+", "Prove 18+", "Comprobar 18+")} />
                <FlowStep n="3" text={copy("Receber apenas o resultado", "Receive verdict only", "Recibir solo el resultado")} />
                <FlowStep n="4" text={copy("Liberar áreas 18+", "Unlock 18+ areas", "Desbloquear áreas 18+")} />
              </ol>
              <Button className="mt-5 w-full" disabled>
                <ShieldQuestion className="mr-2 size-4" />
                {copy("Verificar 18+ com documento", "Verify 18+ with ID", "Verificar 18+ con documento")}
              </Button>
              <p className="mt-2 text-center text-[0.7rem] leading-4 text-muted-foreground">
                {copy(
                  "Será ativado após a escolha/configuração do provedor de aferição.",
                  "Enabled after the age-assurance provider is configured.",
                  "Se activará cuando configuremos el proveedor de verificación.",
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
          {copy(
            "Steam, Riot e Google ainda dependem das credenciais/aprovações externas. Esta tela já representa o fluxo final para que possamos apresentar um produto testável durante os cadastros dos provedores.",
            "Steam, Riot and Google still depend on external credentials/approval. This screen already represents the intended final flow so providers can review a testable product.",
            "Steam, Riot y Google todavía dependen de credenciales/aprobaciones externas. Esta pantalla ya representa el flujo final para mostrar un producto comprobable.",
          )}{" "}
          <Link to="/privacy" className="font-semibold text-gold-strong hover:underline">
            {copy("Ver privacidade", "View privacy", "Ver privacidad")}
          </Link>
        </div>
      </div>
    </SettingsLayout>
  );
}

function ProviderCard({
  provider,
  account,
  locale,
  loading,
}: {
  provider: (typeof PROVIDERS)[number];
  account: ConnectedAccount | undefined;
  locale: "pt-BR" | "en" | "es";
  loading: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const Icon = provider.icon;
  const connected = account?.status === "connected";
  const reauth = account?.status === "reauth_required";

  return (
    <article className="rounded-xl border border-border bg-muted/15 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-muted/25">
      <div className="flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-gold-strong">
          <Icon className="size-5" />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${connected ? "bg-emerald-500/10 text-emerald-500" : reauth ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}>
          {loading
            ? copy("Verificando", "Checking", "Comprobando")
            : connected
              ? copy("Conectado", "Connected", "Conectado")
              : reauth
                ? copy("Reconectar", "Reconnect", "Reconectar")
                : copy("Não conectado", "Not connected", "No conectado")}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{provider.name}</h3>
      <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">
        {provider.purpose[locale === "pt-BR" ? 0 : locale === "en" ? 1 : 2]}
      </p>
      <div className="mt-4 rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{provider.futureData[locale === "pt-BR" ? 0 : locale === "en" ? 1 : 2]}</span>
        {account?.display_name ? <span className="mt-1 block">{account.display_name}</span> : null}
      </div>
      <Button variant={connected ? "outline" : "default"} className="mt-4 w-full" disabled={!connected}>
        {connected ? <RefreshCw className="mr-2 size-4" /> : <Link2 className="mr-2 size-4" />}
        {connected
          ? copy("Gerenciar conexão", "Manage connection", "Gestionar conexión")
          : copy("Conectar em breve", "Connect soon", "Conectar próximamente")}
      </Button>
    </article>
  );
}

function VerificationStatus({
  verification,
  loading,
  locale,
}: {
  verification: VerificationState | null;
  loading: boolean;
  locale: "pt-BR" | "en" | "es";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/15 p-4 text-sm text-muted-foreground">
        <RefreshCw className="size-4 animate-spin" />
        {copy("Consultando status…", "Checking status…", "Consultando estado…")}
      </div>
    );
  }

  const verified = verification?.status === "verified" && verification.verified_over_18;
  const pending = verification?.status === "pending";
  const Icon = verified ? BadgeCheck : pending ? Clock3 : ShieldQuestion;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${verified ? "border-emerald-500/25 bg-emerald-500/5" : pending ? "border-amber-500/25 bg-amber-500/5" : "border-border bg-muted/15"}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${verified ? "text-emerald-500" : pending ? "text-amber-500" : "text-muted-foreground"}`} />
      <div>
        <p className="font-semibold text-foreground">
          {verified
            ? copy("Maioridade verificada", "Adult status verified", "Mayoría de edad verificada")
            : pending
              ? copy("Verificação em andamento", "Verification pending", "Verificación en curso")
              : copy("18+ ainda não verificado", "18+ not yet verified", "18+ aún no verificado")}
        </p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {verified
            ? copy("Sua conta pode acessar áreas marcadas como 18+, respeitando as demais regras do MGP.", "Your account can access 18+ areas, subject to the rest of MGP rules.", "Tu cuenta puede acceder a áreas 18+, respetando las demás reglas de MGP.")
            : pending
              ? copy("A liberação só acontece quando o verificador concluir a checagem.", "Access unlocks only after the verifier completes the check.", "El acceso solo se libera cuando finalice la comprobación.")
              : copy("Conteúdo 18+ permanecerá bloqueado mesmo que a data de nascimento informada indique maioridade.", "18+ content remains blocked even if the entered birth date indicates adulthood.", "El contenido 18+ seguirá bloqueado aunque la fecha de nacimiento indique mayoría de edad.")}
        </p>
      </div>
    </div>
  );
}

function FlowStep({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-background text-[0.68rem] font-bold text-gold-strong">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
