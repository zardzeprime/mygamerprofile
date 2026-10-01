import type { Locale } from "@/i18n";

export type LeagueNewsCategory = "patch" | "announcement" | "esports" | "media" | "dev";
export type LeagueNewsItem = {
  id: string;
  category: LeagueNewsCategory;
  publishedAt: string;
  upcoming?: boolean;
  official: true;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  url: string;
  sourceLabel: string;
};

const localized = (pt: string, en: string, es: string): Record<Locale, string> => ({ "pt-BR": pt, en, es });

const patch = (version: string, publishedAt: string, pt: string, en: string, es: string): LeagueNewsItem => ({
  id: `patch-${version.replace(".", "-")}`,
  category: "patch",
  publishedAt,
  official: true,
  title: localized(`Atualização ${version} do League of Legends`, `League of Legends Patch ${version}`, `Actualización ${version} de League of Legends`),
  summary: localized(pt, en, es),
  url: `https://www.leagueoflegends.com/pt-br/news/game-updates/league-of-legends-patch-${version.replace(".", "-")}-notes/`,
  sourceLabel: "Riot Games",
});

// Vassago snapshot: only Riot Games / LoL Esports official sources.
export const LEAGUE_NEWS: LeagueNewsItem[] = [
  {
    id: "worlds-2026-anthem-true-damage",
    category: "esports",
    publishedAt: "2026-09-29T16:00:00.000Z",
    upcoming: true,
    official: true,
    title: localized("True Damage retorna com o hino do Worlds 2026", "True Damage returns with the Worlds 2026 anthem", "True Damage regresa con el himno de Worlds 2026"),
    summary: localized("O LoL Esports confirmou True Damage em Know My Name, o hino do Mundial 2026. A música e o videoclipe oficial estreiam em 8 de outubro às 18h PDT e celebram o legado histórico de Faker e T1.", "LoL Esports confirmed True Damage for Know My Name, the 2026 Worlds anthem. The track and official music video premiere October 8 at 6 PM PDT and celebrate Faker and T1's historic legacy.", "LoL Esports confirmó a True Damage para Know My Name, el himno de Worlds 2026. La canción y el video oficial se estrenan el 8 de octubre a las 18:00 PDT y celebran el legado histórico de Faker y T1."),
    url: "https://lolesports.com/en-gb/news/worlds-anthem-presented-by-true-damage",
    sourceLabel: "LoL Esports",
  },
  {
    id: "league-classic-fortune-favors-bold",
    category: "media",
    publishedAt: "2026-09-28T16:00:00.000Z",
    official: true,
    title: localized("A sorte favorece os ousados no League Classic", "Fortune Favors the Bold in League Classic", "La fortuna favorece a los audaces en League Classic"),
    summary: localized("Fizz, Nami, Nautilus e Graves foram liberados no League Classic, ampliando oficialmente o elenco disponível no modo.", "Fizz, Nami, Nautilus and Graves are now available in League Classic, officially expanding the mode's playable roster.", "Fizz, Nami, Nautilus y Graves ya están disponibles en League Classic, ampliando oficialmente el plantel jugable del modo."),
    url: "https://www.leagueoflegends.com/en-us/news/game-updates/",
    sourceLabel: "Riot Games · Game Updates",
  },
  {
    id: "lcp-2027-wild-card-open-invitation",
    category: "esports",
    publishedAt: "2026-09-23T16:00:00.000Z",
    official: true,
    title: localized("LCP 2027 abre convite para organizadores de Wild Card", "LCP 2027 opens Wild Card organizer invitation", "LCP 2027 abre invitación para organizadores de Wild Card"),
    summary: localized("O LoL Esports abriu manifestação de interesse para organizações que queiram operar torneios Wild Card em regiões da APAC, ampliando o caminho competitivo para o LCP em 2027.", "LoL Esports opened expressions of interest for organizations that want to run Wild Card tournaments in APAC regions, expanding the competitive path into the LCP in 2027.", "LoL Esports abrió expresiones de interés para organizaciones que quieran operar torneos Wild Card en regiones de APAC, ampliando la ruta competitiva hacia el LCP en 2027."),
    url: "https://lolesports.com/en-ph/news/lcp-2027-wild-card-open-invitation",
    sourceLabel: "LoL Esports",
  },
  patch("26.19", "2026-09-22T18:00:00.000Z", "Primeira rodada de mudanças focadas no cenário profissional antes da Atualização do Mundial, com ajustes em Campeões, Teleporte, Classic e Arena. Janna e Mel Congregação das Bruxas, Anivia Deusa Antiga e Urgot Deus Antigo chegam em 23 de setembro.", "The first pro-focused balance pass ahead of the Worlds patch, with Champion, Teleport, Classic and Arena changes. Coven Janna and Mel plus Old God Anivia and Urgot arrive September 23.", "Primera ronda de cambios centrados en el competitivo antes del parche de Worlds, con ajustes de campeones, Teleport, Classic y Arena. Coven Janna y Mel, además de Old God Anivia y Urgot, llegan el 23 de septiembre."),
  {
    id: "heartsteel-live-my-life-26-20",
    category: "announcement",
    publishedAt: "2026-09-22T15:00:00.000Z",
    upcoming: true,
    official: true,
    title: localized("HEARTSTEEL — Live My Life chega na 26.20", "HEARTSTEEL — Live My Life debuts with 26.20", "HEARTSTEEL — Live My Life debuta con la 26.20"),
    summary: localized("A Riot confirmou o lançamento de Live My Life junto da Atualização 26.20.", "Riot confirmed Live My Life will debut with Patch 26.20.", "Riot confirmó que Live My Life debutará con la versión 26.20."),
    url: "https://www.leagueoflegends.com/en-gb/news/announcements/",
    sourceLabel: "Riot Games · Announcements",
  },
  {
    id: "lcp-ecosystem-2027",
    category: "esports",
    publishedAt: "2026-09-21T02:35:00.000Z",
    official: true,
    title: localized("LCP terá ecossistema mais aberto em 2027", "A more open LCP ecosystem in 2027", "Un ecosistema LCP más abierto en 2027"),
    summary: localized("PCS, VCS e LJL passam a formar uma rota doméstica mais aberta para classificação ao LCP e aos eventos globais.", "PCS, VCS and LJL form a more open domestic path into the LCP and global events.", "PCS, VCS y LJL forman una ruta doméstica más abierta hacia el LCP y los eventos globales."),
    url: "https://lolesports.com/en-au/news/a-more-open-lcp-ecosystem-in-2027",
    sourceLabel: "LoL Esports",
  },
  patch("26.18", "2026-09-09T18:00:00.000Z", "Caps entrou para o Hall of Legends, o Classic recebeu conteúdo de Demacia e houve ajustes para Summoner's Rift e ARAM: Desordem.", "Caps entered the Hall of Legends, Classic received Demacia content, and Summoner's Rift plus ARAM: Mayhem received balance updates.", "Caps entró al Hall of Legends, Classic recibió contenido de Demacia y hubo ajustes para Summoner's Rift y ARAM: Mayhem."),
  {
    id: "team-voice-classic-dev-update",
    category: "dev",
    publishedAt: "2026-09-08T15:00:00.000Z",
    official: true,
    title: localized("Atualização Dev: Team Voice, Classic e mais", "Dev Update: Team Voice, Classic & More", "Actualización de desarrollo: Team Voice, Classic y más"),
    summary: localized("A equipe discutiu Team Voice, League Classic, Mayhem, Ranked 5s e outros sistemas. Na 26.19, a Riot confirmou que a expansão do Team Voice foi adiada sem um patch-alvo definido.", "The team discussed Team Voice, League Classic, Mayhem, Ranked 5s and other systems. In 26.19, Riot confirmed the Team Voice expansion was delayed with no target patch.", "El equipo habló de Team Voice, League Classic, Mayhem, Ranked 5s y otros sistemas. En la 26.19, Riot confirmó que la expansión de Team Voice fue aplazada sin parche objetivo."),
    url: "https://www.leagueoflegends.com/en-ph/news/",
    sourceLabel: "Riot Games · Dev",
  },
  patch("26.17", "2026-08-25T18:00:00.000Z", "Mudanças em Arena, Summoner's Rift e outros modos, continuando a preparação do meta da Temporada 3.", "Changes across Arena, Summoner's Rift and other modes continued the Season 3 meta setup.", "Cambios en Arena, Summoner's Rift y otros modos continuaron preparando el meta de la Temporada 3."),
  patch("26.16", "2026-08-11T18:00:00.000Z", "Atualizações de Campeões e sistemas, além da chegada de novos conteúdos ao League Classic.", "Champion and system updates alongside new League Classic content.", "Actualizaciones de campeones y sistemas junto con nuevo contenido de League Classic."),
  patch("26.15", "2026-07-28T18:00:00.000Z", "Lote oficial de balanceamento da Riot para campeões, itens e runas, incorporado ao arquivo histórico do MGP.", "Riot's official balance batch for champions, items and runes, added to the MGP historical archive.", "Lote oficial de balance de Riot para campeones, objetos y runas, incorporado al archivo histórico de MGP."),
  patch("26.14", "2026-07-14T18:00:00.000Z", "Atualização oficial com mudanças de jogo e conteúdo competitivo, preservada na cronologia do hub.", "Official game update with gameplay and competitive content changes, preserved in the hub chronology.", "Actualización oficial con cambios de juego y contenido competitivo, preservada en la cronología del hub."),
  patch("26.13", "2026-06-30T18:00:00.000Z", "Atualização oficial da Riot adicionada ao backfill cronológico do MGP.", "Official Riot update added to MGP's chronological backfill.", "Actualización oficial de Riot añadida al backfill cronológico de MGP."),
];
