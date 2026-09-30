import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Clock3,
  Gamepad2,
  Library,
  Globe2,
  Link2,
  LockKeyhole,
  RefreshCw,
  Package,
  ShieldCheck,
  ShieldQuestion,
  Swords,
  Trophy,
} from "lucide-react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { supabase } from "@/integrations/supabase/client";
import { getRiotApiReadiness } from "@/lib/riot.functions";
import { getSteamApiReadiness } from "@/lib/steam.functions";
import {
  getSteamSyncStatus,
  syncSteamAchievementsBatch,
  syncSteamCore,
  updateSteamSharing,
} from "@/lib/steamSync.functions";

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

type SteamSyncStatus = {
  profile: {
    persona_name: string | null;
    profile_url: string | null;
    avatar_url: string | null;
    steam_level: number | null;
    badge_count: number;
    xp: number;
    library_visible: boolean;
    inventory_visible: boolean;
    show_library: boolean;
    show_playtime: boolean;
    show_achievements: boolean;
    show_badges: boolean;
    show_inventory: boolean;
    last_sync_status: "never" | "syncing" | "ok" | "partial" | "error";
    last_error: string | null;
    last_synced_at: string | null;
  } | null;
  counts: {
    games: number;
    achievements: number;
    badges: number;
    inventoryItems: number;
  };
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
  const [steamSyncStatus, setSteamSyncStatus] = useState<SteamSyncStatus | null>(null);
  const [steamSyncing, setSteamSyncing] = useState(false);
  const [steamSyncProgress, setSteamSyncProgress] = useState("");
  const runSteamCore = useServerFn(syncSteamCore);
  const runSteamAchievementsBatch = useServerFn(syncSteamAchievementsBatch);
  const loadSteamSyncStatus = useServerFn(getSteamSyncStatus);
  const saveSteamSharing = useServerFn(updateSteamSharing);

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

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const [accountsResult, verificationResult, steamReadiness, riotReadiness, syncStatus] = await Promise.all([
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
        accessToken
          ? loadSteamSyncStatus({ data: { accessToken } }).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (cancelled) return;
      if (!accountsResult.error) setAccounts(accountsResult.data ?? []);
      if (!verificationResult.error) setVerification(verificationResult.data);
      setApiReadiness({ steam: steamReadiness, riot: riotReadiness });
      if (syncStatus) setSteamSyncStatus(syncStatus as SteamSyncStatus);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadSteamSyncStatus, user?.id]);

  const byProvider = useMemo(
    () => new Map(accounts.map((account) => [account.provider, account])),
    [accounts],
  );

  const googleIdentity = useMemo(
    () => user?.identities?.find((identity) => identity.provider === "google") ?? null,
    [user?.identities],
  );
  const googleConnected = Boolean(googleIdentity);
  const googleDisplayName =
    (googleIdentity?.identity_data?.["full_name"] as string | undefined) ||
    (googleIdentity?.identity_data?.["name"] as string | undefined) ||
    (googleIdentity?.identity_data?.["email"] as string | undefined) ||
    null;

  const handleSteamConnect = async () => {
    if (steamBusy) return;
    setSteamBusy(true);
    setConnectionError("");

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) throw new Error("STEAM_AUTH_SESSION_MISSING");

      const { data, error } = await supabase.functions.invoke("steam-openid", {
        body: { action: "begin" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;
      if (!data?.url || typeof data.url !== "string") {
        throw new Error(data?.error || "STEAM_OPENID_BEGIN_FAILED");
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("[MGP Steam] Could not start OpenID link", error);
      setSteamBusy(false);
      setConnectionError(
        copy(
          "Não foi possível abrir o login oficial da Steam. A conexão segura foi reiniciada no backend do ÍMPAR; tente novamente em alguns segundos.",
          "Could not open the official Steam sign-in. The secure connection now runs through MGP's backend; try again in a few seconds.",
          "No se pudo abrir el acceso oficial de Steam. La conexión segura ahora se ejecuta en el backend de MGP; inténtalo de nuevo en unos segundos.",
        ),
      );
    }
  };

  const refreshSteamSyncStatus = async (accessToken: string) => {
    const status = await loadSteamSyncStatus({ data: { accessToken } });
    setSteamSyncStatus(status as SteamSyncStatus);
    return status as SteamSyncStatus;
  };

  const handleSteamSync = async () => {
    if (steamSyncing) return;
    setSteamSyncing(true);
    setConnectionError("");
    setSteamSyncProgress(
      copy(
        "Sincronizando perfil, biblioteca, horas, insígnias e inventários…",
        "Syncing profile, library, playtime, badges and inventories…",
        "Sincronizando perfil, biblioteca, horas, insignias e inventarios…",
      ),
    );

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) throw new Error("STEAM_AUTH_SESSION_MISSING");

      const core = await runSteamCore({ data: { accessToken } });
      let cursor = 0;
      let processedGames = 0;
      let achievementFailures = 0;
      let guard = 0;

      if (core.achievementEligible > 0) {
        setSteamSyncProgress(
          copy(
            `Biblioteca importada. Sincronizando conquistas de ${core.achievementEligible} jogos…`,
            `Library imported. Syncing achievements for ${core.achievementEligible} games…`,
            `Biblioteca importada. Sincronizando logros de ${core.achievementEligible} juegos…`,
          ),
        );
      }

      while (guard < 50) {
        const batch = await runSteamAchievementsBatch({
          data: { accessToken, afterAppId: cursor, batchSize: 6 },
        });
        processedGames += batch.processed;
        achievementFailures += batch.failures?.length ?? 0;
        if (batch.nextCursor === null || batch.processed === 0) break;
        cursor = batch.nextCursor;
        guard += 1;

        setSteamSyncProgress(
          copy(
            `Conquistas: ${Math.min(processedGames, core.achievementEligible)}/${core.achievementEligible} jogos processados…`,
            `Achievements: ${Math.min(processedGames, core.achievementEligible)}/${core.achievementEligible} games processed…`,
            `Logros: ${Math.min(processedGames, core.achievementEligible)}/${core.achievementEligible} juegos procesados…`,
          ),
        );

        if (!batch.hasMore) break;
      }

      await refreshSteamSyncStatus(accessToken);
      setSteamSyncProgress(
        achievementFailures > 0
          ? copy(
              `Steam sincronizada parcialmente. ${achievementFailures} jogo(s) não responderam nas conquistas; os dados anteriores foram preservados e você pode tentar novamente depois.`,
              `Steam partially synced. ${achievementFailures} game(s) did not respond for achievements; previous data was preserved and you can try again later.`,
              `Steam se sincronizó parcialmente. ${achievementFailures} juego(s) no respondieron para los logros; se conservaron los datos anteriores y puedes intentarlo de nuevo más tarde.`,
            )
          : copy(
              "Steam sincronizada. Os dados disponíveis já podem aparecer no seu perfil.",
              "Steam synced. Available data can now appear on your profile.",
              "Steam sincronizada. Los datos disponibles ya pueden aparecer en tu perfil.",
            ),
      );
    } catch (error) {
      console.error("[MGP Steam] Full sync failed", error);
      setConnectionError(
        copy(
          "A sincronização da Steam falhou. Confira a privacidade do perfil/biblioteca e tente novamente.",
          "Steam sync failed. Check your profile/library privacy and try again.",
          "La sincronización de Steam falló. Revisa la privacidad del perfil/biblioteca e inténtalo de nuevo.",
        ),
      );
      setSteamSyncProgress("");
    } finally {
      setSteamSyncing(false);
    }
  };

  const handleSteamSharing = async (
    key: "show_library" | "show_playtime" | "show_achievements" | "show_badges" | "show_inventory",
    value: boolean,
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("STEAM_AUTH_SESSION_MISSING");
      await saveSteamSharing({ data: { accessToken, [key]: value } });
      setSteamSyncStatus((current) =>
        current?.profile
          ? {
              ...current,
              profile: { ...current.profile, [key]: value },
            }
          : current,
      );
    } catch (error) {
      console.error("[MGP Steam] Sharing preference failed", error);
      setConnectionError(
        copy(
          "Não foi possível salvar essa preferência de exibição.",
          "Could not save that display preference.",
          "No se pudo guardar esa preferencia de visualización.",
        ),
      );
    }
  };

  const handleSteamDisconnect = async () => {
    if (steamBusy) return;
    const confirmed = window.confirm(
      copy(
        "Desconectar sua conta Steam do ÍMPAR?",
        "Disconnect your Steam account from ÍMPAR?",
        "¿Desconectar tu cuenta de Steam de ÍMPAR?",
      ),
    );
    if (!confirmed) return;

    setSteamBusy(true);
    setConnectionError("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) throw new Error("STEAM_AUTH_SESSION_MISSING");

      const { data, error } = await supabase.functions.invoke("steam-openid", {
        body: { action: "disconnect" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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
              <p className="section-kicker">ÍMPAR / CONNECT</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                {copy("Contas conectadas", "Connected accounts", "Cuentas conectadas")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {copy(
                  "Conecte serviços oficiais para transformar dados declarados em informações verificadas no seu Game Profile. O ÍMPAR nunca pede sua senha Steam, Riot ou Google.",
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
                  googleConnected={provider.key === "google" ? googleConnected : false}
                  googleDisplayName={provider.key === "google" ? googleDisplayName : null}
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

        {byProvider.get("steam")?.status === "connected" ? (
          <SteamDataPanel
            status={steamSyncStatus}
            syncing={steamSyncing}
            progress={steamSyncProgress}
            locale={locale}
            onSync={handleSteamSync}
            onSharingChange={handleSteamSharing}
          />
        ) : null}

        <section className="surface-panel overflow-hidden rounded-xl">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="section-kicker">ÍMPAR / AGE ASSURANCE</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
                  {copy("Verificação reforçada de idade · futura", "Stronger age verification · future", "Verificación reforzada de edad · futura")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {copy(
                    "Na beta pública, o LFG usa a data de nascimento informada no cadastro para aplicar faixas de segurança e mantém a data exata privada. Uma verificação externa mais forte poderá ser adicionada depois sem mudar o cadastro nem o sistema de match.",
                    "During the public beta, LFG uses the birth date entered during signup to apply safety bands while keeping the exact date private. Stronger external verification can be added later without rebuilding signup or matchmaking.",
                    "Durante la beta pública, el LFG usa la fecha de nacimiento indicada en el registro para aplicar rangos de seguridad y mantiene la fecha exacta privada. Más adelante se podrá añadir una verificación externa más fuerte sin rehacer el registro ni el sistema de match.",
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
                    "O fluxo será feito por um provedor especializado. O ÍMPAR guarda apenas o resultado da checagem, a referência do provedor, a faixa/idade necessária para aplicar as regras e as datas de validade. RG, CNH, passaporte, selfie e biometria não devem ser armazenados no banco comum do ÍMPAR.",
                    "The flow will use a specialized provider. MGP stores only the verification verdict, provider reference, the age/band needed to apply access rules and validity dates. ID documents, selfies and biometrics must not be stored in MGP's regular database.",
                    "El flujo utilizará un proveedor especializado. MGP guarda solo el resultado, la referencia del proveedor, la edad/franja necesaria para aplicar las reglas y las fechas de validez. Documentos, selfies y biometría no deben almacenarse en la base común de MGP.",
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
                <FlowStep n="2" text={copy("Confirmar identidade e idade", "Confirm identity and age", "Confirmar identidad y edad")} />
                <FlowStep n="3" text={copy("Receber apenas o resultado", "Receive verdict only", "Recibir solo el resultado")} />
                <FlowStep n="4" text={copy("Liberar recursos que exigirem verificação reforçada", "Unlock features that require stronger verification", "Habilitar funciones que requieran verificación reforzada")} />
              </ol>
              <Button className="mt-5 w-full" disabled>
                <ShieldQuestion className="mr-2 size-4" />
                {copy("Verificar idade e identidade", "Verify age and identity", "Verificar edad e identidad")}
              </Button>
              <p className="mt-2 text-center text-[0.7rem] leading-4 text-muted-foreground">
                {copy(
                  "Esse passo não é necessário para participar da beta atual. Ele ficará disponível quando o ÍMPAR puder contratar/configurar um provedor externo.",
                  "This step is not required for the current beta. It will become available when MGP can configure an external provider.",
                  "Este paso no es obligatorio para la beta actual. Estará disponible cuando ÍMPAR pueda configurar un proveedor externo.",
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
          {copy(
            "Steam pode ser vinculada aqui. Google é escolhido apenas no cadastro/login por “Continuar com Google”. Riot continua dependendo da aprovação de produção e do RSO.",
            "Steam can be linked here. Google is selected only during sign-up/sign-in through “Continue with Google”. Riot still depends on production approval and RSO.",
            "Steam puede vincularse aquí. Google se elige solo durante el registro/acceso mediante “Continuar con Google”. Riot aún depende de la aprobación de producción y RSO.",
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
  googleConnected,
  googleDisplayName,
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
  googleConnected: boolean;
  googleDisplayName: string | null;
  onSteamConnect: () => void;
  onSteamDisconnect: () => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const Icon = provider.icon;
  const connected =
    provider.key === "google" ? googleConnected : account?.status === "connected";
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
        {provider.key === "google" && googleDisplayName ? (
          <span className="mt-1 block">{googleDisplayName}</span>
        ) : null}
        {provider.key === "google" ? (
          <span className="mt-2 block font-semibold text-emerald-500">
            {copy(
              "Google OAuth pronto no Supabase",
              "Google OAuth ready in Supabase",
              "Google OAuth listo en Supabase",
            )}
          </span>
        ) : null}
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
      ) : provider.key === "google" ? (
        <div className="mt-4 rounded-lg border border-border/70 bg-background/35 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {connected
            ? copy(
                "Google é o método de login desta conta. O vínculo é gerenciado pelo acesso com Google.",
                "Google is a sign-in method for this account. The identity is managed through Google sign-in.",
                "Google es un método de acceso de esta cuenta. La identidad se gestiona mediante el acceso con Google.",
              )
            : copy(
                "Para usar Google, escolha “Continuar com Google” na tela de cadastro ou login. Não é possível vincular manualmente por esta página.",
                "To use Google, choose “Continue with Google” on the sign-up or sign-in screen. Manual linking is not available on this page.",
                "Para usar Google, elige “Continuar con Google” en la pantalla de registro o acceso. No se puede vincular manualmente desde esta página.",
              )}
        </div>
      ) : (
        <Button variant="default" className="mt-4 w-full" disabled>
          <Link2 className="mr-2 size-4" />
          {copy("Aguardando aprovação RSO", "Waiting for RSO approval", "Esperando aprobación RSO")}
        </Button>
      )}
    </article>
  );
}

function SteamDataPanel({
  status,
  syncing,
  progress,
  locale,
  onSync,
  onSharingChange,
}: {
  status: SteamSyncStatus | null;
  syncing: boolean;
  progress: string;
  locale: "pt-BR" | "en" | "es";
  onSync: () => void;
  onSharingChange: (
    key: "show_library" | "show_playtime" | "show_achievements" | "show_badges" | "show_inventory",
    value: boolean,
  ) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const profile = status?.profile;
  const counts = status?.counts ?? { games: 0, achievements: 0, badges: 0, inventoryItems: 0 };

  const sharing = [
    {
      key: "show_library" as const,
      label: copy("Mostrar biblioteca", "Show library", "Mostrar biblioteca"),
      checked: profile?.show_library ?? true,
    },
    {
      key: "show_playtime" as const,
      label: copy("Mostrar horas jogadas", "Show playtime", "Mostrar horas jugadas"),
      checked: profile?.show_playtime ?? true,
    },
    {
      key: "show_achievements" as const,
      label: copy("Mostrar conquistas", "Show achievements", "Mostrar logros"),
      checked: profile?.show_achievements ?? true,
    },
    {
      key: "show_badges" as const,
      label: copy("Mostrar nível e insígnias", "Show level and badges", "Mostrar nivel e insignias"),
      checked: profile?.show_badges ?? true,
    },
    {
      key: "show_inventory" as const,
      label: copy("Mostrar contagem de itens", "Show item count", "Mostrar cantidad de objetos"),
      checked: profile?.show_inventory ?? false,
    },
  ];

  return (
    <section className="surface-panel rounded-xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="section-kicker">ÍMPAR / STEAM SYNC</p>
          <h2 className="mt-2 font-display text-xl font-semibold">
            {copy("Dados Steam no Game Profile", "Steam data in your Game Profile", "Datos de Steam en tu Game Profile")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Importa biblioteca, tempo de jogo, jogos recentes, nível, insígnias, conquistas desbloqueadas e inventários públicos suportados. O total de conquistas por jogo continua disponível sem armazenar cada conquista bloqueada.",
              "Imports library, playtime, recent games, level, badges, unlocked achievements and supported public inventories. Per-game achievement totals remain available without storing every locked achievement.",
              "Importa biblioteca, tiempo de juego, juegos recientes, nivel, insignias, logros desbloqueados e inventarios públicos compatibles. El total de logros por juego sigue disponible sin guardar cada logro bloqueado.",
            )}
          </p>
        </div>
        <Button onClick={onSync} disabled={syncing} className="shrink-0">
          <RefreshCw className={`mr-2 size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing
            ? copy("Sincronizando…", "Syncing…", "Sincronizando…")
            : copy("Sincronizar tudo", "Sync everything", "Sincronizar todo")}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SteamMetric icon={Library} label={copy("Jogos", "Games", "Juegos")} value={counts.games} />
        <SteamMetric
          icon={Trophy}
          label={copy(
            "Conquistas desbloqueadas",
            "Unlocked achievements",
            "Logros desbloqueados",
          )}
          value={counts.achievements}
        />
        <SteamMetric icon={BadgeCheck} label={copy("Insígnias", "Badges", "Insignias")} value={counts.badges} />
        <SteamMetric icon={Package} label={copy("Itens públicos", "Public items", "Objetos públicos")} value={counts.inventoryItems} />
      </div>

      {progress ? (
        <p className="mt-4 rounded-lg border border-gold/20 bg-gold-soft/25 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {progress}
        </p>
      ) : null}

      {profile ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-xl border border-border bg-muted/15 p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-semibold text-foreground">
                {profile.persona_name || "Steam"}
              </span>
              {profile.steam_level !== null ? (
                <span className="text-muted-foreground">
                  {copy("Nível", "Level", "Nivel")} {profile.steam_level}
                </span>
              ) : null}
              <span className={profile.library_visible ? "text-emerald-500" : "text-amber-500"}>
                {profile.library_visible
                  ? copy("Biblioteca visível", "Library visible", "Biblioteca visible")
                  : copy("Biblioteca privada/indisponível", "Library private/unavailable", "Biblioteca privada/no disponible")}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {profile.last_synced_at
                ? copy("Última sincronização: ", "Last sync: ", "Última sincronización: ") +
                  new Date(profile.last_synced_at).toLocaleString()
                : copy("Ainda não sincronizado.", "Not synced yet.", "Aún no sincronizado.")}
            </p>
            {profile.last_error ? (
              <p className="mt-2 text-xs text-amber-500">
                {copy("Alguns dados ficaram indisponíveis pela Steam: ", "Some Steam data was unavailable: ", "Algunos datos de Steam no estaban disponibles: ")}
                {profile.last_error}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-muted/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {copy("Visibilidade no perfil", "Profile visibility", "Visibilidad en el perfil")}
            </p>
            <div className="mt-3 space-y-2">
              {sharing.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) => onSharingChange(item.key, event.target.checked)}
                    className="size-4 accent-current"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          {copy(
            "Sua Steam está conectada. Clique em “Sincronizar tudo” para criar o primeiro snapshot.",
            "Your Steam account is connected. Click “Sync everything” to create the first snapshot.",
            "Tu Steam está conectada. Haz clic en “Sincronizar todo” para crear el primer snapshot.",
          )}
        </p>
      )}
    </section>
  );
}

function SteamMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gamepad2;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-gold-strong" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
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

  const verified = verification?.status === "verified";
  const pending = verification?.status === "pending";
  const Icon = verified ? BadgeCheck : pending ? Clock3 : ShieldQuestion;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${verified ? "border-emerald-500/25 bg-emerald-500/5" : pending ? "border-amber-500/25 bg-amber-500/5" : "border-border bg-muted/15"}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${verified ? "text-emerald-500" : pending ? "text-amber-500" : "text-muted-foreground"}`} />
      <div>
        <p className="font-semibold text-foreground">
          {verified
            ? verification?.verified_over_18
              ? copy("Idade verificada · 18+", "Age verified · 18+", "Edad verificada · 18+")
              : copy("Idade verificada", "Age verified", "Edad verificada")
            : pending
              ? copy("Verificação em andamento", "Verification pending", "Verificación en curso")
              : copy("Verificação reforçada não configurada", "Stronger verification not configured", "Verificación reforzada no configurada")}
        </p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {verified
            ? verification?.verified_over_18
              ? copy("Sua idade foi confirmada e a conta também pode cumprir gates 18+, respeitando as demais regras do ÍMPAR.", "Your age is confirmed and the account can also satisfy 18+ gates, subject to the rest of MGP rules.", "Tu edad está confirmada y la cuenta también puede cumplir gates 18+, respetando las demás reglas de MGP.")
              : copy("Sua idade foi confirmada. O ÍMPAR pode aplicar faixas etárias no LFG sem expor sua data de nascimento aos outros usuários.", "Your age is confirmed. MGP can enforce LFG age ranges without exposing your birth date to other users.", "Tu edad está confirmada. MGP puede aplicar rangos de edad en el LFG sin exponer tu fecha de nacimiento a otros usuarios.")
            : pending
              ? copy("A liberação só acontece quando o verificador concluir a checagem.", "Access unlocks only after the verifier completes the check.", "El acceso solo se libera cuando finalice la comprobación.")
              : copy("A beta atual não depende dessa verificação para usar o LFG. Ela fica reservada para recursos futuros que realmente precisem de uma checagem mais forte.", "The current beta does not require this verification to use LFG. It is reserved for future features that genuinely need stronger age assurance.", "La beta actual no requiere esta verificación para usar el LFG. Queda reservada para funciones futuras que realmente necesiten una comprobación más fuerte.")}
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
