create table public.games (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    description text,
    genre text,
    platforms text[] default '{}',
    age_rating text,
    theme_key text,
    active boolean not null default true,
    created_at timestamp with time zone not null default now()
);

create table public.game_modules (
    id uuid primary key default gen_random_uuid(),
    game_id uuid not null references public.games(id) on delete cascade,
    module_key text not null,
    enabled boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamp with time zone not null default now(),
    unique (game_id, module_key)
);

grant select on public.games to anon, authenticated;
grant all on public.games to service_role;
grant select on public.game_modules to anon, authenticated;
grant all on public.game_modules to service_role;

alter table public.games enable row level security;
alter table public.game_modules enable row level security;

create policy "Games are publicly readable"
on public.games
for select
to anon, authenticated
using (true);

create policy "Game modules are publicly readable"
on public.game_modules
for select
to anon, authenticated
using (true);

insert into public.games (slug, name, description, genre, platforms, age_rating, theme_key, active) values
('dark-souls-remastered', 'Dark Souls Remastered', 'O clássico de ação e RPG que definiu uma geração de desafios.', 'Action RPG', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch'], '16', 'dark_souls', true),
('valorant', 'Valorant', 'Tático 5x5 de heróis com tiros precisos e habilidades únicas.', 'Tactical Shooter', ARRAY['PC'], '16', 'valorant', true);

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'overview', true, 0 from public.games;

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'community', true, 1 from public.games;

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'builds', true, 2 from public.games where slug = 'dark-souls-remastered';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'bosses', true, 3 from public.games where slug = 'dark-souls-remastered';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'guides', true, 4 from public.games where slug = 'dark-souls-remastered';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'agents', true, 2 from public.games where slug = 'valorant';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'competitive', true, 3 from public.games where slug = 'valorant';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'clips', true, 4 from public.games where slug = 'valorant';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'guides', true, 5 from public.games where slug = 'valorant';

insert into public.game_modules (game_id, module_key, enabled, sort_order)
select id, 'lfg', true, 10 from public.games;