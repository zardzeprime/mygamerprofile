-- MGP 0.1.9 -> 0.2 foundation.
-- This migration mirrors the schema change already applied to the linked production project.

update public.games
set active = case
  when slug in ('dark-souls-remastered','dark-souls-iii','valorant','league-of-legends') then true
  when slug in ('elden-ring','elden-ring-nightreign','ea-sports-fc') then false
  else active
end;

alter table public.profiles drop constraint if exists profiles_profile_background_check;
alter table public.profiles
  add constraint profiles_profile_background_check
  check (profile_background = any (array[
    'mgp-grid'::text,
    'ember'::text,
    'tactical'::text,
    'midnight'::text,
    'rift-nebula'::text,
    'emberstorm'::text,
    'hextech-pulse'::text
  ]));

create table if not exists public.profile_identity_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  gender_label text null check (gender_label is null or char_length(gender_label) <= 60),
  country_code text null check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  subdivision_code text null check (subdivision_code is null or char_length(subdivision_code) <= 12),
  gender_visibility text not null default 'private' check (gender_visibility in ('public','private')),
  country_visibility text not null default 'private' check (country_visibility in ('public','private')),
  subdivision_visibility text not null default 'private' check (subdivision_visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profile_identity_details is
  'Owner-controlled profile identity details. Public surfaces must use get_public_profile_identity(), never direct table access.';

alter table public.profile_identity_details enable row level security;

drop policy if exists "identity owner select" on public.profile_identity_details;
create policy "identity owner select" on public.profile_identity_details
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "identity owner insert" on public.profile_identity_details;
create policy "identity owner insert" on public.profile_identity_details
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "identity owner update" on public.profile_identity_details;
create policy "identity owner update" on public.profile_identity_details
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "identity owner delete" on public.profile_identity_details;
create policy "identity owner delete" on public.profile_identity_details
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.get_public_profile_identity(p_user_id uuid)
returns table(gender_label text, country_code text, subdivision_code text)
language sql
stable
security definer
set search_path = public
as $$
  select
    case when d.gender_visibility = 'public' then d.gender_label else null end,
    case when d.country_visibility = 'public' then d.country_code else null end,
    case when d.subdivision_visibility = 'public' then d.subdivision_code else null end
  from public.profile_identity_details d
  join public.profiles p on p.id = d.user_id
  where d.user_id = p_user_id
    and (p.visibility = 'public' or auth.uid() = p_user_id)
  limit 1;
$$;

revoke all on function public.get_public_profile_identity(uuid) from public;
grant execute on function public.get_public_profile_identity(uuid) to anon, authenticated;

create table if not exists public.profile_cosmetics (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  kind text not null check (kind in ('background','banner','badge','chibi')),
  game_slug text null references public.games(slug) on update cascade on delete set null,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  css_class text null,
  asset_url text null,
  rarity text not null default 'common' check (rarity in ('common','rare','epic','legendary')),
  animated boolean not null default false,
  acquisition_method text not null default 'starter' check (acquisition_method in ('starter','achievement','event','gacha','admin')),
  active boolean not null default true,
  source_url text null,
  rights_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_cosmetics enable row level security;
drop policy if exists "active cosmetics are readable" on public.profile_cosmetics;
create policy "active cosmetics are readable" on public.profile_cosmetics
  for select to anon, authenticated using (active = true);

create table if not exists public.profile_inventory (
  user_id uuid not null references public.profiles(id) on delete cascade,
  cosmetic_slug text not null references public.profile_cosmetics(slug) on update cascade on delete cascade,
  acquisition_source text not null default 'starter',
  acquired_at timestamptz not null default now(),
  primary key (user_id, cosmetic_slug)
);

alter table public.profile_inventory enable row level security;
drop policy if exists "inventory owner select" on public.profile_inventory;
create policy "inventory owner select" on public.profile_inventory
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "inventory owner insert" on public.profile_inventory;
create policy "inventory owner insert" on public.profile_inventory
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "inventory owner delete" on public.profile_inventory;
create policy "inventory owner delete" on public.profile_inventory
  for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.profile_loadouts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  background_slug text null references public.profile_cosmetics(slug) on update cascade on delete set null,
  banner_slug text null references public.profile_cosmetics(slug) on update cascade on delete set null,
  chibi_slug text null references public.profile_cosmetics(slug) on update cascade on delete set null,
  badge_slugs text[] not null default '{}'::text[],
  updated_at timestamptz not null default now(),
  check (cardinality(badge_slugs) <= 6)
);

alter table public.profile_loadouts enable row level security;
drop policy if exists "loadout owner or public profile select" on public.profile_loadouts;
create policy "loadout owner or public profile select" on public.profile_loadouts
  for select to anon, authenticated using (
    auth.uid() = user_id or exists (
      select 1 from public.profiles p where p.id = user_id and p.visibility = 'public'
    )
  );
drop policy if exists "loadout owner insert" on public.profile_loadouts;
create policy "loadout owner insert" on public.profile_loadouts
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "loadout owner update" on public.profile_loadouts;
create policy "loadout owner update" on public.profile_loadouts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.profile_cosmetics
  (slug, kind, name, description, css_class, rarity, animated, acquisition_method, rights_note)
values
  ('rift-nebula','background','{"pt-BR":"Nébula do Rift","en":"Rift Nebula","es":"Nébula del Rift"}'::jsonb,'{"pt-BR":"Névoa cósmica animada em profundidade.","en":"Animated deep-space mist.","es":"Niebla cósmica animada en profundidad."}'::jsonb,'profile-bg-rift-nebula','rare',true,'starter','MGP original CSS cosmetic'),
  ('emberstorm','background','{"pt-BR":"Tempestade de Brasas","en":"Emberstorm","es":"Tormenta de Brasas"}'::jsonb,'{"pt-BR":"Brasas lentas e luz quente em movimento.","en":"Slow embers and moving warm light.","es":"Brasas lentas y luz cálida en movimiento."}'::jsonb,'profile-bg-emberstorm','rare',true,'starter','MGP original CSS cosmetic'),
  ('hextech-pulse','background','{"pt-BR":"Pulso Hextech","en":"Hextech Pulse","es":"Pulso Hextech"}'::jsonb,'{"pt-BR":"Circuitos e pulsos azul-dourados animados.","en":"Animated blue-gold circuits and pulses.","es":"Circuitos y pulsos azul-dorados animados."}'::jsonb,'profile-bg-hextech-pulse','epic',true,'starter','MGP original CSS cosmetic')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  css_class = excluded.css_class,
  rarity = excluded.rarity,
  animated = excluded.animated,
  acquisition_method = excluded.acquisition_method,
  rights_note = excluded.rights_note,
  active = true,
  updated_at = now();
