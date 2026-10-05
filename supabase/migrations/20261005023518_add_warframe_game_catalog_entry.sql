insert into public.games (
  slug,
  name,
  description,
  genre,
  platforms,
  age_rating,
  theme_key,
  active,
  minimum_age,
  age_gate_level
)
values (
  'warframe',
  'Warframe',
  'Ação cooperativa free-to-play com Warframes, armas, Mods, missões e progressão por sistemas que se conectam ao longo do Sistema de Origem.',
  'Action RPG / Looter Shooter',
  array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
  '16+',
  'competitive',
  true,
  16,
  'account_age'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  genre = excluded.genre,
  platforms = excluded.platforms,
  age_rating = excluded.age_rating,
  theme_key = excluded.theme_key,
  active = true,
  minimum_age = excluded.minimum_age,
  age_gate_level = excluded.age_gate_level;
