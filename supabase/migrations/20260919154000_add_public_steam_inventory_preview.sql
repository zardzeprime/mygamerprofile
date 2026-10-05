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
  share_library boolean;
  share_playtime boolean;
  share_achievements boolean;
  share_badges boolean;
  share_inventory boolean;
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

  -- Public availability is the intersection of the MGP preference and the
  -- latest upstream Steam privacy state. This prevents stale cached rows from
  -- becoming public after a user makes Game Details or Inventory private.
  share_library := sp.show_library and sp.library_visible;
  share_playtime := sp.show_playtime and sp.library_visible;
  share_achievements := sp.show_achievements and sp.library_visible;
  share_badges := sp.show_badges;
  share_inventory := sp.show_inventory and sp.inventory_visible;

  result := jsonb_build_object(
    'connected', true,
    'personaName', sp.persona_name,
    'profileUrl', sp.profile_url,
    'avatarUrl', sp.avatar_url,
    'countryCode', sp.country_code,
    'steamLevel', case when share_badges then sp.steam_level else null end,
    'libraryVisible', share_library,
    'inventoryVisible', share_inventory,
    'lastSyncedAt', sp.last_synced_at,
    'showLibrary', share_library,
    'showPlaytime', share_playtime,
    'showAchievements', share_achievements,
    'showBadges', share_badges,
    'showInventory', share_inventory,
    'libraryGameCount',
      case when share_library then (
        select count(*)
        from public.steam_games sg
        where sg.user_id = target_user_id
          and sg.owned = true
      ) else null end,
    'perfectGames',
      case when share_achievements then (
        select count(*)
        from public.steam_games sg
        where sg.user_id = target_user_id
          and sg.owned = true
          and sg.achievements_total > 0
          and sg.achievements_unlocked = sg.achievements_total
      ) else null end,
    'games',
      case when share_library then coalesce((
        select jsonb_agg(
          (to_jsonb(g) - 'sortPlaytime')
          order by
            case when share_playtime then g."sortPlaytime" end desc nulls last,
            g.name asc
        )
        from (
          select
            sg.app_id as "appId",
            sg.name,
            sg.icon_url as "iconUrl",
            case when share_playtime then sg.playtime_forever else null end as "playtimeMinutes",
            case when share_achievements then sg.achievements_unlocked else null end as "achievementsUnlocked",
            case when share_achievements then sg.achievements_total else null end as "achievementsTotal",
            case when share_achievements then sg.achievement_percent else null end as "achievementPercent",
            sg.playtime_forever as "sortPlaytime"
          from public.steam_games sg
          where sg.user_id = target_user_id
            and sg.owned = true
          order by
            case when share_playtime then sg.playtime_forever end desc nulls last,
            sg.name asc
          limit 12
        ) g
      ), '[]'::jsonb) else '[]'::jsonb end,
    'recentGames',
      case when share_playtime then coalesce((
        select jsonb_agg(
          (to_jsonb(r) - 'recentRank')
          order by r."recentRank" asc
        )
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
      case when share_achievements then (
        select jsonb_build_object(
          'unlocked', coalesce(sum(sg.achievements_unlocked), 0),
          'total', coalesce(sum(sg.achievements_total), 0),
          'gamesTracked', count(*) filter (where sg.achievements_total > 0)
        )
        from public.steam_games sg
        where sg.user_id = target_user_id
          and sg.owned = true
      ) else null end,
    'badgeCount', case when share_badges then sp.badge_count else null end,
    'xp', case when share_badges then sp.xp else null end,
    'inventoryItemCount',
      case when share_inventory then (
        select count(*)
        from public.steam_inventory_items si
        where si.user_id = target_user_id
      ) else null end,
    'inventoryItems',
      case when share_inventory then coalesce((
        select jsonb_agg(
          to_jsonb(i)
          order by i."appId" asc, i.name asc nulls last
        )
        from (
          select
            si.app_id as "appId",
            si.name,
            si.type,
            si.icon_url as "iconUrl",
            si.amount,
            si.tradable,
            si.marketable
          from public.steam_inventory_items si
          where si.user_id = target_user_id
          order by si.app_id asc, si.name asc nulls last
          limit 12
        ) i
      ), '[]'::jsonb) else '[]'::jsonb end
  );

  return result;
end;
$$;

revoke all on function public.get_public_steam_showcase(uuid) from public;
grant execute on function public.get_public_steam_showcase(uuid) to anon, authenticated;
