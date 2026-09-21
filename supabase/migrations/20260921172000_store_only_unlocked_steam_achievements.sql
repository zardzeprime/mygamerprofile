-- Keep detailed Steam achievement rows only for unlocked achievements.
-- Aggregate totals/progress remain stored in public.steam_games.

delete from public.steam_achievements
where achieved = false;

alter table public.steam_achievements
  alter column achieved set default true;

alter table public.steam_achievements
  drop constraint if exists steam_achievements_unlocked_only_check,
  add constraint steam_achievements_unlocked_only_check
    check (achieved = true);

comment on table public.steam_achievements is
  'Detailed Steam achievements unlocked by the user. Locked achievements are intentionally not persisted; per-game totals remain in steam_games.';
