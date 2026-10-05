insert into public.mgp_content_catalog
  (content_key, game_slug, module_key, title, description, path, keywords, published)
values
  (
    'league-runes',
    'league-of-legends',
    'runes',
    'Runas de League of Legends',
    'Compêndio de árvores, runas essenciais, runas secundárias e fragmentos de atributos disponível na aba Runas.',
    '/games/league-of-legends',
    array['league of legends','lol','runa','runas','rune','runes','keystone','runa essencial','precisão','dominação','feitiçaria','determinação','inspiração','fragmentos'],
    true
  ),
  (
    'league-builds',
    'league-of-legends',
    'builds',
    'Criador de builds de League of Legends',
    'Build Lab com campeão, rota, itens core e situacionais, botas, runas, feitiços de invocador, prioridade de habilidades, tags, notas e salvamento no perfil.',
    '/games/league-of-legends',
    array['league of legends','lol','build','builds','itens','runas','summoner spells','feitiços','skill order','rota','top','jungle','mid','adc','support'],
    true
  )
on conflict (content_key) do update set
  game_slug = excluded.game_slug,
  module_key = excluded.module_key,
  title = excluded.title,
  description = excluded.description,
  path = excluded.path,
  keywords = excluded.keywords,
  published = excluded.published,
  updated_at = now();
