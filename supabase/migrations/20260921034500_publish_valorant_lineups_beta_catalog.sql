insert into public.mgp_content_catalog
  (content_key, game_slug, module_key, title, description, path, keywords, published)
values
  (
    'valorant-lineups',
    'valorant',
    'lineups',
    'Lineups de VALORANT',
    'Biblioteca de lineups em beta público. A estrutura de envio está visível, mas uploads da comunidade permanecem fechados até existir moderação de vídeo, autoria e denúncias.',
    '/games/valorant',
    array['valorant','lineup','lineups','utilitário','utility','mapa','agente','vídeo','video','beta','moderação'],
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
