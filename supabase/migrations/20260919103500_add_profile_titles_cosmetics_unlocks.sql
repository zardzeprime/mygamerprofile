create table if not exists public.profile_titles (
 slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
 name jsonb not null default '{}'::jsonb,
 description jsonb not null default '{}'::jsonb,
 rarity text not null default 'common' check (rarity in ('common','uncommon','rare','epic','legendary','mythic')),
 source text not null default 'mgp' check (source in ('mgp','steam','game','achievement','milestone','event','admin')),
 icon_key text not null default 'award',
 unlock_rule jsonb not null default '{}'::jsonb,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.profile_title_unlocks (
 user_id uuid not null references public.profiles(id) on delete cascade,
 title_slug text not null references public.profile_titles(slug) on update cascade on delete cascade,
 unlocked_at timestamptz not null default now(),
 unlock_context jsonb not null default '{}'::jsonb,
 is_new boolean not null default true,
 primary key(user_id,title_slug)
);
create table if not exists public.profile_cosmetic_unlocks (
 user_id uuid not null references public.profiles(id) on delete cascade,
 cosmetic_slug text not null references public.profile_cosmetics(slug) on update cascade on delete cascade,
 unlocked_at timestamptz not null default now(),
 unlock_context jsonb not null default '{}'::jsonb,
 is_new boolean not null default true,
 primary key(user_id,cosmetic_slug)
);
alter table public.profile_loadouts add column if not exists title_slug text null references public.profile_titles(slug) on update cascade on delete set null;
alter table public.profile_cosmetics drop constraint if exists profile_cosmetics_rarity_check;
alter table public.profile_cosmetics add constraint profile_cosmetics_rarity_check check (rarity in ('common','uncommon','rare','epic','legendary','mythic'));
create index if not exists profile_title_unlocks_user_idx on public.profile_title_unlocks(user_id,unlocked_at desc);
create index if not exists profile_cosmetic_unlocks_user_idx on public.profile_cosmetic_unlocks(user_id,unlocked_at desc);
create index if not exists profile_cosmetics_kind_active_idx on public.profile_cosmetics(kind,active,rarity);
alter table public.profile_titles enable row level security;
alter table public.profile_title_unlocks enable row level security;
alter table public.profile_cosmetic_unlocks enable row level security;
drop policy if exists profile_titles_public_read on public.profile_titles;
create policy profile_titles_public_read on public.profile_titles for select to anon,authenticated using(active=true);
drop policy if exists profile_title_unlocks_owner_read on public.profile_title_unlocks;
create policy profile_title_unlocks_owner_read on public.profile_title_unlocks for select to authenticated using((select auth.uid())=user_id);
drop policy if exists profile_cosmetic_unlocks_owner_read on public.profile_cosmetic_unlocks;
create policy profile_cosmetic_unlocks_owner_read on public.profile_cosmetic_unlocks for select to authenticated using((select auth.uid())=user_id);

insert into public.profile_titles(slug,name,description,rarity,source,icon_key,unlock_rule,active) values
('steam-linked',jsonb_build_object('pt-BR','Perfil Verificado','en','Verified Profile','es','Perfil Verificado'),jsonb_build_object('pt-BR','Sua identidade Steam está vinculada ao MGP.','en','Your Steam identity is linked to MGP.','es','Tu identidad de Steam está vinculada a MGP.'),'common','steam','shield','{"type":"steam_connected"}'::jsonb,true),
('library-scout',jsonb_build_object('pt-BR','Explorador da Biblioteca','en','Library Scout','es','Explorador de la Biblioteca'),jsonb_build_object('pt-BR','Tenha pelo menos 25 jogos sincronizados.','en','Sync at least 25 games.','es','Sincroniza al menos 25 juegos.'),'common','milestone','library','{"type":"games","min":25}'::jsonb,true),
('library-curator',jsonb_build_object('pt-BR','Curador da Biblioteca','en','Library Curator','es','Curador de la Biblioteca'),jsonb_build_object('pt-BR','Tenha pelo menos 75 jogos sincronizados.','en','Sync at least 75 games.','es','Sincroniza al menos 75 juegos.'),'uncommon','milestone','library','{"type":"games","min":75}'::jsonb,true),
('library-warden',jsonb_build_object('pt-BR','Guardião da Biblioteca','en','Library Warden','es','Guardián de la Biblioteca'),jsonb_build_object('pt-BR','Tenha pelo menos 125 jogos sincronizados.','en','Sync at least 125 games.','es','Sincroniza al menos 125 juegos.'),'rare','milestone','library','{"type":"games","min":125}'::jsonb,true),
('library-lord',jsonb_build_object('pt-BR','Senhor da Biblioteca','en','Library Lord','es','Señor de la Biblioteca'),jsonb_build_object('pt-BR','Tenha pelo menos 250 jogos sincronizados.','en','Sync at least 250 games.','es','Sincroniza al menos 250 juegos.'),'epic','milestone','library','{"type":"games","min":250}'::jsonb,true),
('library-sovereign',jsonb_build_object('pt-BR','Soberano da Biblioteca','en','Library Sovereign','es','Soberano de la Biblioteca'),jsonb_build_object('pt-BR','Tenha pelo menos 500 jogos sincronizados.','en','Sync at least 500 games.','es','Sincroniza al menos 500 juegos.'),'legendary','milestone','crown','{"type":"games","min":500}'::jsonb,true),
('achievement-hunter-1',jsonb_build_object('pt-BR','Caçador de Conquistas I','en','Achievement Hunter I','es','Cazador de Logros I'),jsonb_build_object('pt-BR','Desbloqueie 100 conquistas.','en','Unlock 100 achievements.','es','Desbloquea 100 logros.'),'common','achievement','trophy','{"type":"achievements","min":100}'::jsonb,true),
('achievement-hunter-2',jsonb_build_object('pt-BR','Caçador de Conquistas II','en','Achievement Hunter II','es','Cazador de Logros II'),jsonb_build_object('pt-BR','Desbloqueie 500 conquistas.','en','Unlock 500 achievements.','es','Desbloquea 500 logros.'),'rare','achievement','trophy','{"type":"achievements","min":500}'::jsonb,true),
('achievement-hunter-3',jsonb_build_object('pt-BR','Caçador de Conquistas III','en','Achievement Hunter III','es','Cazador de Logros III'),jsonb_build_object('pt-BR','Desbloqueie 1000 conquistas.','en','Unlock 1000 achievements.','es','Desbloquea 1000 logros.'),'epic','achievement','trophy','{"type":"achievements","min":1000}'::jsonb,true),
('achievement-myth',jsonb_build_object('pt-BR','Mito das Conquistas','en','Achievement Myth','es','Mito de los Logros'),jsonb_build_object('pt-BR','Desbloqueie 2500 conquistas.','en','Unlock 2,500 achievements.','es','Desbloquea 2500 logros.'),'mythic','achievement','sparkles','{"type":"achievements","min":2500}'::jsonb,true),
('completionist',jsonb_build_object('pt-BR','Completista','en','Completionist','es','Completista'),jsonb_build_object('pt-BR','Complete 100% de pelo menos 1 jogo.','en','100% complete at least 1 game.','es','Completa al 100% al menos 1 juego.'),'rare','achievement','check','{"type":"perfect_games","min":1}'::jsonb,true),
('perfect-five',jsonb_build_object('pt-BR','Mestre do 100%','en','100% Master','es','Maestro del 100%'),jsonb_build_object('pt-BR','Complete 100% de pelo menos 5 jogos.','en','100% complete at least 5 games.','es','Completa al 100% al menos 5 juegos.'),'legendary','achievement','crown','{"type":"perfect_games","min":5}'::jsonb,true),
('hour-runner',jsonb_build_object('pt-BR','Maratonista','en','Marathoner','es','Maratonista'),jsonb_build_object('pt-BR','Acumule 500 horas jogadas.','en','Accumulate 500 played hours.','es','Acumula 500 horas jugadas.'),'common','milestone','clock','{"type":"hours","min":500}'::jsonb,true),
('hour-warrior',jsonb_build_object('pt-BR','Guerreiro de Horas','en','Hour Warrior','es','Guerrero de Horas'),jsonb_build_object('pt-BR','Acumule 1000 horas jogadas.','en','Accumulate 1,000 played hours.','es','Acumula 1000 horas jugadas.'),'rare','milestone','clock','{"type":"hours","min":1000}'::jsonb,true),
('hour-veteran',jsonb_build_object('pt-BR','Veterano Incansável','en','Relentless Veteran','es','Veterano Incansable'),jsonb_build_object('pt-BR','Acumule 2500 horas jogadas.','en','Accumulate 2,500 played hours.','es','Acumula 2500 horas jugadas.'),'epic','milestone','flame','{"type":"hours","min":2500}'::jsonb,true),
('time-legend',jsonb_build_object('pt-BR','Lenda do Tempo','en','Legend of Time','es','Leyenda del Tiempo'),jsonb_build_object('pt-BR','Acumule 5000 horas jogadas.','en','Accumulate 5,000 played hours.','es','Acumula 5000 horas jugadas.'),'mythic','milestone','sparkles','{"type":"hours","min":5000}'::jsonb,true),
('steam-veteran',jsonb_build_object('pt-BR','Veterano Steam','en','Steam Veteran','es','Veterano de Steam'),jsonb_build_object('pt-BR','Alcance nível 10 na Steam.','en','Reach Steam level 10.','es','Alcanza nivel 10 en Steam.'),'common','steam','badge','{"type":"steam_level","min":10}'::jsonb,true),
('steam-elite',jsonb_build_object('pt-BR','Elite Steam','en','Steam Elite','es','Élite de Steam'),jsonb_build_object('pt-BR','Alcance nível 25 na Steam.','en','Reach Steam level 25.','es','Alcanza nivel 25 en Steam.'),'rare','steam','badge','{"type":"steam_level","min":25}'::jsonb,true),
('steam-prestige',jsonb_build_object('pt-BR','Prestígio de Aço','en','Steel Prestige','es','Prestigio de Acero'),jsonb_build_object('pt-BR','Alcance nível 50 na Steam.','en','Reach Steam level 50.','es','Alcanza nivel 50 en Steam.'),'epic','steam','award','{"type":"steam_level","min":50}'::jsonb,true),
('badge-collector',jsonb_build_object('pt-BR','Colecionador de Insígnias','en','Badge Collector','es','Coleccionista de Insignias'),jsonb_build_object('pt-BR','Tenha 10 insígnias sincronizadas.','en','Sync 10 badges.','es','Sincroniza 10 insignias.'),'common','steam','badge','{"type":"badges","min":10}'::jsonb,true),
('badge-archivist',jsonb_build_object('pt-BR','Arquivista de Insígnias','en','Badge Archivist','es','Archivero de Insignias'),jsonb_build_object('pt-BR','Tenha 25 insígnias sincronizadas.','en','Sync 25 badges.','es','Sincroniza 25 insignias.'),'rare','steam','badge','{"type":"badges","min":25}'::jsonb,true),
('inventory-keeper',jsonb_build_object('pt-BR','Guardião do Inventário','en','Inventory Keeper','es','Guardián del Inventario'),jsonb_build_object('pt-BR','Sincronize 10 itens públicos.','en','Sync 10 public items.','es','Sincroniza 10 objetos públicos.'),'uncommon','steam','package','{"type":"items","min":10}'::jsonb,true),
('inventory-curator',jsonb_build_object('pt-BR','Curador de Relíquias','en','Relic Curator','es','Curador de Reliquias'),jsonb_build_object('pt-BR','Sincronize 100 itens públicos.','en','Sync 100 public items.','es','Sincroniza 100 objetos públicos.'),'epic','steam','package','{"type":"items","min":100}'::jsonb,true),
('single-game-devotion',jsonb_build_object('pt-BR','Devoto de um Só Jogo','en','One-Game Devotee','es','Devoto de un Solo Juego'),jsonb_build_object('pt-BR','Tenha pelo menos 500 horas em um único jogo.','en','Have at least 500 hours in one game.','es','Ten al menos 500 horas en un solo juego.'),'rare','game','flame','{"type":"top_game_hours","min":500}'::jsonb,true),
('single-game-legend',jsonb_build_object('pt-BR','Lenda de um Só Jogo','en','One-Game Legend','es','Leyenda de un Solo Juego'),jsonb_build_object('pt-BR','Tenha pelo menos 1000 horas em um único jogo.','en','Have at least 1,000 hours in one game.','es','Ten al menos 1000 horas en un solo juego.'),'legendary','game','crown','{"type":"top_game_hours","min":1000}'::jsonb,true),
('brawlhalla-legend',jsonb_build_object('pt-BR','Lenda da Arena','en','Arena Legend','es','Leyenda de la Arena'),jsonb_build_object('pt-BR','Jogue 100 horas de Brawlhalla.','en','Play 100 hours of Brawlhalla.','es','Juega 100 horas de Brawlhalla.'),'epic','game','swords','{"type":"game_hours","appId":291550,"min":100}'::jsonb,true),
('lordran-guardian',jsonb_build_object('pt-BR','Guardião de Lordran','en','Guardian of Lordran','es','Guardián de Lordran'),jsonb_build_object('pt-BR','Jogue 25 horas de Dark Souls Remastered.','en','Play 25 hours of Dark Souls Remastered.','es','Juega 25 horas de Dark Souls Remastered.'),'rare','game','flame','{"type":"game_hours","appId":570940,"min":25}'::jsonb,true),
('lordran-complete',jsonb_build_object('pt-BR','Herdeiro da Fogueira','en','Heir of the Bonfire','es','Heredero de la Hoguera'),jsonb_build_object('pt-BR','Complete 100% de Dark Souls Remastered.','en','100% complete Dark Souls Remastered.','es','Completa al 100% Dark Souls Remastered.'),'legendary','game','flame','{"type":"game_perfect","appId":570940}'::jsonb,true),
('lothric-survivor',jsonb_build_object('pt-BR','Sobrevivente de Lothric','en','Lothric Survivor','es','Superviviente de Lothric'),jsonb_build_object('pt-BR','Jogue 25 horas de Dark Souls III.','en','Play 25 hours of Dark Souls III.','es','Juega 25 horas de Dark Souls III.'),'rare','game','swords','{"type":"game_hours","appId":374320,"min":25}'::jsonb,true),
('lord-of-cinders',jsonb_build_object('pt-BR','Lorde das Cinzas','en','Lord of Cinders','es','Señor de las Cenizas'),jsonb_build_object('pt-BR','Complete 100% de Dark Souls III.','en','100% complete Dark Souls III.','es','Completa al 100% Dark Souls III.'),'legendary','game','flame','{"type":"game_perfect","appId":374320}'::jsonb,true)
on conflict(slug) do update set name=excluded.name,description=excluded.description,rarity=excluded.rarity,source=excluded.source,icon_key=excluded.icon_key,unlock_rule=excluded.unlock_rule,active=true,updated_at=now();

insert into public.profile_cosmetics(slug,kind,name,description,css_class,rarity,animated,acquisition_method,active,rights_note) values
('obsidian','background',jsonb_build_object('pt-BR','Obsidiana','en','Obsidian','es','Obsidiana'),jsonb_build_object('pt-BR','Negro mineral com brilho discreto.','en','Mineral black with restrained sheen.','es','Negro mineral con brillo sutil.'),'mgp-bg-obsidian','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('black-gold','background',jsonb_build_object('pt-BR','Ouro Negro','en','Black Gold','es','Oro Negro'),jsonb_build_object('pt-BR','Grafite profundo com filamentos dourados.','en','Deep graphite with gold filaments.','es','Grafito profundo con filamentos dorados.'),'mgp-bg-black-gold','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('deep-blue','background',jsonb_build_object('pt-BR','Azul Profundo','en','Deep Blue','es','Azul Profundo'),jsonb_build_object('pt-BR','Azul noturno com profundidade fria.','en','Midnight blue with cool depth.','es','Azul nocturno con profundidad fría.'),'mgp-bg-deep-blue','common',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('amethyst-night','background',jsonb_build_object('pt-BR','Noite Ametista','en','Amethyst Night','es','Noche Amatista'),jsonb_build_object('pt-BR','Roxo escuro com névoa suave.','en','Dark purple with soft mist.','es','Púrpura oscuro con niebla suave.'),'mgp-bg-amethyst','uncommon',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('eclipse','background',jsonb_build_object('pt-BR','Eclipse','en','Eclipse','es','Eclipse'),jsonb_build_object('pt-BR','Halo dourado surgindo do vazio.','en','A gold halo emerging from the void.','es','Un halo dorado emergiendo del vacío.'),'mgp-bg-eclipse','rare',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ancient-ember','background',jsonb_build_object('pt-BR','Fogueira Antiga','en','Ancient Ember','es','Hoguera Antigua'),jsonb_build_object('pt-BR','Brasa original MGP em carvão e cobre.','en','Original MGP ember in charcoal and copper.','es','Brasa original MGP en carbón y cobre.'),'mgp-bg-ember','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ash-throne','background',jsonb_build_object('pt-BR','Trono das Cinzas','en','Ash Throne','es','Trono de Ceniza'),jsonb_build_object('pt-BR','Cinzas, calor baixo e metal gasto.','en','Ash, low heat and worn metal.','es','Ceniza, calor bajo y metal gastado.'),'mgp-bg-ash-throne','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('silent-abyss','background',jsonb_build_object('pt-BR','Abismo Silencioso','en','Silent Abyss','es','Abismo Silencioso'),jsonb_build_object('pt-BR','Camadas de preto e violeta quase sem luz.','en','Layers of black and violet with near-zero light.','es','Capas de negro y violeta casi sin luz.'),'mgp-bg-abyss','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('crimson-moon','background',jsonb_build_object('pt-BR','Lua Carmesim','en','Crimson Moon','es','Luna Carmesí'),jsonb_build_object('pt-BR','Lua abstrata carmesim sobre névoa escura.','en','Abstract crimson moon over dark mist.','es','Luna carmesí abstracta sobre niebla oscura.'),'mgp-bg-crimson-moon','legendary',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('tactical-grid','background',jsonb_build_object('pt-BR','Grade Competitiva','en','Competitive Grid','es','Rejilla Competitiva'),jsonb_build_object('pt-BR','Linhas táticas discretas e sinal dourado.','en','Restrained tactical lines with a gold signal.','es','Líneas tácticas sutiles y señal dorada.'),'mgp-bg-tactical-grid','rare',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('prismatic-core','background',jsonb_build_object('pt-BR','Núcleo Prismático','en','Prismatic Core','es','Núcleo Prismático'),jsonb_build_object('pt-BR','Prisma escuro com reflexos frios e dourados.','en','Dark prism with cool and gold reflections.','es','Prisma oscuro con reflejos fríos y dorados.'),'mgp-bg-prismatic-core','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('mythic-ascent','background',jsonb_build_object('pt-BR','Ascensão Mítica','en','Mythic Ascent','es','Ascensión Mítica'),jsonb_build_object('pt-BR','Camadas celestes e halo de prestígio.','en','Celestial layers with a prestige halo.','es','Capas celestes con halo de prestigio.'),'mgp-bg-mythic-ascent','mythic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('clean-ring','avatar_frame',jsonb_build_object('pt-BR','Aro Limpo','en','Clean Ring','es','Aro Limpio'),jsonb_build_object('pt-BR','Moldura mínima para qualquer perfil.','en','Minimal frame for any profile.','es','Marco mínimo para cualquier perfil.'),'mgp-frame-clean','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('thin-gold','avatar_frame',jsonb_build_object('pt-BR','Ouro Fino','en','Thin Gold','es','Oro Fino'),jsonb_build_object('pt-BR','Aro dourado discreto do MGP.','en','Subtle MGP gold ring.','es','Aro dorado sutil de MGP.'),'mgp-frame-gold','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('silver-arc','avatar_frame',jsonb_build_object('pt-BR','Arco de Prata','en','Silver Arc','es','Arco de Plata'),jsonb_build_object('pt-BR','Prata fria com cortes assimétricos.','en','Cool silver with asymmetric cuts.','es','Plata fría con cortes asimétricos.'),'mgp-frame-silver','uncommon',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('rune-ring','avatar_frame',jsonb_build_object('pt-BR','Aro Rúnico','en','Runic Ring','es','Aro Rúnico'),jsonb_build_object('pt-BR','Runas abstratas originais com brilho baixo.','en','Original abstract runes with restrained glow.','es','Runas abstractas originales con brillo sutil.'),'mgp-frame-rune','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('neon-orbit','avatar_frame',jsonb_build_object('pt-BR','Órbita Neon','en','Neon Orbit','es','Órbita Neón'),jsonb_build_object('pt-BR','Duas órbitas leves ao redor do avatar.','en','Two light orbits around the avatar.','es','Dos órbitas ligeras alrededor del avatar.'),'mgp-frame-neon','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ember-ring','avatar_frame',jsonb_build_object('pt-BR','Aro de Brasa','en','Ember Ring','es','Aro de Brasa'),jsonb_build_object('pt-BR','Brasa discreta correndo pela borda.','en','Restrained ember travelling around the edge.','es','Brasa sutil recorriendo el borde.'),'mgp-frame-ember','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('abyss-crown','avatar_frame',jsonb_build_object('pt-BR','Coroa do Abismo','en','Abyss Crown','es','Corona del Abismo'),jsonb_build_object('pt-BR','Pontas violeta e sombra profunda.','en','Violet points and deep shadow.','es','Puntas violetas y sombra profunda.'),'mgp-frame-abyss','legendary',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('celestial-crown','avatar_frame',jsonb_build_object('pt-BR','Coroa Celestial','en','Celestial Crown','es','Corona Celestial'),jsonb_build_object('pt-BR','Halo duplo para marcos de alto prestígio.','en','Double halo for high-prestige milestones.','es','Halo doble para hitos de alto prestigio.'),'mgp-frame-celestial','mythic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('soft-glow','profile_effect',jsonb_build_object('pt-BR','Brilho Suave','en','Soft Glow','es','Brillo Suave'),jsonb_build_object('pt-BR','Respiração luminosa discreta no perfil.','en','Subtle breathing glow on the profile.','es','Respiración luminosa sutil en el perfil.'),'mgp-effect-soft-glow','common',true,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('gold-dust','profile_effect',jsonb_build_object('pt-BR','Poeira Dourada','en','Gold Dust','es','Polvo Dorado'),jsonb_build_object('pt-BR','Pontos dourados lentos na composição.','en','Slow gold motes across the composition.','es','Puntos dorados lentos en la composición.'),'mgp-effect-gold-dust','uncommon',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ember-drift','profile_effect',jsonb_build_object('pt-BR','Brasa Errante','en','Ember Drift','es','Brasa Errante'),jsonb_build_object('pt-BR','Faíscas discretas sobem do rodapé visual.','en','Restrained sparks rise through the visual.','es','Chispas sutiles suben por la composición.'),'mgp-effect-ember','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('signal-pulse','profile_effect',jsonb_build_object('pt-BR','Pulso de Sinal','en','Signal Pulse','es','Pulso de Señal'),jsonb_build_object('pt-BR','Pulso tático leve nas bordas.','en','Light tactical pulse along the edges.','es','Pulso táctico ligero en los bordes.'),'mgp-effect-signal','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('void-mist','profile_effect',jsonb_build_object('pt-BR','Névoa do Vazio','en','Void Mist','es','Niebla del Vacío'),jsonb_build_object('pt-BR','Névoa violeta lenta e profunda.','en','Slow deep violet mist.','es','Niebla violeta lenta y profunda.'),'mgp-effect-void','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('mythic-aura','profile_effect',jsonb_build_object('pt-BR','Aura Mítica','en','Mythic Aura','es','Aura Mítica'),jsonb_build_object('pt-BR','Halo premium com movimento quase imperceptível.','en','Premium halo with near-imperceptible motion.','es','Halo premium con movimiento casi imperceptible.'),'mgp-effect-mythic','mythic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('graphite-banner','banner',jsonb_build_object('pt-BR','Faixa Grafite','en','Graphite Banner','es','Franja Grafito'),jsonb_build_object('pt-BR','Banner preto e grafite do MGP.','en','MGP black and graphite banner.','es','Banner negro y grafito de MGP.'),'mgp-banner-graphite','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ember-banner','banner',jsonb_build_object('pt-BR','Faixa de Brasa','en','Ember Banner','es','Franja de Brasa'),jsonb_build_object('pt-BR','Faixa abstrata de carvão e brasa.','en','Abstract charcoal and ember strip.','es','Franja abstracta de carbón y brasa.'),'mgp-banner-ember','rare',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('rift-banner','banner',jsonb_build_object('pt-BR','Faixa Prismática','en','Prismatic Banner','es','Franja Prismática'),jsonb_build_object('pt-BR','Energia violeta, azul e ouro.','en','Violet, blue and gold energy.','es','Energía violeta, azul y oro.'),'mgp-banner-rift','epic',true,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('gold-pointer','cursor',jsonb_build_object('pt-BR','Ponteiro Dourado','en','Gold Pointer','es','Puntero Dorado'),jsonb_build_object('pt-BR','Cursor angular original do MGP.','en','Original angular MGP cursor.','es','Cursor angular original de MGP.'),'mgp-cursor-gold','common',false,'starter',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('ember-pointer','cursor',jsonb_build_object('pt-BR','Ponteiro de Brasa','en','Ember Pointer','es','Puntero de Brasa'),jsonb_build_object('pt-BR','Cursor original com ponto de brasa.','en','Original cursor with an ember point.','es','Cursor original con punto de brasa.'),'mgp-cursor-ember','rare',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.'),
('signal-cross','cursor',jsonb_build_object('pt-BR','Mira de Sinal','en','Signal Crosshair','es','Mira de Señal'),jsonb_build_object('pt-BR','Cursor em formato de mira abstrata.','en','Abstract crosshair-shaped cursor.','es','Cursor con forma de mira abstracta.'),'mgp-cursor-signal','rare',false,'achievement',true,'Original MG Profile CSS-only visual; no third-party game artwork reused.')
on conflict(slug) do update set kind=excluded.kind,name=excluded.name,description=excluded.description,css_class=excluded.css_class,rarity=excluded.rarity,animated=excluded.animated,acquisition_method=excluded.acquisition_method,active=true,rights_note=excluded.rights_note,updated_at=now();

create or replace function public.evaluate_profile_unlocks(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare games_count integer:=0; achievement_count integer:=0; perfect_games integer:=0; hours_total numeric:=0;
steam_level_value integer:=0; badge_count_value integer:=0; item_count integer:=0; top_game_hours numeric:=0; top_game_app bigint:=null;
steam_connected boolean:=false; unlocked_titles integer:=0; unlocked_cosmetics integer:=0;
begin
 if (select auth.uid()) is distinct from target_user_id and coalesce((select auth.role()),'') <> 'service_role' then raise exception 'not_allowed'; end if;
 select exists(select 1 from public.connected_accounts where user_id=target_user_id and provider='steam' and status='connected') into steam_connected;
 select count(*)::integer,coalesce(sum(playtime_forever),0)::numeric/60.0,coalesce(sum(achievements_unlocked),0)::integer,
        count(*) filter(where achievements_total>0 and achievements_unlocked=achievements_total)::integer
 into games_count,hours_total,achievement_count,perfect_games
 from public.steam_games where user_id=target_user_id and owned=true;
 select coalesce(steam_level,0),coalesce(badge_count,0) into steam_level_value,badge_count_value from public.steam_profiles where user_id=target_user_id;
 select count(*)::integer into item_count from public.steam_inventory_items where user_id=target_user_id;
 select app_id,coalesce(playtime_forever,0)::numeric/60.0 into top_game_app,top_game_hours from public.steam_games where user_id=target_user_id and owned=true order by playtime_forever desc limit 1;

 insert into public.profile_title_unlocks(user_id,title_slug,unlock_context)
 select target_user_id,t.slug,jsonb_build_object('games',games_count,'achievements',achievement_count,'perfectGames',perfect_games,'hours',round(hours_total,1),'steamLevel',steam_level_value,'badges',badge_count_value,'items',item_count,'topGameAppId',top_game_app,'topGameHours',round(top_game_hours,1))
 from public.profile_titles t where t.active=true and (
  (t.slug='steam-linked' and steam_connected) or
  ((t.unlock_rule->>'type')='games' and games_count >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='achievements' and achievement_count >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='perfect_games' and perfect_games >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='hours' and hours_total >= (t.unlock_rule->>'min')::numeric) or
  ((t.unlock_rule->>'type')='steam_level' and steam_level_value >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='badges' and badge_count_value >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='items' and item_count >= (t.unlock_rule->>'min')::integer) or
  ((t.unlock_rule->>'type')='top_game_hours' and top_game_hours >= (t.unlock_rule->>'min')::numeric) or
  ((t.unlock_rule->>'type')='game_hours' and exists(select 1 from public.steam_games sg where sg.user_id=target_user_id and sg.owned=true and sg.app_id=(t.unlock_rule->>'appId')::bigint and (sg.playtime_forever::numeric/60.0)>=(t.unlock_rule->>'min')::numeric)) or
  ((t.unlock_rule->>'type')='game_perfect' and exists(select 1 from public.steam_games sg where sg.user_id=target_user_id and sg.owned=true and sg.app_id=(t.unlock_rule->>'appId')::bigint and sg.achievements_total>0 and sg.achievements_unlocked=sg.achievements_total))
 ) on conflict(user_id,title_slug) do nothing;
 get diagnostics unlocked_titles=row_count;

 insert into public.profile_cosmetic_unlocks(user_id,cosmetic_slug,unlock_context)
 select target_user_id,c.slug,jsonb_build_object('source','profile_progress','games',games_count,'achievements',achievement_count,'hours',round(hours_total,1),'level',steam_level_value)
 from public.profile_cosmetics c where c.active=true and (
  c.acquisition_method='starter' or
  (c.slug in('deep-blue','silver-arc','gold-dust') and games_count>=25) or
  (c.slug in('amethyst-night','rune-ring') and achievement_count>=100) or
  (c.slug in('eclipse','neon-orbit','signal-pulse','tactical-grid') and achievement_count>=500) or
  (c.slug in('ancient-ember','ember-ring','ember-drift','ember-banner','ember-pointer') and hours_total>=500) or
  (c.slug in('ash-throne','prismatic-core','rift-banner') and hours_total>=1000) or
  (c.slug in('silent-abyss','void-mist') and perfect_games>=1) or
  (c.slug in('crimson-moon','abyss-crown') and perfect_games>=3) or
  (c.slug in('celestial-crown','mythic-ascent','mythic-aura') and achievement_count>=1000 and hours_total>=1000) or
  (c.slug='signal-cross' and top_game_hours>=250)
 ) on conflict(user_id,cosmetic_slug) do nothing;
 get diagnostics unlocked_cosmetics=row_count;

 insert into public.profile_loadouts(user_id,background_slug,avatar_frame_slug,effect_slug,title_slug)
 values(target_user_id,
  case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='obsidian') then 'obsidian' else null end,
  case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='clean-ring') then 'clean-ring' else null end,
  case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='soft-glow') then 'soft-glow' else null end,
  case when exists(select 1 from public.profile_title_unlocks where user_id=target_user_id and title_slug='steam-linked') then 'steam-linked' else null end)
 on conflict(user_id) do nothing;

 return jsonb_build_object('newTitles',unlocked_titles,'newCosmetics',unlocked_cosmetics,'metrics',jsonb_build_object('games',games_count,'achievements',achievement_count,'perfectGames',perfect_games,'hours',round(hours_total,1),'steamLevel',steam_level_value,'badges',badge_count_value,'items',item_count,'topGameAppId',top_game_app,'topGameHours',round(top_game_hours,1)));
end $$;
grant execute on function public.evaluate_profile_unlocks(uuid) to authenticated;

create or replace function public.get_public_profile_loadout(target_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare l public.profile_loadouts%rowtype;
begin
 if not exists(select 1 from public.profiles p where p.id=target_user_id and p.visibility='public') then return null; end if;
 select * into l from public.profile_loadouts where user_id=target_user_id;
 if not found then return jsonb_build_object('title',null,'background',null,'avatarFrame',null,'effect',null); end if;
 return jsonb_build_object(
  'title',(select jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'rarity',t.rarity,'iconKey',t.icon_key) from public.profile_titles t where t.slug=l.title_slug and t.active=true),
  'background',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.background_slug and c.active=true),
  'avatarFrame',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.avatar_frame_slug and c.active=true),
  'effect',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.effect_slug and c.active=true)
 );
end $$;
revoke all on function public.get_public_profile_loadout(uuid) from public;
grant execute on function public.get_public_profile_loadout(uuid) to anon,authenticated;
