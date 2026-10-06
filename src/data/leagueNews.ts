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

const localized = (pt: string, en: string, es: string): Record<Locale, string> => ({
  "pt-BR": pt,
  en,
  es,
});

const patch = (
  version: string,
  publishedAt: string,
  pt: string,
  en: string,
  es: string,
): LeagueNewsItem => ({
  id: `patch-${version.replace(".", "-")}`,
  category: "patch",
  publishedAt,
  official: true,
  title: localized(
    `Atualização ${version} do League of Legends`,
    `League of Legends Patch ${version}`,
    `Actualización ${version} de League of Legends`,
  ),
  summary: localized(pt, en, es),
  url: `https://www.leagueoflegends.com/pt-br/news/game-updates/league-of-legends-patch-${version.replace(".", "-")}-notes/`,
  sourceLabel: "Riot Games",
});

// Vassago snapshot: only Riot Games / LoL Esports official sources.
export const LEAGUE_NEWS: LeagueNewsItem[] = [
  {
    id: "worlds-2026-primer",
    category: "esports",
    publishedAt: "2026-10-05T00:00:00.000Z",
    official: true,
    title: localized(
      "Guia oficial do Worlds 2026",
      "Worlds 2026 Primer",
      "Guía oficial de Worlds 2026",
    ),
    summary: localized(
      "O LoL Esports publicou o guia completo do Mundial 2026: Play-In de 15 a 18 de outubro, Suíço de 23 a 31 de outubro e mata-mata de 3 a 14 de novembro. O anúncio também detalha equipes classificadas, sorteios, Pick'Em, Fan Fest e conteúdo do evento dentro do jogo.",
      "LoL Esports published the full Worlds 2026 primer: Play-Ins run October 15-18, Swiss runs October 23-31, and Knockouts run November 3-14. The announcement also details qualified teams, draws, Pick'Em, Fan Fest, and in-game event content.",
      "LoL Esports publicó la guía completa de Worlds 2026: Play-In del 15 al 18 de octubre, Suizo del 23 al 31 de octubre y eliminatorias del 3 al 14 de noviembre. El anuncio también detalla equipos clasificados, sorteos, Pick'Em, Fan Fest y contenido del evento dentro del juego.",
    ),
    url: "https://lolesports.com/en-US/news/worlds-2026-primer",
    sourceLabel: "LoL Esports",
  },
  {
    id: "lcp-2027-wild-card-open-invitation",
    category: "esports",
    publishedAt: "2026-09-23T00:00:00.000Z",
    official: true,
    title: localized(
      "LCP 2027 abre convite para organizadores de Wild Card",
      "LCP 2027 opens Wild Card organizer invitation",
      "LCP 2027 abre invitación para organizadores de Wild Card",
    ),
    summary: localized(
      "O LoL Esports abriu manifestação de interesse para organizações que queiram operar torneios Wild Card em regiões da APAC, ampliando o caminho competitivo para o LCP em 2027. Apenas candidatos selecionados serão contatados enquanto o formato final ainda é definido.",
      "LoL Esports opened expressions of interest for organizations that want to run Wild Card tournaments in APAC regions, expanding the competitive path into the LCP in 2027. Only shortlisted applicants will be contacted while the final format is still being defined.",
      "LoL Esports abrió expresiones de interés para organizaciones que quieran operar torneos Wild Card en regiones de APAC, ampliando la ruta competitiva hacia el LCP en 2027. Solo se contactará a los candidatos seleccionados mientras se define el formato final.",
    ),
    url: "https://lolesports.com/en-ph/news/lcp-2027-wild-card-open-invitation",
    sourceLabel: "LoL Esports",
  },
  patch(
    "26.19",
    "2026-09-22T18:00:00.000Z",
    "Primeira rodada de mudanças focadas no cenário profissional antes da Atualização do Mundial, com ajustes em Campeões, Teleporte, Classic e Arena. Janna e Mel Congregação das Bruxas, Anivia Deusa Antiga e Urgot Deus Antigo chegam em 23 de setembro.",
    "The first pro-focused balance pass ahead of the Worlds patch, with Champion, Teleport, Classic and Arena changes. Coven Janna and Mel plus Old God Anivia and Urgot arrive September 23.",
    "Primera ronda de cambios centrados en el competitivo antes del parche de Worlds, con ajustes de campeones, Teleport, Classic y Arena. Coven Janna y Mel, además de Old God Anivia y Urgot, llegan el 23 de septiembre.",
  ),
  {
    id: "heartsteel-live-my-life-26-20",
    category: "announcement",
    publishedAt: "2026-09-22T15:00:00.000Z",
    upcoming: true,
    official: true,
    title: localized(
      "HEARTSTEEL — Live My Life chega na 26.20",
      "HEARTSTEEL — Live My Life debuts with 26.20",
      "HEARTSTEEL — Live My Life debuta con la 26.20",
    ),
    summary: localized(
      "A Riot confirmou o lançamento de Live My Life junto da Atualização 26.20.",
      "Riot confirmed Live My Life will debut with Patch 26.20.",
      "Riot confirmó que Live My Life debutará con la versión 26.20.",
    ),
    url: "https://www.leagueoflegends.com/en-gb/news/announcements/",
    sourceLabel: "Riot Games · Announcements",
  },
  {
    id: "lcp-ecosystem-2027",
    category: "esports",
    publishedAt: "2026-09-21T02:35:00.000Z",
    official: true,
    title: localized(
      "LCP terá ecossistema mais aberto em 2027",
      "A more open LCP ecosystem in 2027",
      "Un ecosistema LCP más abierto en 2027",
    ),
    summary: localized(
      "PCS, VCS e LJL passam a formar uma rota doméstica mais aberta para classificação ao LCP e aos eventos globais.",
      "PCS, VCS and LJL form a more open domestic path into the LCP and global events.",
      "PCS, VCS y LJL forman una ruta doméstica más abierta hacia el LCP y los eventos globales.",
    ),
    url: "https://lolesports.com/en-au/news/a-more-open-lcp-ecosystem-in-2027",
    sourceLabel: "LoL Esports",
  },
  patch(
    "26.18",
    "2026-09-09T18:00:00.000Z",
    "Caps entrou para o Hall of Legends, o Classic recebeu conteúdo de Demacia e houve ajustes para Summoner's Rift e ARAM: Desordem.",
    "Caps entered the Hall of Legends, Classic received Demacia content, and Summoner's Rift plus ARAM: Mayhem received balance updates.",
    "Caps entró al Hall of Legends, Classic recibió contenido de Demacia y hubo ajustes para Summoner's Rift y ARAM: Mayhem.",
  ),
  {
    id: "team-voice-classic-dev-update",
    category: "dev",
    publishedAt: "2026-09-08T15:00:00.000Z",
    official: true,
    title: localized(
      "Atualização Dev: Team Voice, Classic e mais",
      "Dev Update: Team Voice, Classic & More",
      "Actualización de desarrollo: Team Voice, Classic y más",
    ),
    summary: localized(
      "A equipe discutiu Team Voice, League Classic, Mayhem, Ranked 5s e outros sistemas. Na 26.19, a Riot confirmou que a expansão do Team Voice foi adiada sem um patch-alvo definido.",
      "The team discussed Team Voice, League Classic, Mayhem, Ranked 5s and other systems. In 26.19, Riot confirmed the Team Voice expansion was delayed with no target patch.",
      "El equipo habló de Team Voice, League Classic, Mayhem, Ranked 5s y otros sistemas. En la 26.19, Riot confirmó que la expansión de Team Voice fue aplazada sin parche objetivo.",
    ),
    url: "https://www.leagueoflegends.com/en-ph/news/",
    sourceLabel: "Riot Games · Dev",
  },
  patch(
    "26.17",
    "2026-08-25T18:00:00.000Z",
    "Mudanças em Arena, Summoner's Rift e outros modos, continuando a preparação do meta da Temporada 3.",
    "Changes across Arena, Summoner's Rift and other modes continued the Season 3 meta setup.",
    "Cambios en Arena, Summoner's Rift y otros modos continuaron preparando el meta de la Temporada 3.",
  ),
  patch(
    "26.16",
    "2026-08-11T18:00:00.000Z",
    "Atualizações de Campeões e sistemas, além da chegada de novos conteúdos ao League Classic.",
    "Champion and system updates alongside new League Classic content.",
    "Actualizaciones de campeones y sistemas junto con nuevo contenido de League Classic.",
  ),
  patch(
    "26.15",
    "2026-07-28T18:00:00.000Z",
    "Ajustes de Campeões e sistemas com uma atualização ampla de Bel'Veth, mudanças na Égide da Valentia e novas restrições de dupla nos ranques mais altos, além de balanceamento de Arena e Desordem.",
    "Champion and system tuning with a broad Bel'Veth update, changes to Aegis of Valor and high-rank duo restrictions, plus Arena and Mayhem balance work.",
    "Ajustes de campeones y sistemas con una amplia actualización de Bel'Veth, cambios a Aegis of Valor y restricciones de dúo en rangos altos, además de balance de Arena y Mayhem.",
  ),
  patch(
    "26.14",
    "2026-07-14T18:00:00.000Z",
    "Ajustes em Campeões, efeito azul e itens, além de mudanças em Desordem e Arena. As skins da T1 tricampeã do Mundial chegaram nesta atualização.",
    "Champion, blue buff and item tuning alongside Mayhem and Arena changes. T1's three-peat World Championship skins arrived in this patch.",
    "Ajustes de campeones, buff azul y objetos, además de cambios en Mayhem y Arena. Las skins de T1 tricampeón mundial llegaron en esta versión.",
  ),
  patch(
    "26.13",
    "2026-06-23T18:00:00.000Z",
    "Locke, o Exorcista Cinzento, estreia junto do retorno das Ranqueadas 5v5, novas opções de Arena e a integração Riot/Discord nas regiões compatíveis.",
    "Locke, the Ashen Exorcist, debuts alongside the return of Ranked 5s, new Arena options, and Riot/Discord integration in supported regions.",
    "Locke, el Exorcista Cenizo, debuta junto al regreso de Ranked 5s, nuevas opciones de Arena y la integración Riot/Discord en regiones compatibles.",
  ),
];
