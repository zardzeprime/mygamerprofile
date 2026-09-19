create or replace function public.ensure_profile_default_loadout(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if (select auth.uid()) is distinct from target_user_id
     and coalesce((select auth.role()),'') <> 'service_role' then
    raise exception 'not_allowed';
  end if;

  insert into public.profile_loadouts(
    user_id,background_slug,avatar_frame_slug,effect_slug,title_slug
  )
  values(
    target_user_id,
    case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='obsidian') then 'obsidian' else null end,
    case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='clean-ring') then 'clean-ring' else null end,
    case when exists(select 1 from public.profile_cosmetic_unlocks where user_id=target_user_id and cosmetic_slug='soft-glow') then 'soft-glow' else null end,
    case when exists(select 1 from public.profile_title_unlocks where user_id=target_user_id and title_slug='steam-linked') then 'steam-linked' else null end
  )
  on conflict(user_id) do update set
    background_slug=coalesce(public.profile_loadouts.background_slug,excluded.background_slug),
    avatar_frame_slug=coalesce(public.profile_loadouts.avatar_frame_slug,excluded.avatar_frame_slug),
    effect_slug=coalesce(public.profile_loadouts.effect_slug,excluded.effect_slug),
    title_slug=coalesce(public.profile_loadouts.title_slug,excluded.title_slug),
    updated_at=now();
end;
$$;
grant execute on function public.ensure_profile_default_loadout(uuid) to authenticated;
