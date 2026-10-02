import { FormEvent, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { lookupRiotAccount, type RiotAccountLookupResult } from "@/lib/riot.functions";

export function RiotPlayerSearch({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [riotId, setRiotId] = useState("");
  const [result, setResult] = useState<RiotAccountLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = riotId.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const account = await lookupRiotAccount({ data: { riotId: value, routing: "americas" } });
      setResult(account);
    } catch (reason) {
      const raw = reason instanceof Error ? reason.message : String(reason);
      if (raw.includes("RIOT_API_NOT_CONFIGURED")) {
        setError(
          copy(
            "API Riot ainda não conectada. A busca já está pronta e liga assim que RIOT_API_KEY for configurada.",
            "Riot API is not connected yet. Search is ready and will activate once RIOT_API_KEY is configured.",
            "La API de Riot todavía no está conectada. La búsqueda se activará cuando se configure RIOT_API_KEY.",
          ),
        );
      } else if (raw.includes("RIOT_ACCOUNT_NOT_FOUND")) {
        setError(copy("Riot ID não encontrado.", "Riot ID not found.", "Riot ID no encontrado."));
      } else if (raw.includes("RIOT_API_RATE_LIMIT")) {
        setError(
          copy(
            "A Riot pediu uma pausa nas buscas. Tenta de novo daqui a pouco.",
            "Riot rate-limited the search. Try again shortly.",
            "Riot limitó las búsquedas. Inténtalo de nuevo en un momento.",
          ),
        );
      } else if (raw.includes("RIOT_ID_INVALID")) {
        setError(
          copy("Usa o formato Nome#TAG.", "Use the format Name#TAG.", "Usa el formato Nombre#TAG."),
        );
      } else {
        setError(
          copy(
            "A busca da Riot falhou nessa tentativa.",
            "Riot search failed this time.",
            "La búsqueda de Riot falló esta vez.",
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="surface-panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">RIOT ID</p>
          <h2 className="mt-2 font-display text-lg font-semibold text-foreground">
            {copy("Buscar jogador", "Find a player", "Buscar jugador")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Procure uma conta pelo Riot ID completo. A busca usa a API oficial da Riot no servidor; a chave nunca vai para o navegador.",
              "Look up an account by full Riot ID. Search uses Riot's official API on the server; the key never reaches the browser.",
              "Busca una cuenta por Riot ID completo. La búsqueda usa la API oficial de Riot en el servidor; la clave nunca llega al navegador.",
            )}
          </p>
        </div>
        <ShieldCheck className="size-5 shrink-0 text-gold-strong" />
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={riotId}
          onChange={(event) => setRiotId(event.target.value)}
          placeholder="KorolEzra#BR1"
          maxLength={64}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1"
          aria-label="Riot ID"
        />
        <Button type="submit" disabled={loading || !riotId.trim()}>
          <Search className="mr-2 size-4" />
          {loading
            ? copy("Buscando…", "Searching…", "Buscando…")
            : copy("Buscar", "Search", "Buscar")}
        </Button>
      </form>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-strong">
            {copy("Conta encontrada", "Account found", "Cuenta encontrada")}
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">
            {result.gameName}#{result.tagLine}
          </p>
          <p className="mt-1 break-all text-xs text-muted-foreground">PUUID · {result.puuid}</p>
        </div>
      ) : null}

      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
        {copy(
          "Conectar uma conta Riot ao perfil (RSO) é uma etapa separada e depende de aprovação da aplicação de produção pela Riot.",
          "Connecting a Riot account to a profile (RSO) is a separate step and depends on Riot approving the production application.",
          "Conectar una cuenta Riot al perfil (RSO) es un paso separado y depende de la aprobación de la aplicación de producción por Riot.",
        )}
      </p>
    </section>
  );
}
