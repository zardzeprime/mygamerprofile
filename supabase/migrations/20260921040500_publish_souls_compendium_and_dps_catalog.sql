insert into public.mgp_content_catalog
  (content_key, game_slug, module_key, title, description, path, keywords, published)
values
  (
    'dark-souls-remastered-items',
    'dark-souls-remastered',
    'items',
    'Compêndio de itens de Dark Souls Remastered',
    'Diretório pesquisável de armas, escudos, armaduras, anéis, magias e itens com ícones, descrições de referência e procedência.',
    '/games/dark-souls-remastered',
    array['dark souls','dark souls remastered','ds1','armas','escudos','armaduras','anéis','magias','itens','compêndio'],
    true
  ),
  (
    'dark-souls-remastered-dps-test',
    'dark-souls-remastered',
    'dps-test',
    'DPS Test de Dark Souls Remastered',
    'Teste interativo de armas com upgrade, STR, DEX, INT, FTH, duas mãos e modos Casual e Avançado. O modo avançado de DS1 usa estimativa de AR no beta.',
    '/games/dark-souls-remastered',
    array['dark souls','ds1','dps test','arma','scaling','força','destreza','inteligência','fé','upgrade','ar'],
    true
  ),
  (
    'dark-souls-iii-items',
    'dark-souls-iii',
    'items',
    'Compêndio de itens de Dark Souls III',
    'Diretório pesquisável de armas, escudos, armaduras, anéis, magias e itens com ícones, descrições de referência e procedência.',
    '/games/dark-souls-iii',
    array['dark souls 3','dark souls iii','ds3','armas','escudos','armaduras','anéis','magias','itens','compêndio'],
    true
  ),
  (
    'dark-souls-iii-dps-test',
    'dark-souls-iii',
    'dps-test',
    'DPS Test de Dark Souls III',
    'Teste interativo de armas com infusão, upgrade, atributos, duas mãos, avaliação Casual em 10 níveis e leitura Avançada de Attack Rating por tipo de dano.',
    '/games/dark-souls-iii',
    array['dark souls 3','ds3','dps test','arma','infusão','scaling','upgrade','attack rating','ar','força','destreza','inteligência','fé','sorte'],
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
