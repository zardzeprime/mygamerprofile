-- v0.1.5A — production foundation / expanded game catalog
-- Idempotent so environments can safely receive the same catalog update.

insert into public.games (slug, name, description, genre, platforms, age_rating, theme_key, active)
values
  (
    'dark-souls-iii',
    'Dark Souls III',
    'Action RPG da FromSoftware ambientado em um mundo em ruínas no fim da Era do Fogo.',
    'Action RPG',
    array['PC', 'PlayStation', 'Xbox']::text[],
    '16+',
    'dark_souls',
    true
  ),
  (
    'elden-ring',
    'Elden Ring',
    'Action RPG de mundo aberto da FromSoftware. Shadow of the Erdtree é tratado como expansão do jogo base.',
    'Action RPG',
    array['PC', 'PlayStation', 'Xbox']::text[],
    '16+',
    'dark_souls',
    true
  ),
  (
    'elden-ring-nightreign',
    'Elden Ring Nightreign',
    'Aventura cooperativa standalone ambientada no universo de Elden Ring.',
    'Co-op Action RPG',
    array['PC', 'PlayStation', 'Xbox']::text[],
    '16+',
    'dark_souls',
    true
  ),
  (
    'league-of-legends',
    'League of Legends',
    'MOBA competitivo 5v5 da Riot Games.',
    'MOBA',
    array['PC']::text[],
    '12+',
    'competitive',
    true
  ),
  (
    'ea-sports-fc',
    'EA SPORTS FC',
    'Hub da série anual de futebol da EA Sports, pensado para não quebrar perfis a cada nova edição.',
    'Sports',
    array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']::text[],
    'Livre',
    'competitive',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  genre = excluded.genre,
  platforms = excluded.platforms,
  age_rating = excluded.age_rating,
  theme_key = excluded.theme_key,
  active = excluded.active;
