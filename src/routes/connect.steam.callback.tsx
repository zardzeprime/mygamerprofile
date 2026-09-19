import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { completeSteamConnection } from "@/lib/steam.functions";

export const Route = createFileRoute("/connect/steam/callback")({
  component: SteamCallbackPage,
  head: () => ({
    meta: [
      { title: "Steam — MG Profile" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Status = "working" | "success" | "error";

function SteamCallbackPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const navigate = useNavigate();
  const finishSteam = useServerFn(completeSteamConnection);
  const started = useRef(false);
  const [status, setStatus] = useState<Status>("working");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const search = new URLSearchParams(window.location.search);
      const state = search.get("state") ?? "";
      const params: Record<string, string> = {};
      search.forEach((value, key) => {
        if (key.startsWith("openid.")) params[key] = value;
      });

      if (!state || Object.keys(params).length === 0) {
        setStatus("error");
        setDetail(
          copy(
            "A Steam não retornou os dados necessários para concluir a conexão.",
            "Steam did not return the information required to complete the connection.",
            "Steam no devolvió los datos necesarios para completar la conexión.",
          ),
        );
        return;
      }

      try {
        const result = await finishSteam({ data: { state, params } });
        setStatus("success");
        setDetail(
          result.displayName
            ? copy(
                `Steam conectada como ${result.displayName}.`,
                `Steam connected as ${result.displayName}.`,
                `Steam conectada como ${result.displayName}.`,
              )
            : copy(
                "Sua conta Steam foi conectada ao MG Profile.",
                "Your Steam account is now connected to MG Profile.",
                "Tu cuenta de Steam ya está conectada a MG Profile.",
              ),
        );

        window.setTimeout(() => {
          void navigate({ to: "/settings/connections", replace: true });
        }, 900);
      } catch (error) {
        const raw = error instanceof Error ? error.message : String(error);
        setStatus("error");
        setDetail(formatSteamError(raw, copy));
      }
    };

    void run();
  }, [copy, finishSteam, navigate]);

  return (
    <main className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-xl place-items-center px-4 py-12">
      <section className="surface-panel w-full p-6 text-center sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-muted/20">
          {status === "working" ? (
            <Loader2 className="size-6 animate-spin text-gold-strong" aria-hidden="true" />
          ) : status === "success" ? (
            <CheckCircle2 className="size-6 text-emerald-500" aria-hidden="true" />
          ) : (
            <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
          )}
        </div>

        <p className="section-kicker mt-5">MGP / STEAM</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">
          {status === "working"
            ? copy("Confirmando sua Steam", "Confirming your Steam account", "Confirmando tu cuenta de Steam")
            : status === "success"
              ? copy("Steam conectada", "Steam connected", "Steam conectada")
              : copy("Não foi possível conectar", "Could not connect Steam", "No se pudo conectar Steam")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {status === "working"
            ? copy(
                "Estamos verificando a resposta diretamente com a Steam. Não feche esta página.",
                "We are verifying the response directly with Steam. Do not close this page.",
                "Estamos verificando la respuesta directamente con Steam. No cierres esta página.",
              )
            : detail}
        </p>

        {status !== "working" ? (
          <Button asChild variant={status === "success" ? "default" : "outline"} className="mt-6">
            <Link to="/settings/connections">
              {copy("Voltar para conexões", "Back to connections", "Volver a conexiones")}
            </Link>
          </Button>
        ) : null}
      </section>
    </main>
  );
}

function formatSteamError(
  raw: string,
  copy: (pt: string, en: string, es: string) => string,
) {
  if (raw.includes("STEAM_ACCOUNT_ALREADY_LINKED")) {
    return copy(
      "Essa conta Steam já está vinculada a outro perfil do MG Profile.",
      "This Steam account is already linked to another MG Profile account.",
      "Esta cuenta de Steam ya está vinculada a otro perfil de MG Profile.",
    );
  }
  if (raw.includes("STEAM_LINK_STATE_EXPIRED")) {
    return copy(
      "A tentativa de conexão expirou. Volte para Conexões e tente novamente.",
      "The connection attempt expired. Go back to Connections and try again.",
      "El intento de conexión expiró. Vuelve a Conexiones e inténtalo de nuevo.",
    );
  }
  if (raw.includes("STEAM_OPENID_CANCELLED")) {
    return copy(
      "A conexão foi cancelada na Steam.",
      "The Steam connection was cancelled.",
      "La conexión con Steam fue cancelada.",
    );
  }
  return copy(
    "A verificação da Steam falhou. Tente iniciar a conexão novamente.",
    "Steam verification failed. Try starting the connection again.",
    "La verificación de Steam falló. Intenta iniciar la conexión de nuevo.",
  );
}
