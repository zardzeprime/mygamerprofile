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
        select jsonb_agg(to_jsonb(g) order by g."playtimeMinutes" desc nulls last)
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
        select jsonb_agg((to_jsonb(r) - 'recentRank') order by r."recentRank" asc)
        from (
          select
            sg.app_id as "appId",
            sg.name,
            sg.icon_url as "iconUrl",
            sg.playtime_2weeks as "recentMinutes",
            sg.playtime_forever as "playtimeMinutes",
            sg.last_played_at as "lastPlayedAt",
            sg.recent_rank as "recentRank"
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
