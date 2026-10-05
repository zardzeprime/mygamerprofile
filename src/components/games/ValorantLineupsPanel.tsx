import { Clock3, LockKeyhole, MapPinned, ShieldCheck, Upload, Video } from "lucide-react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function ValorantLineupsPanel({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.10),transparent_50%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-gold-strong">
              <MapPinned className="size-4" />
              <span className="section-kicker">LINEUP LAB</span>
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-amber-300">
              {copy(
                "Uploads fechados no beta",
                "Uploads closed during beta",
                "Subidas cerradas durante la beta",
              )}
            </span>
          </div>

          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Lineups de VALORANT", "VALORANT lineups", "Lineups de VALORANT")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "A biblioteca já está preparada para lineups curtas por mapa, agente e ponto. Publicação da comunidade fica bloqueada no beta até o ÍMPAR ter moderação de vídeo e fluxo de denúncia.",
              "The library is prepared for short lineups organized by map, agent and spot. Community publishing stays locked during beta until ÍMPAR has video moderation and reporting.",
              "La biblioteca ya está preparada para lineups cortas por mapa, agente y punto. La publicación de la comunidad queda bloqueada durante la beta hasta contar con moderación de vídeo y reportes.",
            )}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <InfoCard
            icon={Clock3}
            title={copy("Vídeo curto", "Short video", "Vídeo corto")}
            text={copy(
              "Alvo de 20 segundos e limite planejado de 30 segundos por lineup.",
              "Target 20 seconds, with a planned 30-second maximum per lineup.",
              "Objetivo de 20 segundos y límite previsto de 30 segundos por lineup.",
            )}
          />
          <InfoCard
            icon={MapPinned}
            title={copy("Contexto obrigatório", "Required context", "Contexto obligatorio")}
            text={copy(
              "Mapa, agente, lado, ponto de origem/destino e título ficam vinculados ao vídeo.",
              "Map, agent, side, origin/destination spot and title stay attached to the video.",
              "Mapa, agente, lado, punto de origen/destino y título quedan vinculados al vídeo.",
            )}
          />
          <InfoCard
            icon={ShieldCheck}
            title={copy(
              "Moderação antes de publicar",
              "Moderation before publishing",
              "Moderación antes de publicar",
            )}
            text={copy(
              "Nada enviado por usuário será publicado sem checagem de conteúdo, autoria e denúncias.",
              "No user upload will be published without content checks, authorship review and reporting controls.",
              "Ningún envío de usuario se publicará sin revisión de contenido, autoría y controles de denuncia.",
            )}
          />
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border p-5 sm:p-6">
          <div>
            <p className="section-kicker">{copy("CRIADOR", "CREATOR", "CREADOR")}</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              {copy("Enviar uma lineup", "Submit a lineup", "Enviar una lineup")}
            </h3>
          </div>
          <LockKeyhole className="size-5 text-amber-300" />
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <DisabledField
            label={copy("Mapa", "Map", "Mapa")}
            value={copy("Selecione o mapa", "Select map", "Selecciona el mapa")}
          />
          <DisabledField
            label={copy("Agente", "Agent", "Agente")}
            value={copy("Selecione o agente", "Select agent", "Selecciona el agente")}
          />
          <DisabledField
            label={copy("Lado", "Side", "Lado")}
            value={copy("Ataque / Defesa", "Attack / Defense", "Ataque / Defensa")}
          />
          <DisabledField
            label={copy("Spot", "Spot", "Punto")}
            value={copy("Origem → destino", "Origin → destination", "Origen → destino")}
          />
          <div className="sm:col-span-2">
            <DisabledField
              label={copy("Título", "Title", "Título")}
              value={copy("Nome curto da lineup", "Short lineup name", "Nombre corto de la lineup")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                {copy("Descrição", "Description", "Descripción")}
              </span>
              <textarea
                disabled
                className="mt-2 min-h-24 w-full cursor-not-allowed rounded-xl border border-border bg-muted/10 p-3 text-sm text-muted-foreground opacity-70"
                placeholder={copy(
                  "Detalhe posição, mira e execução…",
                  "Describe position, aim and execution…",
                  "Describe posición, mira y ejecución…",
                )}
              />
            </label>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-dashed border-border bg-muted/10 p-5">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="grid size-12 place-items-center rounded-xl border border-border bg-background/60">
                <Video className="size-5 text-gold-strong" />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">
                {copy(
                  "Upload de vídeo indisponível no beta",
                  "Video upload unavailable during beta",
                  "Subida de vídeo no disponible durante la beta",
                )}
              </p>
              <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                {copy(
                  "Quando abrir, o envio aceitará vídeos curtos com duração máxima de 30 segundos e passará por moderação antes de aparecer publicamente.",
                  "When enabled, submissions will accept short videos up to 30 seconds and will go through moderation before becoming public.",
                  "Cuando se habilite, aceptará vídeos cortos de hasta 30 segundos y pasarán por moderación antes de ser públicos.",
                )}
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-muted/20 px-4 text-sm font-bold text-muted-foreground opacity-60"
              >
                <Upload className="size-4" />
                {copy("Enviar vídeo", "Upload video", "Subir vídeo")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Clock3;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <Icon className="size-5 text-gold-strong" />
      <p className="mt-3 font-display text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function DisabledField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 flex min-h-11 cursor-not-allowed items-center rounded-xl border border-border bg-muted/10 px-3 text-sm text-muted-foreground opacity-70">
        {value}
      </div>
    </label>
  );
}
