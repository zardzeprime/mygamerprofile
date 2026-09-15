import type { AppLocale as Locale } from "@/i18n/translations";

export type CommunityStarterPost = {
  id: string;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  prompt: Record<Locale, string>;
  audience: "general" | "teen" | "mature";
};

export const COMMUNITY_STARTER_POSTS: Record<string, CommunityStarterPost> = {
  "dark-souls-remastered": {
    id: "welcome-dark-souls-remastered",
    title: { "pt-BR": "Bem-vindo à fogueira de Dark Souls Remastered", en: "Welcome to the Dark Souls Remastered bonfire", es: "Bienvenido a la hoguera de Dark Souls Remastered" },
    body: {
      "pt-BR": "Este é o espaço social de Lordran dentro do MGP. A ideia é reunir builds, descobertas, desafios, lore, chefes e histórias de run sem transformar a comunidade em uma lista de respostas prontas. Marque spoilers quando necessário e ajude quem está chegando sem tirar a graça da descoberta.",
      en: "This is Lordran's social space inside MGP. The goal is to bring together builds, discoveries, challenges, lore, bosses and run stories without turning the community into a list of canned answers. Mark spoilers when needed and help newcomers without taking discovery away from them.",
      es: "Este es el espacio social de Lordran dentro de MGP. La idea es reunir builds, descubrimientos, desafíos, lore, jefes e historias de runs sin convertir la comunidad en una lista de respuestas prefabricadas. Marca spoilers cuando sea necesario.",
    },
    prompt: { "pt-BR": "Qual foi o momento em que Dark Souls finalmente 'clicou' para você?", en: "What was the moment Dark Souls finally clicked for you?", es: "¿En qué momento Dark Souls finalmente hizo clic para ti?" },
    audience: "teen",
  },
  "dark-souls-iii": {
    id: "welcome-dark-souls-iii",
    title: { "pt-BR": "As cinzas chegaram ao MGP", en: "The ash has reached MGP", es: "Las cenizas llegaron a MGP" },
    body: {
      "pt-BR": "A comunidade de Dark Souls III nasce para builds, bosses, PvE, PvP, lore e as duas DLCs — Ashes of Ariandel e The Ringed City — dentro do mesmo espaço. Conteúdo de DLC pode receber aviso de spoiler, mas não será fragmentado em uma comunidade separada.",
      en: "The Dark Souls III community is built for builds, bosses, PvE, PvP, lore and both DLCs — Ashes of Ariandel and The Ringed City — inside one space. DLC content may carry spoiler warnings, but it will not be split into a separate community.",
      es: "La comunidad de Dark Souls III nace para builds, jefes, PvE, PvP, lore y ambos DLC — Ashes of Ariandel y The Ringed City — dentro del mismo espacio.",
    },
    prompt: { "pt-BR": "Seu chefe favorito de DS3 é qual — e por quê?", en: "Who is your favorite DS3 boss — and why?", es: "¿Cuál es tu jefe favorito de DS3 y por qué?" },
    audience: "teen",
  },
  "elden-ring": {
    id: "welcome-elden-ring",
    title: { "pt-BR": "Maculados, este é o hub social de Elden Ring", en: "Tarnished, this is Elden Ring's social hub", es: "Sinluz, este es el hub social de Elden Ring" },
    body: {
      "pt-BR": "Elden Ring e Shadow of the Erdtree compartilham esta comunidade. Aqui entram builds, armas, magia, exploração, chefes, lore e descobertas das Terras Intermédias. Shadow of the Erdtree é expansão do jogo base no MGP; Nightreign, por ser standalone, tem comunidade própria.",
      en: "Elden Ring and Shadow of the Erdtree share this community. Builds, weapons, magic, exploration, bosses, lore and Lands Between discoveries belong here. Shadow of the Erdtree is an expansion of the base game on MGP; Nightreign has its own community because it is standalone.",
      es: "Elden Ring y Shadow of the Erdtree comparten esta comunidad. Aquí entran builds, armas, magia, exploración, jefes, lore y descubrimientos de las Tierras Intermedias. Nightreign, al ser independiente, tiene su propia comunidad.",
    },
    prompt: { "pt-BR": "Qual build você levaria para uma nova run hoje?", en: "What build would you take into a fresh run today?", es: "¿Qué build llevarías a una nueva run hoy?" },
    audience: "teen",
  },
  "elden-ring-nightreign": {
    id: "welcome-elden-ring-nightreign",
    title: { "pt-BR": "Nightfarers, formem o grupo", en: "Nightfarers, form your group", es: "Nightfarers, formen el grupo" },
    body: {
      "pt-BR": "Nightreign ganhou uma comunidade própria porque é uma experiência standalone. Este espaço é para Nightfarers, composições, rotas de run, relíquias, Nightlords, coop e LFG. DLCs de Nightreign continuam aqui, no mesmo hub do jogo.",
      en: "Nightreign gets its own community because it is a standalone experience. This space is for Nightfarers, compositions, run routing, relics, Nightlords, co-op and LFG. Nightreign DLC remains inside this game's hub.",
      es: "Nightreign tiene su propia comunidad porque es una experiencia independiente. Este espacio es para Nightfarers, composiciones, rutas de run, reliquias, Nightlords, cooperativo y LFG.",
    },
    prompt: { "pt-BR": "Qual Nightfarer melhor combina com seu estilo?", en: "Which Nightfarer best fits your style?", es: "¿Qué Nightfarer encaja mejor con tu estilo?" },
    audience: "teen",
  },
  valorant: {
    id: "welcome-valorant",
    title: { "pt-BR": "Bem-vindo à comunidade VALORANT do MGP", en: "Welcome to MGP's VALORANT community", es: "Bienvenido a la comunidad VALORANT de MGP" },
    body: {
      "pt-BR": "Este espaço é para conversar sobre agentes, mapas, lineups, skins, competitivo, esports e evolução individual sem transformar rank em régua de valor pessoal. Dados oficiais de conta só serão tratados como verificados quando vierem de uma integração Riot aprovada; até lá, rank preenchido no perfil é declarado pelo próprio usuário.",
      en: "This space is for agents, maps, lineups, skins, competitive play, esports and individual improvement without turning rank into a measure of personal worth. Account data will only be treated as verified when it comes from an approved Riot integration; until then, profile rank is user-declared.",
      es: "Este espacio es para agentes, mapas, lineups, skins, competitivo, esports y mejora individual sin convertir el rango en una medida del valor personal. Los datos de cuenta solo serán verificados cuando provengan de una integración Riot aprobada.",
    },
    prompt: { "pt-BR": "Qual agente você mais gosta de jogar e o que te prende nele?", en: "Which agent do you enjoy playing most, and what keeps you on them?", es: "¿Qué agente disfrutas más y qué te hace seguir jugándolo?" },
    audience: "general",
  },
  "league-of-legends": {
    id: "welcome-league-of-legends",
    title: { "pt-BR": "O Rift abriu no MGP", en: "The Rift is open on MGP", es: "La Grieta abrió en MGP" },
    body: {
      "pt-BR": "A comunidade de League of Legends começa com espaço para campeões, rotas, itens, patches, skins, competitivo e esports. A futura conexão de conta seguirá os serviços e permissões aprovados pela Riot; o objetivo é complementar a experiência do jogador, não criar MMR paralelo nem ferramentas que prejudiquem a integridade competitiva.",
      en: "The League of Legends community starts with room for champions, roles, items, patches, skins, competitive play and esports. Future account linking will follow Riot-approved services and permissions; the goal is to complement player experience, not create parallel MMR or tools that harm competitive integrity.",
      es: "La comunidad de League of Legends comienza con espacio para campeones, roles, objetos, parches, skins, competitivo y esports. La futura conexión de cuenta seguirá servicios y permisos aprobados por Riot.",
    },
    prompt: { "pt-BR": "Qual campeão você poderia jogar por 100 partidas sem cansar?", en: "Which champion could you play for 100 games without getting bored?", es: "¿Qué campeón podrías jugar durante 100 partidas sin cansarte?" },
    audience: "general",
  },
  "ea-sports-fc": {
    id: "welcome-ea-sports-fc",
    title: { "pt-BR": "EA SPORTS FC entra em campo no MGP", en: "EA SPORTS FC takes the pitch on MGP", es: "EA SPORTS FC entra al campo en MGP" },
    body: {
      "pt-BR": "Esta comunidade é permanente para a série EA SPORTS FC: Ultimate Team, Clubs, Carreira, Seasons e competitivo podem coexistir mesmo quando a edição anual muda. Hoje o perfil é manual; qualquer futura importação de conta EA depende de acesso oficial que esteja realmente disponível para o MGP.",
      en: "This is a permanent community for the EA SPORTS FC series: Ultimate Team, Clubs, Career, Seasons and competitive play can coexist even as the yearly edition changes. Profiles are manual today; any future EA account import depends on official access actually being available to MGP.",
      es: "Esta comunidad es permanente para la serie EA SPORTS FC: Ultimate Team, Clubs, Carrera, Seasons y competitivo pueden coexistir aunque cambie la edición anual. El perfil es manual por ahora.",
    },
    prompt: { "pt-BR": "Qual modo do FC mais representa você: UT, Clubs ou Carreira?", en: "Which FC mode feels most like you: UT, Clubs or Career?", es: "¿Qué modo de FC te representa más: UT, Clubs o Carrera?" },
    audience: "general",
  },
};
