-- Profile game highlight + external LFG game sources.
-- Backward-compatible additions: existing Steam showcase and catalog LFG rows keep working.

alter table public.steam_profiles
  add column if not exists favorite_app_id bigint,
  add column if not exists favorite_started_year smallint,
  add column if not exists favorite_started_on date,
  add column if not exists favorite_show_playtime boolean not null default true,
  add column if not exists proud_achievement_api_names text[] not null default '{}'::text[];

alter table public.steam_profiles
  drop constraint if exists steam_profiles_favorite_started_year_check,
  add constraint steam_profiles_favorite_started_year_check
    check (
      favorite_started_year is null
      or favorite_started_year between 1970 and 2100
    ),
  drop constraint if exists steam_profiles_proud_achievement_count_check,
  add constraint steam_profiles_proud_achievement_count_check
    check (cardinality(proud_achievement_api_names) <= 3);

comment on column public.steam_profiles.favorite_app_id is
  'Steam app selected by the owner as the main game highlight on their MGP profile.';
comment on column public.steam_profiles.favorite_started_year is
  'Owner-provided year they started playing the highlighted game.';
comment on column public.steam_profiles.favorite_started_on is
  'Optional owner-provided exact date they started playing the highlighted game.';
comment on column public.steam_profiles.proud_achievement_api_names is
  'Up to three unlocked Steam achievement API names selected by the owner.';

create or replace function public.get_public_steam_profile_highlight(target_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  sp public.steam_profiles%rowtype;
  sg public.steam_games%rowtype;
  achievements jsonb := '[]'::jsonb;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and (p.visibility = 'public' or (select auth.uid()) = target_user_id)
  ) then
    return null;
  end if;

  select *
  into sp
  from public.steam_profiles
  where user_id = target_user_id
  limit 1;

  if sp.user_id is null or sp.favorite_app_id is null then
    return null;
  end if;

  select *
  into sg
  from public.steam_games
  where user_id = target_user_id
    and app_id = sp.favorite_app_id
    and owned = true
  limit 1;

  if sg.id is null then
    return null;
  end if;

  if sp.show_achievements and cardinality(sp.proud_achievement_api_names) > 0 then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'apiName', sa.api_name,
          'name', coalesce(sa.display_name, sa.api_name),
          'description', sa.description,
          'unlockTime', sa.unlock_time,
          'iconUrl', sa.icon_url
        )
        order by array_position(sp.proud_achievement_api_names, sa.api_name)
      ),
      '[]'::jsonb
    )
    into achievements
    from public.steam_achievements sa
    where sa.user_id = target_user_id
      and sa.app_id = sp.favorite_app_id
      and sa.achieved = true
      and sa.api_name = any(sp.proud_achievement_api_names);
  end if;

  return jsonb_build_object(
    'appId', sg.app_id,
    'name', sg.name,
    'iconUrl', sg.icon_url,
    'playtimeMinutes',
      case
        when sp.show_playtime and sp.favorite_show_playtime then sg.playtime_forever
        else null
      end,
    'startedYear', sp.favorite_started_year,
    'startedOn', sp.favorite_started_on,
    'achievements', achievements
  );
end;
$$;

revoke all on function public.get_public_steam_profile_highlight(uuid) from public;
grant execute on function public.get_public_steam_profile_highlight(uuid) to anon, authenticated;

alter table public.lfg_posts
  alter column game_id drop not null,
  add column if not exists external_game_source text,
  add column if not exists external_game_id text,
  add column if not exists external_game_name text;

alter table public.lfg_posts
  drop constraint if exists lfg_posts_external_game_source_check,
  add constraint lfg_posts_external_game_source_check
    check (
      external_game_source is null
      or external_game_source in ('steam', 'riot')
    ),
  drop constraint if exists lfg_posts_game_reference_check,
  add constraint lfg_posts_game_reference_check
    check (
      game_id is not null
      or (
        external_game_source is not null
        and nullif(btrim(external_game_id), '') is not null
        and nullif(btrim(external_game_name), '') is not null
      )
    );

create index if not exists lfg_posts_external_game_idx
  on public.lfg_posts(external_game_source, external_game_id)
  where external_game_source is not null;

comment on column public.lfg_posts.external_game_source is
  'External catalog source used when the LFG game is not a native MGP catalog row.';
comment on column public.lfg_posts.external_game_id is
  'Provider game identifier, such as a Steam app id.';
comment on column public.lfg_posts.external_game_name is
  'Display name cached at LFG creation time for an external game.';
