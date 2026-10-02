import type { Locale } from "@/i18n";

export type ValorantNewsCategory = "patch" | "announcement" | "esports" | "media" | "dev";
export type ValorantNewsItem = {
  id: string;
  category: ValorantNewsCategory;
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
): ValorantNewsItem => ({
  id: `patch-${version.replace(".", "-")}`,
  category: "patch",
  publishedAt,
  official: true,
  title: localized(
    `Atualização ${version} do VALORANT`,
    `VALORANT Patch Notes ${version}`,
    `Notas de la versión ${version} de VALORANT`,
  ),
  summary: localized(pt, en, es),
  url: `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-${version.replace(".", "-")}/`,
  sourceLabel: "Riot Games",
});

// Editorial snapshot sourced only from Riot Games / VALORANT Esports official channels.
// Historical patches are backfilled in chronological batches through reviewable pull requests.
export const VALORANT_NEWS: ValorantNewsItem[] = [
  {
    id: "champions-shanghai-opening-day",
    category: "esports",
    publishedAt: "2026-09-16T12:45:00.000Z",
    official: true,
    title: localized(
      "Abertura do Champions Shanghai",
      "Champions Shanghai Opening Day",
      "Día de apertura de Champions Shanghai",
    ),
    summary: localized(
      "O conteúdo oficial apresenta o Dia de Abertura de 24 de setembro, com cultura, comunidade, competição e transmissão a partir das 5:00 BRT.",
      "The official preview introduces the September 24 Opening Day with culture, community, competition and a broadcast starting at 5:00 BRT.",
      "El adelanto oficial presenta el Día de Apertura del 24 de septiembre con cultura, comunidad, competición y transmisión desde las 5:00 BRT.",
    ),
    url: "https://valorantesports.com/pt-BR/news/champions-shanghai-opening-day",
    sourceLabel: "VALORANT Esports · Brasil",
  },
  {
    id: "champions-2026-anthem",
    category: "media",
    publishedAt: "2026-09-16T12:35:00.000Z",
    official: true,
    title: localized(
      "If The Sun Burns Out Tonight — hino do Champions 2026",
      "If The Sun Burns Out Tonight — Champions 2026 anthem",
      "If The Sun Burns Out Tonight — himno de Champions 2026",
    ),
    summary: localized(
      "Videoclipe oficial do hino do Champions 2026 com Grabbitz, Oli Sykes e Courtney LaPlante.",
      "Official Champions 2026 anthem music video featuring Grabbitz, Oli Sykes and Courtney LaPlante.",
      "Videoclip oficial del himno de Champions 2026 con Grabbitz, Oli Sykes y Courtney LaPlante.",
    ),
    url: "https://www.youtube.com/watch?v=x8jAY2CoOBg",
    sourceLabel: "VALORANT // Brasil · YouTube",
  },
  {
    id: "dev-update-september-2026",
    category: "dev",
    publishedAt: "2026-09-14T13:00:00.000Z",
    official: true,
    title: localized(
      "Essa é das grandes — Atualizações Dev",
      "One BIG Dev Update",
      "Una gran actualización de desarrollo",
    ),
    summary: localized(
      "A equipe de desenvolvimento apresenta novo modo, novo fuzil e sistemas que compõem a maior atualização do VALORANT em 2026.",
      "The development team previews a new mode, a new rifle and systems behind VALORANT's biggest 2026 update.",
      "El equipo de desarrollo presenta un nuevo modo, un nuevo rifle y sistemas de la mayor actualización de VALORANT de 2026.",
    ),
    url: "https://www.youtube.com/watch?v=LnQxJoS-c4Q",
    sourceLabel: "VALORANT // Brasil · YouTube",
  },
  patch(
    "13.06",
    "2026-09-22T13:00:00.000Z",
    "A maior atualização de 2026 trouxe o novo fuzil Warden, novo Home/Lobby, Agent Mastery, Gauntlet: Glitched, treino no Range durante a fila, Performance Score, Accolades e Rank Legacy.",
    "VALORANT's biggest 2026 update introduced the Warden rifle, new Home/Lobby, Agent Mastery, Gauntlet: Glitched, Range while queueing, Performance Score, Accolades and Rank Legacy.",
    "La mayor actualización de 2026 incorporó el rifle Warden, nuevo Home/Lobby, Agent Mastery, Gauntlet: Glitched, Range durante la cola, Performance Score, Accolades y Rank Legacy.",
  ),
  {
    id: "gauntlet-glitched-reveal",
    category: "media",
    publishedAt: "2026-09-14T14:00:00.000Z",
    official: true,
    title: localized(
      "GAUNTLET: GLITCHED — trailer de revelação do modo",
      "GAUNTLET: GLITCHED — Game Mode Reveal Trailer",
      "GAUNTLET: GLITCHED — tráiler de presentación del modo",
    ),
    summary: localized(
      "16 jogadores, 8 equipes e caos total no novo modo apresentado pela Riot.",
      "16 players, 8 teams and pure chaos in Riot's newly revealed game mode.",
      "16 jugadores, 8 equipos y caos total en el nuevo modo presentado por Riot.",
    ),
    url: "https://www.youtube.com/watch?v=V_uHGQUvLPw",
    sourceLabel: "VALORANT · YouTube",
  },
  {
    id: "champions-shanghai-pickems",
    category: "esports",
    publishedAt: "2026-09-12T15:00:00.000Z",
    official: true,
    title: localized(
      "Champions Shanghai: Pick’Ems powered by AWS",
      "Champions Shanghai: Pick’Ems powered by AWS",
      "Champions Shanghai: Pick’Ems powered by AWS",
    ),
    summary: localized(
      "Os Pick’Ems do Champions Shanghai abriram no site e no cliente, com previsões e recompensas oficiais.",
      "Champions Shanghai Pick’Ems opened on the website and in-client with official predictions and rewards.",
      "Los Pick’Ems de Champions Shanghai abrieron en la web y el cliente con predicciones y recompensas oficiales.",
    ),
    url: "https://valorantesports.com/news/champions-shanghai-pickems-powered-by-aws",
    sourceLabel: "VALORANT Esports",
  },
  {
    id: "champions-shanghai-everything",
    category: "esports",
    publishedAt: "2026-09-11T15:00:00.000Z",
    official: true,
    title: localized(
      "Champions Shanghai: tudo o que você precisa saber",
      "Champions Shanghai: Everything You Need To Know",
      "Champions Shanghai: todo lo que necesitas saber",
    ),
    summary: localized(
      "Formato, calendário e contexto oficial do maior evento internacional do fim da temporada.",
      "Official format, schedule and context for the season-ending international event.",
      "Formato, calendario y contexto oficial del gran evento internacional de final de temporada.",
    ),
    url: "https://valorantesports.com/news/champions-shanghai-everything-you-need-to-know",
    sourceLabel: "VALORANT Esports",
  },
  {
    id: "vct-2027-open-qualifiers",
    category: "esports",
    publishedAt: "2026-09-08T15:00:00.000Z",
    official: true,
    title: localized(
      "Primeiros detalhes das Eliminatórias Abertas do VCT 2027",
      "First details for the 2027 VCT Open Qualifiers",
      "Primeros detalles de los clasificatorios abiertos del VCT 2027",
    ),
    summary: localized(
      "A Riot começou a apresentar o caminho competitivo para a temporada de 2027.",
      "Riot began outlining the competitive path into the 2027 season.",
      "Riot empezó a presentar el camino competitivo hacia la temporada 2027.",
    ),
    url: "https://valorantesports.com/news/get-ready-for-vct-2027-open-qualifiers",
    sourceLabel: "VALORANT Esports",
  },
  patch(
    "13.05",
    "2026-09-01T13:00:00.000Z",
    "Pick’Ems do Champions, penalidades contra stream sniping e ferramentas de instalock, correções e preparação para mudanças no Equipamento de Agentes.",
    "Champions Pick’Ems, penalties for stream sniping and instalock tools, bug fixes, and preparation for Agent Gear changes.",
    "Pick’Ems de Champions, penalizaciones por stream sniping y herramientas de instalock, correcciones y cambios futuros al Equipamiento de Agentes.",
  ),
  patch(
    "13.04",
    "2026-08-18T13:00:00.000Z",
    "Abyss entrou na rotação Competitiva e Breeze saiu, além de correções de Agentes e armas corpo a corpo transformáveis.",
    "Abyss entered the Competitive rotation while Breeze left, alongside Agent and transforming-melee bug fixes.",
    "Abyss entró en la rotación Competitiva y Breeze salió, junto con correcciones de Agentes y melees transformables.",
  ),
  {
    id: "aeris-skin-reveal",
    category: "media",
    publishedAt: "2026-08-17T13:00:00.000Z",
    official: true,
    title: localized(
      "Aeris — trailer de revelação de skins",
      "PLAY YOUR HAND — Aeris Skin Reveal Trailer",
      "Aeris — tráiler de presentación de skins",
    ),
    summary: localized(
      "A Riot revelou oficialmente a linha Aeris e sua estética inspirada em cartas e floreios mágicos.",
      "Riot officially revealed the Aeris skin line and its card-magic visual identity.",
      "Riot reveló oficialmente la línea Aeris y su estética inspirada en cartas y magia.",
    ),
    url: "https://www.youtube.com/watch?v=PoogGcJjsFU",
    sourceLabel: "VALORANT · YouTube",
  },
  patch(
    "13.02",
    "2026-07-28T13:00:00.000Z",
    "Mudança na Ultimate do Phoenix, Split, Corrode e Lotus adicionados ao Retake e diversas correções de Agentes.",
    "Phoenix ultimate adjustment, Split, Corrode and Lotus added to Retake, plus multiple Agent fixes.",
    "Cambio en la definitiva de Phoenix, Split, Corrode y Lotus añadidos a Retake y varias correcciones de Agentes.",
  ),
  {
    id: "neo-frontier-2026",
    category: "media",
    publishedAt: "2026-07-27T13:00:00.000Z",
    official: true,
    title: localized(
      "Neo Oeste retorna ao VALORANT",
      "Neo Frontier returns",
      "Neo Frontier regresa a VALORANT",
    ),
    summary: localized(
      "A linha retornou com Vandal, Shorty e uma nova arma corpo a corpo Laço.",
      "The line returned with the Vandal, Shorty and a new Lasso melee.",
      "La línea regresó con Vandal, Shorty y un nuevo melee Lasso.",
    ),
    url: "https://www.youtube.com/watch?v=iYfYrsd09lo",
    sourceLabel: "VALORANT · YouTube",
  },
  patch(
    "13.01",
    "2026-07-14T13:00:00.000Z",
    "Ajustes de Iso, Yoru e Outlaw, além de medidas contra manipulação de ranque.",
    "Iso, Yoru and Outlaw adjustments plus measures against rank manipulation.",
    "Ajustes de Iso, Yoru y Outlaw, además de medidas contra la manipulación de rango.",
  ),
  patch(
    "13.00",
    "2026-06-23T13:00:00.000Z",
    "Buffs de Sentinelas, ajustes de Iniciadores, Summit na rotação Competitiva, mudanças no RR e várias novidades de sistema.",
    "Sentinel buffs, Initiator adjustments, Summit in Competitive rotation, RR changes and multiple systems updates.",
    "Mejoras a Centinelas, ajustes de Iniciadores, Summit en Competitivo, cambios de RR y varias novedades de sistema.",
  ),
  patch(
    "12.11",
    "2026-06-09T13:00:00.000Z",
    "Última atualização do Ato 3, lançamento do My VALORANT Card, correções e mudanças no Premier.",
    "The final Act 3 patch, launch of My VALORANT Card, bug fixes and Premier changes.",
    "La última actualización del Acto 3, lanzamiento de My VALORANT Card, correcciones y cambios en Premier.",
  ),
  patch(
    "12.10",
    "2026-05-27T13:00:00.000Z",
    "Compartilhamento de Replays de amigos, novos mapas de Skirmish e Pick’Ems do Masters London.",
    "Friend replay sharing, new Skirmish maps and Masters London Pick’Ems.",
    "Replays de amigos, nuevos mapas de Skirmish y Pick’Ems de Masters London.",
  ),
  patch(
    "12.09",
    "2026-05-12T13:00:00.000Z",
    "Nerfs de Neon e escopetas, testes de MMR e uma grande rodada de correções.",
    "Neon and shotgun nerfs, MMR testing and a large batch of fixes.",
    "Nerfs a Neon y escopetas, pruebas de MMR y una gran tanda de correcciones.",
  ),
  patch(
    "12.08",
    "2026-04-28T13:00:00.000Z",
    "Introdução de Skirmish: Ascension, nova rotação de mapas e retorno do Premier.",
    "Introduction of Skirmish: Ascension, a new map rotation and Premier's return.",
    "Introducción de Skirmish: Ascension, nueva rotación de mapas y regreso de Premier.",
  ),
  patch(
    "12.07",
    "2026-04-14T13:00:00.000Z",
    "Parceria com Discord, página de Configurações reformulada e outras melhorias do jogo.",
    "Discord partnership, a revamped Settings page and other game improvements.",
    "Colaboración con Discord, página de Ajustes renovada y otras mejoras del juego.",
  ),
  patch(
    "11.11",
    "2025-12-02T14:00:00.000Z",
    "Melhorias de UI, correções, presente de VP e a última atualização de 2025.",
    "Minor UI updates, bug fixes, VP gifting, and the final patch of 2025.",
    "Mejoras de interfaz, correcciones, regalos de VP y la última actualización de 2025.",
  ),
  patch(
    "11.10",
    "2025-11-11T14:00:00.000Z",
    "Rework completo do Harbor, ajustes de Clove, melhorias de HUD e Replays nos consoles.",
    "Harbor rework, Clove balance changes, HUD improvements, and Replays on console.",
    "Rework de Harbor, ajustes de Clove, mejoras del HUD y Replays en consola.",
  ),
  patch(
    "11.09",
    "2025-10-28T13:00:00.000Z",
    "MFA para contas compartilhadas, melhorias de qualidade de vida e correções.",
    "MFA for shared accounts, quality-of-life updates, and bug fixes.",
    "MFA para cuentas compartidas, mejoras de calidad de vida y correcciones.",
  ),
  patch(
    "11.08",
    "2025-10-14T13:00:00.000Z",
    "Grande atualização de balanceamento de Agentes, mapas e armas para reforçar a visão tática de longo prazo.",
    "Major Agent, map, and weapon balance update aligned with VALORANT's long-term tactical vision.",
    "Gran actualización de balance de Agentes, mapas y armas alineada con la visión táctica a largo plazo.",
  ),
  patch(
    "11.07",
    "2025-09-30T13:00:00.000Z",
    "Clareza visual, informações mais consistentes para habilidades e um novo modo apenas para partidas personalizadas.",
    "Visual clarity, more consistent ability information, and a new customs-only mode.",
    "Claridad visual, información más consistente para habilidades y un nuevo modo solo para personalizadas.",
  ),
  patch(
    "11.06",
    "2025-09-16T13:00:00.000Z",
    "O sistema de Replays chegou para Competitivo, Sem Classificação, Disputa da Spike e Premier no PC.",
    "The Replay System arrived for Competitive, Unrated, Swiftplay, and Premier on PC.",
    "El sistema de Replays llegó a Competitivo, No Clasificatoria, Swiftplay y Premier en PC.",
  ),
];
