import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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
import { getRiotApiReadiness } from "@/lib/riot.functions";
import {
  beginSteamConnection,
  disconnectSteamAccount,
  getSteamApiReadiness,
} from "@/lib/steam.functions";

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

type ApiReadiness = {
  steam: { configured: boolean; openIdReady: boolean } | null;
  riot: { apiKeyConfigured: boolean; rsoConfigured: boolean; publicAppUrlConfigured: boolean } | null;
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
  const [apiReadiness, setApiReadiness] = useState<ApiReadiness>({ steam: null, riot: null });
  const [loading, setLoading] = useState(true);
  const [steamBusy, setSteamBusy] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const startSteamConnection = useServerFn(beginSteamConnection);
  const stopSteamConnection = useServerFn(disconnectSteamAccount);

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

      const [accountsResult, verificationResult, steamReadiness, riotReadiness] = await Promise.all([
        accountsClient
          .from("connected_accounts")
          .select("provider,display_name,status,connected_at,last_synced_at")
          .eq("user_id", user.id),
        verificationClient
          .from("account_age_verifications")
          .select("status,verified_over_18,method,provider_name,verified_at,expires_at")
          .eq("user_id", user.id)
          .maybeSingle(),
        getSteamApiReadiness().catch(() => null),
        getRiotApiReadiness().catch(() => null),
      ]);

      if (cancelled) return;
      if (!accountsResult.error) setAccounts(accountsResult.data ?? []);
      if (!verificationResult.error) setVerification(verificationResult.data);
      setApiReadiness({ steam: steamReadiness, riot: riotReadiness });
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

  const handleSteamConnect = async () => {
    if (steamBusy) return;
    setSteamBusy(true);
    setConnectionError("");
    try {
      const result = await startSteamConnection();
      window.location.assign(result.url);
    } catch (error) {
      console.error("[MGP Steam] Could not start OpenID link", error);
      setSteamBusy(false);
      setConnectionError(
        copy(
          "Não foi possível abrir o login oficial da Steam. Tente novamente.",
          "Could not open the official Steam sign-in. Try again.",
          "No se pudo abrir el acceso oficial de Steam. Inténtalo de nuevo.",
        ),
      );
    }
  };

  const handleSteamDisconnect = async () => {
    if (steamBusy) return;
    const confirmed = window.confirm(
      copy(
        "Desconectar sua conta Steam do MG Profile?",
        "Disconnect your Steam account from MG Profile?",
        "¿Desconectar tu cuenta de Steam de MG Profile?",
      ),
    );
    if (!confirmed) return;

    setSteamBusy(true);
    setConnectionError("");
    try {
      await stopSteamConnection();
      setAccounts((current) => current.filter((account) => account.provider !== "steam"));
    } catch (error) {
      console.error("[MGP Steam] Could not disconnect account", error);
      setConnectionError(
        copy(
          "Não foi possível desconectar a Steam agora. Tente novamente.",
          "Could not disconnect Steam right now. Try again.",
          "No se pudo desconectar Steam ahora. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setSteamBusy(false);
    }
  };

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
                  readiness={
                    provider.key === "steam"
                      ? apiReadiness.steam
                      : provider.key === "riot"
                        ? apiReadiness.riot
                        : null
                  }
                  steamBusy={steamBusy}
                  onSteamConnect={handleSteamConnect}
                  onSteamDisconnect={handleSteamDisconnect}
                />
              );
            })}
          </div>
          {connectionError ? (
            <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {connectionError}
            </p>
          ) : null}
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
            "Steam já pode ser vinculada pelo login oficial OpenID quando a Web API estiver disponível no servidor. Riot ainda depende da aprovação/RSO e Google depende da configuração OAuth do projeto.",
            "Steam can now be linked through official OpenID when the Web API is available on the server. Riot still depends on approval/RSO and Google depends on the project OAuth configuration.",
            "Steam ya puede vincularse mediante OpenID oficial cuando la Web API esté disponible en el servidor. Riot aún depende de aprobación/RSO y Google de la configuración OAuth del proyecto.",
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
  readiness,
  steamBusy,
  onSteamConnect,
  onSteamDisconnect,
}: {
  provider: (typeof PROVIDERS)[number];
  account: ConnectedAccount | undefined;
  locale: "pt-BR" | "en" | "es";
  loading: boolean;
  readiness:
    | ApiReadiness["steam"]
    | ApiReadiness["riot"]
    | null;
  steamBusy: boolean;
  onSteamConnect: () => void;
  onSteamDisconnect: () => void;
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
        {provider.key === "steam" && readiness && "configured" in readiness ? (
          <span className="mt-2 block space-y-1">
            <span className={`block font-semibold ${readiness.configured ? "text-emerald-500" : "text-amber-500"}`}>
              {readiness.configured
                ? copy("Web API pronta no servidor", "Web API ready on server", "Web API lista en el servidor")
                : copy("Aguardando STEAM_WEB_API_KEY", "Waiting for STEAM_WEB_API_KEY", "Esperando STEAM_WEB_API_KEY")}
            </span>
            <span className={`block font-semibold ${readiness.openIdReady ? "text-emerald-500" : "text-amber-500"}`}>
              {readiness.openIdReady
                ? copy("Steam OpenID pronto", "Steam OpenID ready", "Steam OpenID listo")
                : copy("Steam OpenID indisponível", "Steam OpenID unavailable", "Steam OpenID no disponible")}
            </span>
          </span>
        ) : null}
        {provider.key === "riot" && readiness && "apiKeyConfigured" in readiness ? (
          <span className="mt-2 block space-y-1">
            <span className={`block font-semibold ${readiness.apiKeyConfigured ? "text-emerald-500" : "text-amber-500"}`}>
              {readiness.apiKeyConfigured
                ? copy("Riot API pronta no servidor", "Riot API ready on server", "Riot API lista en el servidor")
                : copy("Aguardando RIOT_API_KEY", "Waiting for RIOT_API_KEY", "Esperando RIOT_API_KEY")}
            </span>
            <span className={`block font-semibold ${readiness.rsoConfigured ? "text-emerald-500" : "text-muted-foreground"}`}>
              {readiness.rsoConfigured
                ? "RSO · ready"
                : copy("RSO · depende da aprovação de produção da Riot", "RSO · requires Riot production approval", "RSO · requiere aprobación de producción de Riot")}
            </span>
          </span>
        ) : null}
      </div>
      {provider.key === "steam" ? (
        <Button
          variant={connected ? "outline" : "default"}
          className="mt-4 w-full"
          disabled={
            steamBusy ||
            (!connected &&
              (!readiness ||
                !("configured" in readiness) ||
                !readiness.configured ||
                !readiness.openIdReady))
          }
          onClick={connected ? onSteamDisconnect : onSteamConnect}
        >
          {steamBusy ? (
            <RefreshCw className="mr-2 size-4 animate-spin" />
          ) : connected ? (
            <RefreshCw className="mr-2 size-4" />
          ) : (
            <Link2 className="mr-2 size-4" />
          )}
          {steamBusy
            ? copy("Aguarde…", "Please wait…", "Espera…")
            : connected
              ? copy("Desconectar Steam", "Disconnect Steam", "Desconectar Steam")
              : copy("Conectar Steam", "Connect Steam", "Conectar Steam")}
        </Button>
      ) : (
        <Button variant={connected ? "outline" : "default"} className="mt-4 w-full" disabled={!connected}>
          {connected ? <RefreshCw className="mr-2 size-4" /> : <Link2 className="mr-2 size-4" />}
          {connected
            ? copy("Gerenciar conexão", "Manage connection", "Gestionar conexión")
            : copy("Conectar em breve", "Connect soon", "Conectar próximamente")}
        </Button>
      )}
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
