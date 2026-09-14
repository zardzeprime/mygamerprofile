export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  en: "English",
};

const ptBR = {
  "brand.name": "MGP",
  "brand.full": "My Gamer Profile",
  "brand.tagline": "Sua identidade nos jogos.",

  "navigation.home": "Início",
  "navigation.games": "Jogos",
  "navigation.communities": "Comunidades",
  "navigation.lfg": "LFG",
  "navigation.menu": "Menu",
  "navigation.openMenu": "Abrir menu",
  "navigation.closeMenu": "Fechar menu",

  "auth.login": "Entrar",
  "auth.register": "Criar perfil",
  "auth.logout": "Sair",
  "auth.forgotPassword": "Esqueci minha senha",

  "home.hero.title": "Sua identidade nos jogos.",
  "home.hero.subtitle":
    "O MGP reúne seu perfil, seus jogos, suas conquistas e sua comunidade em um só lugar.",
  "home.cta.createProfile": "Criar perfil",
  "home.cta.login": "Entrar",
  "home.cta.exploreGames": "Explorar jogos",
  "home.cta.myProfile": "Ver meu perfil",
  "home.cta.createPost": "Criar post",
  "home.featured.title": "Jogos em destaque",
  "home.activity.title": "Atividade da comunidade",
  "home.activity.empty": "Nenhum post ainda. Seja o primeiro a publicar.",
  "home.discover.title": "Descubra o MGP",
  "home.discover.profiles.title": "Game Profiles",
  "home.discover.profiles.body":
    "Monte um perfil por jogo com suas armas, builds, mapas e notas pessoais.",
  "home.discover.communities.title": "Comunidades",
  "home.discover.communities.body":
    "Cada jogo tem seu hub com posts, guias e pessoas que jogam o que você joga.",
  "home.discover.lfg.title": "LFG",
  "home.discover.lfg.body": "Encontre grupo por jogo, plataforma, região e idioma.",

  "games.title": "Catálogo de jogos",
  "games.subtitle": "Os jogos oficialmente suportados pelo MGP nesta versão.",
  "games.search": "Buscar jogos",
  "games.hoursPlayed": "Horas jogadas",
  "games.ageRating": "Classificação",
  "games.openHub": "Abrir hub",
  "games.empty": "Nenhum jogo encontrado.",

  "profile.follow": "Seguir",
  "profile.unfollow": "Deixar de seguir",
  "profile.followers": "Seguidores",
  "profile.following": "Seguindo",
  "profile.games": "Jogos",
  "profile.editProfile": "Editar perfil",
  "profile.report": "Denunciar",

  "settings.title": "Configurações",
  "settings.profile": "Perfil",
  "settings.account": "Conta",
  "settings.appearance": "Aparência",
  "settings.language": "Idioma",
  "settings.theme": "Tema",

  "theme.light": "Claro",
  "theme.dark": "Escuro",
  "theme.system": "Sistema",

  "dataSource.verified": "Verificado",
  "dataSource.player_provided": "Informado pelo jogador",
  "dataSource.mock": "Demonstração",
  "dataSource.unavailable": "Indisponível",

  "common.search": "Buscar",
  "common.loading": "Carregando…",
  "common.comingSoon": "Em breve",
  "common.save": "Salvar",
  "common.cancel": "Cancelar",
  "common.retry": "Tentar novamente",
  "common.error": "Algo deu errado.",
} satisfies Record<string, string>;

export type TranslationKey = keyof typeof ptBR;

const en: Record<TranslationKey, string> = {
  "brand.name": "MGP",
  "brand.full": "My Gamer Profile",
  "brand.tagline": "Your identity across games.",

  "navigation.home": "Home",
  "navigation.games": "Games",
  "navigation.communities": "Communities",
  "navigation.lfg": "LFG",
  "navigation.menu": "Menu",
  "navigation.openMenu": "Open menu",
  "navigation.closeMenu": "Close menu",

  "auth.login": "Sign in",
  "auth.register": "Create profile",
  "auth.logout": "Sign out",
  "auth.forgotPassword": "Forgot password",

  "home.hero.title": "Your identity across games.",
  "home.hero.subtitle":
    "MGP brings your profile, your games, your achievements and your community together.",
  "home.cta.createProfile": "Create profile",
  "home.cta.login": "Sign in",
  "home.cta.exploreGames": "Explore games",
  "home.cta.myProfile": "View my profile",
  "home.cta.createPost": "Create post",
  "home.featured.title": "Featured games",
  "home.activity.title": "Community activity",
  "home.activity.empty": "No posts yet. Be the first to publish.",
  "home.discover.title": "Discover MGP",
  "home.discover.profiles.title": "Game Profiles",
  "home.discover.profiles.body":
    "Build a profile per game with your weapons, builds, maps and personal notes.",
  "home.discover.communities.title": "Communities",
  "home.discover.communities.body":
    "Every game has a hub with posts, guides and people who play what you play.",
  "home.discover.lfg.title": "LFG",
  "home.discover.lfg.body": "Find a group by game, platform, region and language.",

  "games.title": "Game catalog",
  "games.subtitle": "Games officially supported by MGP in this version.",
  "games.search": "Search games",
  "games.hoursPlayed": "Hours played",
  "games.ageRating": "Age rating",
  "games.openHub": "Open hub",
  "games.empty": "No games found.",

  "profile.follow": "Follow",
  "profile.unfollow": "Unfollow",
  "profile.followers": "Followers",
  "profile.following": "Following",
  "profile.games": "Games",
  "profile.editProfile": "Edit profile",
  "profile.report": "Report",

  "settings.title": "Settings",
  "settings.profile": "Profile",
  "settings.account": "Account",
  "settings.appearance": "Appearance",
  "settings.language": "Language",
  "settings.theme": "Theme",

  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",

  "dataSource.verified": "Verified",
  "dataSource.player_provided": "Player provided",
  "dataSource.mock": "Demo data",
  "dataSource.unavailable": "Unavailable",

  "common.search": "Search",
  "common.loading": "Loading…",
  "common.comingSoon": "Coming soon",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Try again",
  "common.error": "Something went wrong.",
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": ptBR,
  en,
};
