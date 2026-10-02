import type { AppLocale as Locale } from "@/i18n/translations";
import type { GameModuleKey } from "@/config/games";

export type FeaturedContentOrigin = "official" | "community";

export type FeaturedContentItem = {
  id: string;
  type: "guide" | "build" | "lineup" | "collection";
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  origin: FeaturedContentOrigin;
  authorLabel: Record<Locale, string>;
  module: GameModuleKey;
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
      "pt-BR":
        "Dark Souls Remastered leva o jogador de volta a Lordran, um reino interligado em decadência onde exploração, observação e domínio do combate importam tanto quanto os atributos do personagem. A remasterização reúne o jogo base e Artorias of the Abyss, preservando a estrutura que tornou Dark Souls referência em level design, progressão por risco e recompensa e narrativa ambiental.",
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
          "pt-BR":
            "Atributos, soft caps, scaling, duas mãos e como começar a estruturar uma build.",
          en: "Stats, soft caps, scaling, two-handing and how to start structuring a build.",
          es: "Atributos, soft caps, escalado, uso a dos manos y cómo empezar a estructurar una build.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "ÍMPAR Editorial", en: "ÍMPAR Editorial", es: "ÍMPAR Editorial" },
        module: "guides",
      },
    ],
  },
  "dark-souls-iii": {
    synopsis: {
      "pt-BR":
        "Dark Souls III encerra a trilogia principal em Lothric, misturando exploração interligada, combate mais veloz e um dos elencos de chefes mais lembrados da série. O hub do ÍMPAR mantém Ashes of Ariandel e The Ringed City como DLCs do mesmo jogo, preservando builds, progresso e comunidade em um único lugar.",
      en: "Dark Souls III closes the main trilogy in Lothric, combining interconnected exploration, faster combat and one of the series' most memorable boss rosters. ÍMPAR keeps Ashes of Ariandel and The Ringed City as DLC inside the same game hub.",
      es: "Dark Souls III cierra la trilogía principal en Lothric, combinando exploración interconectada, combate más rápido y uno de los elencos de jefes más memorables de la serie. ÍMPAR mantiene Ashes of Ariandel y The Ringed City como DLC dentro del mismo hub.",
    },
    release: { "pt-BR": "12 abr 2016", en: "Apr 12, 2016", es: "12 abr 2016" },
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment",
    latestVersion: "1.15.2",
    featured: [],
  },
  "elden-ring": {
    synopsis: {
      "pt-BR":
        "Elden Ring leva a fórmula de RPG de ação da FromSoftware para as Terras Intermédias, com exploração aberta, masmorras, chefes e enorme liberdade de build. No ÍMPAR, Shadow of the Erdtree permanece ligado ao jogo base como expansão, para que perfil, guias e comunidade não sejam fragmentados artificialmente.",
      en: "Elden Ring takes FromSoftware's action-RPG formula to the Lands Between with open exploration, dungeons, bosses and broad build freedom. On ÍMPAR, Shadow of the Erdtree remains attached to the base game as an expansion so profiles, guides and community are not artificially fragmented.",
      es: "Elden Ring lleva la fórmula de RPG de acción de FromSoftware a las Tierras Intermedias con exploración abierta, mazmorras, jefes y gran libertad de builds. En ÍMPAR, Shadow of the Erdtree permanece unido al juego base como expansión.",
    },
    release: { "pt-BR": "25 fev 2022", en: "Feb 25, 2022", es: "25 feb 2022" },
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment · FromSoftware",
    latestVersion: "1.17 · base game (2026)",
    featured: [],
  },
  "elden-ring-nightreign": {
    synopsis: {
      "pt-BR":
        "Elden Ring Nightreign é um jogo standalone, não uma DLC do Elden Ring base. A experiência gira em torno de runs cooperativas, Nightfarers e encontros com Nightlords; por isso recebe Game Profile, comunidade e identidade próprias no ÍMPAR, enquanto suas DLCs continuam dentro deste hub.",
      en: "Elden Ring Nightreign is a standalone game rather than DLC for base Elden Ring. Its cooperative runs, Nightfarers and Nightlord encounters justify a separate ÍMPAR Game Profile and community, while Nightreign DLC remains inside this hub.",
      es: "Elden Ring Nightreign es un juego independiente, no un DLC de Elden Ring base. Sus runs cooperativas, Nightfarers y Nightlords justifican un Game Profile y una comunidad propios en ÍMPAR.",
    },
    release: { "pt-BR": "30 mai 2025", en: "May 30, 2025", es: "30 may 2025" },
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment",
    latestVersion: "Live service · 2026",
    featured: [],
  },
  valorant: {
    synopsis: {
      "pt-BR":
        "VALORANT é um FPS tático 5v5 baseado em rodadas que combina precisão de armas, economia e habilidades de Agentes. Cada rodada coloca ataque e defesa em disputa por espaço, informação e tempo; utilitários podem redesenhar ângulos, bloquear visão, revelar posições e abrir execuções, mas tiro, decisão e coordenação continuam no centro da partida.",
      en: "VALORANT is a round-based 5v5 tactical FPS combining precise gunplay, economy and Agent abilities. Each round is a contest for space, information and time; utility can reshape angles, block vision, reveal positions and enable executes, while aim, decisions and coordination remain at the center of every match.",
      es: "VALORANT es un FPS táctico 5v5 por rondas que combina precisión de armas, economía y habilidades de Agentes. Cada ronda disputa espacio, información y tiempo; las utilidades pueden cambiar ángulos, bloquear visión, revelar posiciones y habilitar ejecuciones, pero la puntería, las decisiones y la coordinación siguen en el centro de cada partida.",
    },
    release: {
      "pt-BR":
        "02 jun 2020 (PC) · console oficial em 2024 (PS5/Xbox Series X|S, regiões selecionadas)",
      en: "Jun 2, 2020 (PC) · official console release in 2024 (PS5/Xbox Series X|S, selected regions)",
      es: "2 jun 2020 (PC) · lanzamiento oficial en consola en 2024 (PS5/Xbox Series X|S, regiones seleccionadas)",
    },
    developer: "Riot Games",
    publisher: "Riot Games",
    latestVersion: "13.06 · 22 set 2026",
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
        title: {
          "pt-BR": "Enciclopédia de Agentes",
          en: "Agent encyclopedia",
          es: "Enciclopedia de Agentes",
        },
        description: {
          "pt-BR": "Funções, descrições e kit completo de habilidades do elenco jogável.",
          en: "Roles, descriptions and complete ability kits for the playable roster.",
          es: "Roles, descripciones y kit completo de habilidades del plantel jugable.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "ÍMPAR · v0.1.3A", en: "ÍMPAR · v0.1.3A", es: "ÍMPAR · v0.1.3A" },
        module: "agents",
      },
      {
        id: "valorant-maps-013a",
        type: "collection",
        title: {
          "pt-BR": "Atlas tático de mapas",
          en: "Tactical map atlas",
          es: "Atlas táctico de mapas",
        },
        description: {
          "pt-BR": "Mapas padrão, minimapas, identidade tática e rotação competitiva marcada.",
          en: "Standard maps, minimaps, tactical identity and marked competitive rotation.",
          es: "Mapas estándar, minimapas, identidad táctica y rotación competitiva marcada.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "ÍMPAR · v0.1.3A", en: "ÍMPAR · v0.1.3A", es: "ÍMPAR · v0.1.3A" },
        module: "maps",
      },
    ],
  },
  warframe: {
    synopsis: {
      "pt-BR":
        "Warframe combina combate cooperativo veloz, movimentação acrobática e uma progressão extensa baseada em Warframes, armas, Mods e atividades espalhadas pelo Sistema de Origem. O hub do ÍMPAR começa pela enciclopédia de Warframes e por guias editoriais, com espaço preparado para builds, arsenal e novidades.",
      en: "Warframe combines fast cooperative combat, acrobatic movement and deep progression across Warframes, weapons, Mods and activities throughout the Origin System. ÍMPAR starts this hub with a Warframe encyclopedia and editorial guides, with builds, arsenal and news prepared to expand next.",
      es: "Warframe combina combate cooperativo veloz, movimiento acrobático y una progresión amplia basada en Warframes, armas, Mods y actividades del Sistema Origen. El hub de ÍMPAR comienza con una enciclopedia de Warframes y guías editoriales, preparado para builds, arsenal y novedades.",
    },
    release: {
      "pt-BR": "25 mar 2013 (PC) · expansão contínua como live service",
      en: "Mar 25, 2013 (PC) · continuously expanded as a live service",
      es: "25 mar 2013 (PC) · expansión continua como servicio en vivo",
    },
    developer: "Digital Extremes",
    publisher: "Digital Extremes",
    latestVersion: "Live service · 2026",
    featured: [
      {
        id: "warframe-roster-foundation",
        type: "collection",
        title: {
          "pt-BR": "Enciclopédia de Warframes",
          en: "Warframe encyclopedia",
          es: "Enciclopedia de Warframes",
        },
        description: {
          "pt-BR":
            "Primeira leva com Garuda, Grendel e Nekros, habilidades, funções e estrutura pronta para mídia.",
          en: "First roster batch with Garuda, Grendel and Nekros, abilities, roles and a media-ready structure.",
          es: "Primera tanda con Garuda, Grendel y Nekros, habilidades, roles y estructura preparada para multimedia.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "ÍMPAR Editorial", en: "ÍMPAR Editorial", es: "ÍMPAR Editorial" },
        module: "warframes",
      },
      {
        id: "warframe-guides-foundation",
        type: "guide",
        title: {
          "pt-BR": "Central de guias do Tenno",
          en: "Tenno guide center",
          es: "Centro de guías Tenno",
        },
        description: {
          "pt-BR":
            "Estrutura inicial para retorno ao jogo, Mods, dano/status, progressão e farming.",
          en: "Initial structure for returning players, Mods, damage/status, progression and farming.",
          es: "Estructura inicial para regreso al juego, Mods, daño/estado, progresión y farming.",
        },
        origin: "official",
        authorLabel: { "pt-BR": "ÍMPAR Editorial", en: "ÍMPAR Editorial", es: "ÍMPAR Editorial" },
        module: "guides",
      },
    ],
  },
  "league-of-legends": {
    synopsis: {
      "pt-BR":
        "League of Legends é o MOBA 5v5 da Riot Games em que duas equipes escolhem campeões, disputam rotas e objetivos e tentam destruir o Nexus adversário. O hub do ÍMPAR nasce preparado para campeões, mapas, itens, skins, competitivo e futura conexão de conta via serviços aprovados pela Riot.",
      en: "League of Legends is Riot Games' 5v5 MOBA where two teams choose champions, contest lanes and objectives and attempt to destroy the enemy Nexus. ÍMPAR's hub is prepared for champions, maps, items, skins, competitive play and future account linking through Riot-approved services.",
      es: "League of Legends es el MOBA 5v5 de Riot Games donde dos equipos eligen campeones, disputan líneas y objetivos e intentan destruir el Nexus enemigo. El hub de ÍMPAR queda preparado para campeones, mapas, objetos, skins, competitivo y futura conexión de cuenta.",
    },
    release: { "pt-BR": "27 out 2009", en: "Oct 27, 2009", es: "27 oct 2009" },
    developer: "Riot Games",
    publisher: "Riot Games",
    latestVersion: "Patch 26.19 · 22 set 2026",
    featured: [],
  },
  "ea-sports-fc": {
    synopsis: {
      "pt-BR":
        "EA SPORTS FC é tratado pelo ÍMPAR como um hub permanente da série anual de futebol da EA. Em vez de quebrar o histórico do usuário todo ano, edição, temporada e modo podem evoluir dentro do mesmo perfil. A edição ativa no momento desta fundação é FC 26, enquanto FC 27 já está no ciclo de lançamento de 2026.",
      en: "ÍMPAR treats EA SPORTS FC as a permanent hub for EA's annual football series. Rather than breaking a user's history every year, edition, season and mode can evolve inside the same profile. FC 26 is the active edition at this foundation point, while FC 27 is already in the 2026 release cycle.",
      es: "ÍMPAR trata EA SPORTS FC como un hub permanente de la serie anual de fútbol de EA. En lugar de romper el historial del usuario cada año, edición, temporada y modo pueden evolucionar dentro del mismo perfil.",
    },
    release: {
      "pt-BR": "Hub anual · edição FC 26 lançada em 26 set 2025",
      en: "Annual hub · FC 26 released Sep 26, 2025",
      es: "Hub anual · FC 26 lanzado el 26 sep 2025",
    },
    developer: "EA Sports",
    publisher: "Electronic Arts",
    latestVersion: "FC 26 · live service",
    featured: [],
  },
};
