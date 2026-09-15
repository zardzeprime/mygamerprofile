import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { GameArtwork } from "@/components/games/GameArtwork";
import { GAMES } from "@/config/games";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export const Route = createFileRoute("/communities/")({
  head: () => ({
    meta: [
      { title: "Comunidades — MGP" },
      {
        name: "description",
        content: "Espaços sociais do MGP para posts, discussões, criadores e conteúdo da comunidade.",
      },
      { property: "og:title", content: "Comunidades — MGP" },
    ],
  }),
  component: CommunitiesCatalog,
});

function CommunitiesCatalog() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="section-kicker">MGP / SOCIAL</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">
          {copy("Comunidades", "Communities", "Comunidades")}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
          {copy(
            "Aqui ficam os espaços sociais do MGP. O catálogo de Jogos explica e organiza cada jogo; Comunidades é onde entram conversas, criadores, posts, discussões e conteúdo feito por quem joga.",
            "This is where MGP's social spaces live. The Games catalog explains and organizes each game; Communities is where conversations, creators, posts, discussions and player-made content belong.",
            "Aquí viven los espacios sociales de MGP. El catálogo de Juegos explica y organiza cada juego; Comunidades es donde entran conversaciones, creadores, publicaciones, debates y contenido hecho por jugadores.",
          )}
        </p>
      </div>

      <div className="mt-9 grid gap-6 md:grid-cols-2">
        {GAMES.map((game) => (
          <article key={game.slug} className="surface-panel group overflow-hidden rounded-2xl">
            <div className="relative h-48 overflow-hidden border-b border-border">
              <GameArtwork game={game} variant="hero" className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                    <ShieldCheck className="size-3.5" />
                    {copy("Comunidade MGP", "MGP community", "Comunidad MGP")}
                  </span>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-amber-300">
                    {copy("Em formação", "Forming", "En formación")}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-white">{game.name}</h2>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm leading-6 text-muted-foreground">
                {copy(
                  `Espaço social para jogadores de ${game.name}: discussões, posts, criadores e conteúdo da comunidade ficarão reunidos aqui.`,
                  `Social space for ${game.name} players: discussions, posts, creators and community content will live here.`,
                  `Espacio social para jugadores de ${game.name}: debates, publicaciones, creadores y contenido de la comunidad estarán reunidos aquí.`,
                )}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <CommunityFeature icon={MessageCircle} label={copy("Posts", "Posts", "Posts")} />
                <CommunityFeature icon={Users} label={copy("Criadores", "Creators", "Creadores")} />
                <CommunityFeature icon={Sparkles} label={copy("Destaques", "Highlights", "Destacados")} />
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground">
                {copy(
                  "A página individual da comunidade será ativada quando começarmos a publicar atividade social real.",
                  "The individual community page will be enabled once real social activity starts being published.",
                  "La página individual de la comunidad se activará cuando empecemos a publicar actividad social real.",
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CommunityFeature({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center">
      <Icon className="mx-auto size-4 text-gold-strong" />
      <span className="mt-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
