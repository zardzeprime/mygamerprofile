create table if not exists public.mgp_content_catalog (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  game_slug text,
  module_key text,
  title text not null,
  description text not null default '',
  path text not null,
  keywords text[] not null default '{}'::text[],
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.mgp_content_catalog enable row level security;

create index if not exists mgp_content_catalog_published_idx
  on public.mgp_content_catalog (published, game_slug, module_key);

create index if not exists mgp_content_catalog_keywords_idx
  on public.mgp_content_catalog using gin (keywords);

comment on table public.mgp_content_catalog is
  'Curated inventory of content that is actually implemented and published in MGP. NEXUS may recommend only entries present here.';

insert into public.mgp_content_catalog
  (content_key, game_slug, module_key, title, description, path, keywords, published)
values
  ('valorant-overview', 'valorant', 'overview', 'Hub de VALORANT', 'Visão geral do VALORANT no MG Profile.', '/games/valorant', array['valorant','hub','visão geral','overview'], true),
  ('valorant-agents', 'valorant', 'agents', 'Agentes de VALORANT', 'Enciclopédia de agentes e habilidades disponível na aba Agentes.', '/games/valorant', array['valorant','agente','agentes','habilidade','habilidades','astra','omen','jett','raze','viper','controller','duelist','initiator','sentinel'], true),
  ('valorant-maps', 'valorant', 'maps', 'Mapas de VALORANT', 'Atlas de mapas disponível na aba Mapas.', '/games/valorant', array['valorant','mapa','mapas','ascent','bind','haven','split','sunset','lotus','abyss','breeze'], true),
  ('valorant-weapons', 'valorant', 'weapons', 'Armas de VALORANT', 'Arsenal com informações de armas disponível na aba Armas.', '/games/valorant', array['valorant','arma','armas','vandal','phantom','operator','sheriff','spectre'], true),
  ('valorant-skins', 'valorant', 'skins', 'Skins de VALORANT', 'Coleção de skins disponível na aba Skins.', '/games/valorant', array['valorant','skin','skins','vandal','phantom','faca','knife','bundle'], true),
  ('valorant-news', 'valorant', 'news', 'Notícias e atualizações de VALORANT', 'Arquivo editorial de notícias e atualizações oficiais disponível na aba Novidades.', '/games/valorant', array['valorant','notícia','notícias','news','patch','patch notes','atualização','update'], true),
  ('valorant-competitive', 'valorant', 'competitive', 'Compêndio competitivo de VALORANT', 'Times, elencos e configurações profissionais verificadas disponíveis na aba Competitivo.', '/games/valorant', array['valorant','competitivo','vct','pro','pro player','player','jogador','jogadores','time','times','loud','leviatan','leviatán','mibr','crosshair','sensibilidade','dpi','edpi'], true),
  ('dark-souls-remastered-overview', 'dark-souls-remastered', 'overview', 'Hub de Dark Souls Remastered', 'Visão geral de Dark Souls Remastered no MG Profile.', '/games/dark-souls-remastered', array['dark souls','dark souls remastered','ds1','hub'], true),
  ('dark-souls-remastered-bosses', 'dark-souls-remastered', 'bosses', 'Chefes de Dark Souls Remastered', 'Enciclopédia de chefes disponível na aba Chefes.', '/games/dark-souls-remastered', array['dark souls','ds1','boss','bosses','chefe','chefes','ornstein','smough','artorias','gwyn'], true),
  ('dark-souls-remastered-guides', 'dark-souls-remastered', 'guides', 'Guias de Dark Souls Remastered', 'Guias editoriais disponíveis na aba Guias.', '/games/dark-souls-remastered', array['dark souls','ds1','guia','guias','guide','build'], true),
  ('dark-souls-iii-bosses', 'dark-souls-iii', 'bosses', 'Chefes de Dark Souls III', 'Explorador de chefes de Dark Souls III disponível no hub do jogo.', '/games/dark-souls-iii', array['dark souls 3','dark souls iii','ds3','boss','bosses','chefe','chefes'], true),
  ('dark-souls-iii-guides', 'dark-souls-iii', 'guides', 'Guias de Dark Souls III', 'Guias de Dark Souls III disponíveis no hub do jogo.', '/games/dark-souls-iii', array['dark souls 3','dark souls iii','ds3','guia','guias','guide'], true),
  ('elden-ring-bosses', 'elden-ring', 'bosses', 'Chefes de Elden Ring', 'Explorador de chefes de Elden Ring disponível no hub do jogo.', '/games/elden-ring', array['elden ring','boss','bosses','chefe','chefes'], true),
  ('elden-ring-guides', 'elden-ring', 'guides', 'Guias de Elden Ring', 'Guias de Elden Ring disponíveis no hub do jogo.', '/games/elden-ring', array['elden ring','guia','guias','guide','build'], true),
  ('league-champions', 'league-of-legends', 'champions', 'Campeões de League of Legends', 'Explorador de campeões disponível na aba Campeões.', '/games/league-of-legends', array['league of legends','lol','campeão','campeões','champion','champions'], true),
  ('league-skins', 'league-of-legends', 'skins', 'Skins de League of Legends', 'Coleção de skins de campeões disponível na aba Skins.', '/games/league-of-legends', array['league of legends','lol','skin','skins'], true),
  ('league-items', 'league-of-legends', 'items', 'Itens de League of Legends', 'Biblioteca de itens disponível na aba Itens.', '/games/league-of-legends', array['league of legends','lol','item','itens','items','build'], true),
  ('league-modes', 'league-of-legends', 'modes', 'Modos de League of Legends', 'Explorador de modos disponível na aba Modos.', '/games/league-of-legends', array['league of legends','lol','modo','modos','mode','modes'], true),
  ('league-competitive', 'league-of-legends', 'competitive', 'Compêndio competitivo de League of Legends', 'Área competitiva de League of Legends disponível no MG Profile.', '/games/league-of-legends', array['league of legends','lol','competitivo','esports','pro','time','times'], true)
on conflict (content_key) do update set
  game_slug = excluded.game_slug,
  module_key = excluded.module_key,
  title = excluded.title,
  description = excluded.description,
  path = excluded.path,
  keywords = excluded.keywords,
  published = excluded.published,
  updated_at = now();