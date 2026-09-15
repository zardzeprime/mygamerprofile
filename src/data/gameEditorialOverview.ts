import type { AppLocale as Locale } from "@/i18n/translations";

export type FeaturedContentOrigin = "official" | "community";

export type FeaturedContentItem = {
  id: string;
  type: "guide" | "build" | "lineup" | "collection";
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  origin: FeaturedContentOrigin;
  authorLabel: Record<Locale, string>;
  module: "guides" | "builds" | "agents" | "maps" | "weapons" | "lineups";
};

export type GameEditorialOverview = {
  synopsis: Record<Locale, string>;
  release: Record<Locale, string>;
  developer: string;
  publisher: string;
  latestVersion: string;
  score?: {
    value: number;
    sourceLabel: string;
    note: Record<Locale, string>;
  };
  featured: FeaturedContentItem[];
};

export const GAME_EDITORIAL_OVERVIEW: Record<string, GameEditorialOverview | undefined> = {
  "dark-souls-remastered": {
    synopsis: {
      "pt-BR": "Dark Souls Remastered leva o jogador de volta a Lordran, um reino interligado em decadência onde exploração, observação e domínio do combate importam tanto quanto os atributos do personagem. A remasterização reúne o jogo base e Artorias of the Abyss, preservando a estrutura que tornou Dark Souls referência em level design, progressão por risco e recompensa e narrativa ambiental.",
      en: "Dark Souls Remastered returns players to Lordran, an interconnected kingdom in decay where exploration, observation and combat mastery matter as much as character stats. The remaster includes the base game and Artorias of the Abyss while preserving the structure that made Dark Souls a reference point for level design, risk-and-reward progression and environmental storytelling.",
      es: "Dark Souls Remastered devuelve al jugador a Lordran, un reino interconectado en decadencia donde la exploración, la observación y el dominio del combate importan tanto como los atributos del personaje. La remasterización incluye el juego base y Artorias of the Abyss, conservando la estructura que convirtió a Dark Souls en una referencia de diseño de niveles, progreso de riesgo y recompensa y narrativa ambiental.",
    },
    release: {
      "pt-BR": "23 mai 2018 (PC) · 25 mai 2018 (PS4/Xbox One) · 19 out 2018 (Switch)",
      en: "May 23, 2018 (PC) · May 25, 2018 (PS4/Xbox One) · Oct 19, 2018 (Switch)",
      es: "23 may 2018 (PC) · 25 may 2018 (PS4/Xbox One) · 19 oct 2018 (Switch)",
    },
    developer: "FromSoftware · QLOC (remaster)",
    publisher: "Bandai Namco Entertainment · FromSoftware",
    latestVersion: "1.03",
    score: {
      value: 8.4,
      sourceLabel: "Metacritic 84 · OpenCritic 84",
      note: {
        "pt-BR": "Média de referência da crítica, normalizada para 0–10.",
        en: "Reference critic average normalized to a 0–10 scale.",
        es: "Promedio de referencia de la crítica normalizado a una escala de 0–10.",
      },
    },
    featured: [
      {
        id: "guide-01-stats",
        type: "guide",
        title: {
          "pt-BR": "Guia 01 — Stats: tudo que você precisa saber",
          en: "Guide 01 — Stats: everything you need to know",
          es: "Guía 01 — Stats: todo lo que necesitas saber",
        },
        description: {
          "pt-BR": "Atributos, soft caps, scaling, duas mãos e como começar a estruturar uma build.",
          en: "Stats, soft caps, scaling, two-handing and how to start structuring a build.",
          es: "Atributos, soft caps, escalado, uso a dos manos y cómo empezar a estructurar una build.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "MGP Editorial", en: "MGP Editorial", es: "MGP Editorial" },
        module: "guides",
      },
    ],
  },
  valorant: {
    synopsis: {
      "pt-BR": "VALORANT é um FPS tático 5v5 baseado em rodadas que combina precisão de armas, economia e habilidades de Agentes. Cada rodada coloca ataque e defesa em disputa por espaço, informação e tempo; utilitários podem redesenhar ângulos, bloquear visão, revelar posições e abrir execuções, mas tiro, decisão e coordenação continuam no centro da partida.",
      en: "VALORANT is a round-based 5v5 tactical FPS combining precise gunplay, economy and Agent abilities. Each round is a contest for space, information and time; utility can reshape angles, block vision, reveal positions and enable executes, while aim, decisions and coordination remain at the center of every match.",
      es: "VALORANT es un FPS táctico 5v5 por rondas que combina precisión de armas, economía y habilidades de Agentes. Cada ronda disputa espacio, información y tiempo; las utilidades pueden cambiar ángulos, bloquear visión, revelar posiciones y habilitar ejecuciones, pero la puntería, las decisiones y la coordinación siguen en el centro de cada partida.",
    },
    release: {
      "pt-BR": "02 jun 2020 (PC) · console oficial em 2024 (PS5/Xbox Series X|S, regiões selecionadas)",
      en: "Jun 2, 2020 (PC) · official console release in 2024 (PS5/Xbox Series X|S, selected regions)",
      es: "2 jun 2020 (PC) · lanzamiento oficial en consola en 2024 (PS5/Xbox Series X|S, regiones seleccionadas)",
    },
    developer: "Riot Games",
    publisher: "Riot Games",
    latestVersion: "13.05",
    score: {
      value: 8.1,
      sourceLabel: "Metacritic 80 · OpenCritic 81",
      note: {
        "pt-BR": "Referência da crítica agregada, arredondada para a escala 0–10.",
        en: "Aggregated critic reference, rounded to a 0–10 scale.",
        es: "Referencia agregada de la crítica, redondeada a una escala de 0–10.",
      },
    },
    featured: [
      {
        id: "valorant-agents-013a",
        type: "collection",
        title: { "pt-BR": "Enciclopédia de Agentes", en: "Agent encyclopedia", es: "Enciclopedia de Agentes" },
        description: {
          "pt-BR": "Funções, descrições e kit completo de habilidades do elenco jogável.",
          en: "Roles, descriptions and complete ability kits for the playable roster.",
          es: "Roles, descripciones y kit completo de habilidades del plantel jugable.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "MGP · v0.1.3A", en: "MGP · v0.1.3A", es: "MGP · v0.1.3A" },
        module: "agents",
      },
      {
        id: "valorant-maps-013a",
        type: "collection",
        title: { "pt-BR": "Atlas tático de mapas", en: "Tactical map atlas", es: "Atlas táctico de mapas" },
        description: {
          "pt-BR": "Mapas padrão, minimapas, identidade tática e rotação competitiva marcada.",
          en: "Standard maps, minimaps, tactical identity and marked competitive rotation.",
          es: "Mapas estándar, minimapas, identidad táctica y rotación competitiva marcada.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "MGP · v0.1.3A", en: "MGP · v0.1.3A", es: "MGP · v0.1.3A" },
        module: "maps",
      },
    ],
  },
};
