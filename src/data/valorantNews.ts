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

// Editorial snapshot sourced only from Riot Games / VALORANT Esports official channels.
// This file is intentionally plain data so the automated news watcher can update it
// through reviewable GitHub pull requests instead of writing directly to production.
export const VALORANT_NEWS: ValorantNewsItem[] = [
  {
    id: "patch-13-06-announced",
    category: "announcement",
    publishedAt: "2026-09-22T13:00:00.000Z",
    upcoming: true,
    official: true,
    title: {
      "pt-BR": "Atualização 13.06 está prevista para 22 de setembro",
      en: "Patch 13.06 is planned for September 22",
      es: "La versión 13.06 está prevista para el 22 de septiembre",
    },
    summary: {
      "pt-BR": "A Riot antecipou uma atualização maior para o sistema de Equipamentos de Agentes, vinculando a progressão ao tempo jogado com cada Agente.",
      en: "Riot previewed a larger Agent Gear system update that will tie progression more directly to time played on each Agent.",
      es: "Riot adelantó una actualización mayor del sistema de Equipamiento de Agentes, vinculando la progresión al tiempo jugado con cada Agente.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-05/",
    sourceLabel: "Riot Games · Patch 13.05",
  },
  {
    id: "gauntlet-glitched-reveal",
    category: "media",
    publishedAt: "2026-09-14T14:00:00.000Z",
    official: true,
    title: {
      "pt-BR": "GAUNTLET: GLITCHED — trailer de revelação do modo",
      en: "GAUNTLET: GLITCHED — Game Mode Reveal Trailer",
      es: "GAUNTLET: GLITCHED — tráiler de presentación del modo",
    },
    summary: {
      "pt-BR": "16 jogadores, 8 equipes e caos total no novo modo apresentado pela Riot.",
      en: "16 players, 8 teams and pure chaos in Riot's newly revealed game mode.",
      es: "16 jugadores, 8 equipos y caos total en el nuevo modo presentado por Riot.",
    },
    url: "https://www.youtube.com/watch?v=V_uHGQUvLPw",
    sourceLabel: "VALORANT · YouTube",
  },
  {
    id: "champions-shanghai-everything",
    category: "esports",
    publishedAt: "2026-09-11T15:00:00.000Z",
    official: true,
    title: {
      "pt-BR": "Champions Shanghai: tudo o que você precisa saber",
      en: "Champions Shanghai: Everything You Need To Know",
      es: "Champions Shanghai: todo lo que necesitas saber",
    },
    summary: {
      "pt-BR": "Formato, calendário e contexto oficial do maior evento internacional do fim da temporada.",
      en: "Official format, schedule and context for the season-ending international event.",
      es: "Formato, calendario y contexto oficial del gran evento internacional de final de temporada.",
    },
    url: "https://valorantesports.com/",
    sourceLabel: "VALORANT Esports",
  },
  {
    id: "vct-2027-open-qualifiers",
    category: "esports",
    publishedAt: "2026-09-08T15:00:00.000Z",
    official: true,
    title: {
      "pt-BR": "Primeiros detalhes das Eliminatórias Abertas do VCT 2027",
      en: "First details for the 2027 VCT Open Qualifiers",
      es: "Primeros detalles de los clasificatorios abiertos del VCT 2027",
    },
    summary: {
      "pt-BR": "A Riot começou a apresentar o caminho competitivo para a temporada de 2027.",
      en: "Riot began outlining the competitive path into the 2027 season.",
      es: "Riot empezó a presentar el camino competitivo hacia la temporada 2027.",
    },
    url: "https://valorantesports.com/",
    sourceLabel: "VALORANT Esports",
  },
  {
    id: "patch-13-05",
    category: "patch",
    publishedAt: "2026-09-01T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 13.05 do VALORANT", en: "VALORANT Patch Notes 13.05", es: "Notas de la versión 13.05 de VALORANT" },
    summary: {
      "pt-BR": "Bolão do Champions, novas penalidades contra espionagem de stream e ferramentas de instalock, correções e preparação para mudanças no Equipamento de Agentes.",
      en: "Champions Pick’Ems, penalties for stream sniping and instalock tools, bug fixes, and preparation for Agent Gear changes.",
      es: "Pick’Ems de Champions, penalizaciones por stream sniping y herramientas de instalock, correcciones y cambios futuros al Equipamiento de Agentes.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-05/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-13-04",
    category: "patch",
    publishedAt: "2026-08-18T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 13.04 do VALORANT", en: "VALORANT Patch Notes 13.04", es: "Notas de la versión 13.04 de VALORANT" },
    summary: {
      "pt-BR": "Abyss entrou na rotação Competitiva e Breeze saiu, além de correções de Agentes e armas corpo a corpo transformáveis.",
      en: "Abyss entered the Competitive rotation while Breeze left, alongside Agent and transforming-melee bug fixes.",
      es: "Abyss entró en la rotación Competitiva y Breeze salió, junto con correcciones de Agentes y melees transformables.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-04/",
    sourceLabel: "Riot Games",
  },
  {
    id: "aeris-skin-reveal",
    category: "media",
    publishedAt: "2026-08-17T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Aeris — trailer de revelação de skins", en: "PLAY YOUR HAND — Aeris Skin Reveal Trailer", es: "Aeris — tráiler de presentación de skins" },
    summary: {
      "pt-BR": "A Riot revelou oficialmente a linha Aeris e sua estética inspirada em cartas e floreios mágicos.",
      en: "Riot officially revealed the Aeris skin line and its card-magic visual identity.",
      es: "Riot reveló oficialmente la línea Aeris y su estética inspirada en cartas y magia.",
    },
    url: "https://www.youtube.com/watch?v=PoogGcJjsFU",
    sourceLabel: "VALORANT · YouTube",
  },
  {
    id: "patch-13-02",
    category: "patch",
    publishedAt: "2026-07-28T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 13.02 do VALORANT", en: "VALORANT Patch Notes 13.02", es: "Notas de la versión 13.02 de VALORANT" },
    summary: {
      "pt-BR": "Mudança na Ultimate do Phoenix, Split, Corrode e Lotus adicionados ao Retake e diversas correções de Agentes.",
      en: "Phoenix ultimate adjustment, Split, Corrode and Lotus added to Retake, plus multiple Agent fixes.",
      es: "Cambio en la definitiva de Phoenix, Split, Corrode y Lotus añadidos a Retake y varias correcciones de Agentes.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-02/",
    sourceLabel: "Riot Games",
  },
  {
    id: "neo-frontier-2026",
    category: "media",
    publishedAt: "2026-07-27T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Neo Oeste retorna ao VALORANT", en: "Neo Frontier returns", es: "Neo Frontier regresa a VALORANT" },
    summary: {
      "pt-BR": "A linha retornou com Vandal, Shorty e uma nova arma corpo a corpo Laço.",
      en: "The line returned with the Vandal, Shorty and a new Lasso melee.",
      es: "La línea regresó con Vandal, Shorty y un nuevo melee Lasso.",
    },
    url: "https://www.youtube.com/watch?v=iYfYrsd09lo",
    sourceLabel: "VALORANT · YouTube",
  },
  {
    id: "patch-13-01",
    category: "patch",
    publishedAt: "2026-07-14T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 13.01 do VALORANT", en: "VALORANT Patch Notes 13.01", es: "Notas de la versión 13.01 de VALORANT" },
    summary: {
      "pt-BR": "Ajustes de Iso, Yoru e Outlaw, além de medidas contra manipulação de ranque.",
      en: "Iso, Yoru and Outlaw adjustments plus measures against rank manipulation.",
      es: "Ajustes de Iso, Yoru y Outlaw, además de medidas contra la manipulación de rango.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-01/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-13-00",
    category: "patch",
    publishedAt: "2026-06-23T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 13.00 — início do Ato 4", en: "VALORANT Patch Notes 13.00 — Act 4", es: "Notas 13.00 — inicio del Acto 4" },
    summary: {
      "pt-BR": "Buffs de Sentinelas, ajustes de Iniciadores, Summit na rotação Competitiva, mudanças no RR e várias novidades de sistema.",
      en: "Sentinel buffs, Initiator adjustments, Summit in Competitive rotation, RR changes and multiple systems updates.",
      es: "Mejoras a Centinelas, ajustes de Iniciadores, Summit en Competitivo, cambios de RR y varias novedades de sistema.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-12-11",
    category: "patch",
    publishedAt: "2026-06-09T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 12.11 do VALORANT", en: "VALORANT Patch Notes 12.11", es: "Notas de la versión 12.11 de VALORANT" },
    summary: {
      "pt-BR": "Última atualização do Ato 3, lançamento do My VALORANT Card, correções e mudanças no Premier.",
      en: "The final Act 3 patch, launch of My VALORANT Card, bug fixes and Premier changes.",
      es: "La última actualización del Acto 3, lanzamiento de My VALORANT Card, correcciones y cambios en Premier.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-11/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-12-10",
    category: "patch",
    publishedAt: "2026-05-27T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 12.10 do VALORANT", en: "VALORANT Patch Notes 12.10", es: "Notas de la versión 12.10 de VALORANT" },
    summary: {
      "pt-BR": "Compartilhamento de Replays de amigos, novos mapas de Skirmish e Pick’Ems do Masters London.",
      en: "Friend replay sharing, new Skirmish maps and Masters London Pick’Ems.",
      es: "Replays de amigos, nuevos mapas de Skirmish y Pick’Ems de Masters London.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-10/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-12-09",
    category: "patch",
    publishedAt: "2026-05-12T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 12.09 do VALORANT", en: "VALORANT Patch Notes 12.09", es: "Notas de la versión 12.09 de VALORANT" },
    summary: {
      "pt-BR": "Nerfs de Neon e escopetas, testes de MMR e uma grande rodada de correções.",
      en: "Neon and shotgun nerfs, MMR testing and a large batch of fixes.",
      es: "Nerfs a Neon y escopetas, pruebas de MMR y una gran tanda de correcciones.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-12-08",
    category: "patch",
    publishedAt: "2026-04-28T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 12.08 do VALORANT", en: "VALORANT Patch Notes 12.08", es: "Notas de la versión 12.08 de VALORANT" },
    summary: {
      "pt-BR": "Introdução de Skirmish: Ascension, nova rotação de mapas e retorno do Premier.",
      en: "Introduction of Skirmish: Ascension, a new map rotation and Premier's return.",
      es: "Introducción de Skirmish: Ascension, nueva rotación de mapas y regreso de Premier.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-08/",
    sourceLabel: "Riot Games",
  },
  {
    id: "patch-12-07",
    category: "patch",
    publishedAt: "2026-04-14T13:00:00.000Z",
    official: true,
    title: { "pt-BR": "Atualização 12.07 do VALORANT", en: "VALORANT Patch Notes 12.07", es: "Notas de la versión 12.07 de VALORANT" },
    summary: {
      "pt-BR": "Parceria com Discord, página de Configurações reformulada e outras melhorias do jogo.",
      en: "Discord partnership, a revamped Settings page and other game improvements.",
      es: "Colaboración con Discord, página de Ajustes renovada y otras mejoras del juego.",
    },
    url: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-07/",
    sourceLabel: "Riot Games",
  },
];
