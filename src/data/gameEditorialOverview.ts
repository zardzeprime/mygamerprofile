import type { AppLocale as Locale } from "@/i18n/translations";

export type FeaturedContentOrigin = "official" | "community";

export type FeaturedContentItem = {
  id: string;
  type: "guide" | "build";
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  origin: FeaturedContentOrigin;
  authorLabel: Record<Locale, string>;
  module: "guides" | "builds";
};

export type GameEditorialOverview = {
  synopsis: Record<Locale, string>;
  release: Record<Locale, string>;
  developer: string;
  publisher: string;
  latestUpdate: Record<Locale, string>;
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
      "pt-BR":
        "Dark Souls Remastered leva o jogador de volta a Lordran, um reino interligado em decadência onde exploração, observação e domínio do combate importam tanto quanto os atributos do personagem. A remasterização reúne o jogo base e Artorias of the Abyss, preservando a estrutura que tornou Dark Souls referência em level design, progressão por risco e recompensa e narrativa ambiental.",
      en:
        "Dark Souls Remastered returns players to Lordran, an interconnected kingdom in decay where exploration, observation and combat mastery matter as much as character stats. The remaster includes the base game and Artorias of the Abyss while preserving the structure that made Dark Souls a reference point for level design, risk-and-reward progression and environmental storytelling.",
      es:
        "Dark Souls Remastered devuelve al jugador a Lordran, un reino interconectado en decadencia donde la exploración, la observación y el dominio del combate importan tanto como los atributos del personaje. La remasterización incluye el juego base y Artorias of the Abyss, conservando la estructura que convirtió a Dark Souls en una referencia de diseño de niveles, progreso de riesgo y recompensa y narrativa ambiental.",
    },
    release: {
      "pt-BR": "23 mai 2018 (PC) · 25 mai 2018 (PS4/Xbox One) · 19 out 2018 (Switch)",
      en: "May 23, 2018 (PC) · May 25, 2018 (PS4/Xbox One) · Oct 19, 2018 (Switch)",
      es: "23 may 2018 (PC) · 25 may 2018 (PS4/Xbox One) · 19 oct 2018 (Switch)",
    },
    developer: "FromSoftware · QLOC (remaster)",
    publisher: "Bandai Namco Entertainment · FromSoftware",
    latestUpdate: {
      "pt-BR": "09 nov 2022 · recursos online da versão de PC reativados",
      en: "Nov 9, 2022 · PC online features reactivated",
      es: "9 nov 2022 · funciones online de PC reactivadas",
    },
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
        authorLabel: {
          "pt-BR": "MGP Editorial",
          en: "MGP Editorial",
          es: "MGP Editorial",
        },
        module: "guides",
      },
    ],
  },
};
