create table if not exists public.steam_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  steam_id text not null unique,
  persona_name text,
  profile_url text,
  avatar_url text,
  country_code text,
  community_visibility_state integer,
  steam_level integer,
  badge_count integer not null default 0,
  xp integer not null default 0,
  library_visible boolean not null default false,
  inventory_visible boolean not null default false,
  show_library boolean not null default true,
  show_playtime boolean not null default true,
  show_achievements boolean not null default true,
  show_badges boolean not null default true,
  show_inventory boolean not null default false,
  last_sync_status text not null default 'never'
    check (last_sync_status in ('never','syncing','ok','partial','error')),
  last_error text,
  last_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.steam_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id bigint not null,
  name text not null,
  icon_url text,
  playtime_forever integer not null default 0,
  playtime_2weeks integer not null default 0,
  last_played_at timestamptz,
  recent_rank integer,
  has_community_visible_stats boolean not null default false,
  achievements_unlocked integer not null default 0,
  achievements_total integer not null default 0,
  achievement_percent numeric(5,2) not null default 0,
  stats jsonb not null default '{}'::jsonb,
  achievements_synced_at timestamptz,
  last_synced_at timestamptz not null default now(),
  owned boolean not null default true,
  unique (user_id, app_id)
);

create table if not exists public.steam_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id bigint not null,
  api_name text not null,
  display_name text,
  description text,
  achieved boolean not null default false,
  unlock_time timestamptz,
  icon_url text,
  icon_gray_url text,
  last_synced_at timestamptz not null default now(),
  unique (user_id, app_id, api_name)
);

create table if not exists public.steam_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id integer not null,
  app_id bigint,
  level integer not null default 0,
  xp integer not null default 0,
  completion_time timestamptz,
  scarcity integer,
  community_item_id text,
  border_color integer,
  last_synced_at timestamptz not null default now()
);

create table if not exists public.steam_inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id bigint not null,
  context_id text not null,
  asset_id text not null,
  class_id text,
  instance_id text,
  amount bigint not null default 1,
  name text,
  market_name text,
  market_hash_name text,
  type text,
  icon_url text,
  tradable boolean not null default false,
  marketable boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  last_synced_at timestamptz not null default now(),
  unique (user_id, app_id, context_id, asset_id)
);

create index if not exists steam_games_user_playtime_idx
  on public.steam_games(user_id, playtime_forever desc);
create index if not exists steam_games_user_recent_idx
  on public.steam_games(user_id, recent_rank)
  where recent_rank is not null;
create index if not exists steam_achievements_user_app_idx
  on public.steam_achievements(user_id, app_id, achieved);
create index if not exists steam_badges_user_idx
  on public.steam_badges(user_id, xp desc);
create index if not exists steam_inventory_items_user_app_idx
  on public.steam_inventory_items(user_id, app_id);

alter table public.steam_profiles enable row level security;
alter table public.steam_games enable row level security;
alter table public.steam_achievements enable row level security;
alter table public.steam_badges enable row level security;
alter table public.steam_inventory_items enable row level security;

drop policy if exists steam_profiles_owner_all on public.steam_profiles;
create policy steam_profiles_owner_all
  on public.steam_profiles
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists steam_games_owner_all on public.steam_games;
create policy steam_games_owner_all
  on public.steam_games
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists steam_achievements_owner_all on public.steam_achievements;
create policy steam_achievements_owner_all
  on public.steam_achievements
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists steam_badges_owner_all on public.steam_badges;
create policy steam_badges_owner_all
  on public.steam_badges
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists steam_inventory_items_owner_all on public.steam_inventory_items;
create policy steam_inventory_items_owner_all
  on public.steam_inventory_items
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.get_public_steam_showcase(target_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  sp public.steam_profiles%rowtype;
  result jsonb;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and p.visibility = 'public'
  ) then
    return null;
  end if;

  select *
  into sp
  from public.steam_profiles
  where user_id = target_user_id;

  if not found then
    return null;
  end if;

  result := jsonb_build_object(
    'connected', true,
    'personaName', sp.persona_name,
    'profileUrl', sp.profile_url,
    'avatarUrl', sp.avatar_url,
    'countryCode', sp.country_code,
    'steamLevel', sp.steam_level,
    'libraryVisible', sp.library_visible,
    'inventoryVisible', sp.inventory_visible,
    'lastSyncedAt', sp.last_synced_at,
    'games',
      case when sp.show_library then coalesce((
        select jsonb_agg(to_jsonb(g) order by g.playtime_forever desc)
        from (
          select
            sg.app_id as "appId",
            sg.name,
            sg.icon_url as "iconUrl",
            case when sp.show_playtime then sg.playtime_forever else null end as "playtimeMinutes",
            case when sp.show_achievements then sg.achievements_unlocked else null end as "achievementsUnlocked",
            case when sp.show_achievements then sg.achievements_total else null end as "achievementsTotal",
            case when sp.show_achievements then sg.achievement_percent else null end as "achievementPercent"
          from public.steam_games sg
          where sg.user_id = target_user_id
            and sg.owned = true
          order by sg.playtime_forever desc
          limit 12
        ) g
      ), '[]'::jsonb) else '[]'::jsonb end,
    'recentGames',
      case when sp.show_playtime then coalesce((
        select jsonb_agg(to_jsonb(r) order by r.recent_rank asc)
        from (
          select
            sg.app_id as "appId",
            sg.name,
            sg.icon_url as "iconUrl",
            sg.playtime_2weeks as "recentMinutes",
            sg.playtime_forever as "playtimeMinutes",
            sg.last_played_at as "lastPlayedAt"
          from public.steam_games sg
          where sg.user_id = target_user_id
            and sg.owned = true
            and sg.recent_rank is not null
          order by sg.recent_rank asc
          limit 6
        ) r
      ), '[]'::jsonb) else '[]'::jsonb end,
    'achievementSummary',
      case when sp.show_achievements then (
        select jsonb_build_object(
          'unlocked', coalesce(sum(sg.achievements_unlocked), 0),
          'total', coalesce(sum(sg.achievements_total), 0),
          'gamesTracked', count(*) filter (where sg.achievements_total > 0)
        )
        from public.steam_games sg
        where sg.user_id = target_user_id
          and sg.owned = true
      ) else null end,
    'badgeCount', case when sp.show_badges then sp.badge_count else null end,
    'xp', case when sp.show_badges then sp.xp else null end,
    'inventoryItemCount',
      case when sp.show_inventory then (
        select count(*) from public.steam_inventory_items si
        where si.user_id = target_user_id
      ) else null end
  );

  return result;
end;
$$;

revoke all on function public.get_public_steam_showcase(uuid) from public;
grant execute on function public.get_public_steam_showcase(uuid) to anon, authenticated;

comment on table public.steam_profiles is
  'Owner-controlled Steam import summary and public showcase preferences.';
comment on table public.steam_games is
  'Owner-only Steam library/playtime cache populated from the official Steam Web API.';
comment on table public.steam_achievements is
  'Owner-only Steam achievement cache populated from Steam Web API data visible for the connected account.';
comment on table public.steam_badges is
  'Owner-only Steam badge cache.';
comment on table public.steam_inventory_items is
  'Owner-only best-effort cache of public Steam Community inventory items for supported game contexts.';
