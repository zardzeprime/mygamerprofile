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

  insert into public.profile_loadouts(user_id,title_slug)
  values(
    target_user_id,
    case when exists(
      select 1 from public.profile_title_unlocks
      where user_id=target_user_id and title_slug='steam-linked'
    ) then 'steam-linked' else null end
  )
  on conflict(user_id) do update set
    title_slug=coalesce(public.profile_loadouts.title_slug,excluded.title_slug),
    updated_at=now();
end;
$$;
grant execute on function public.ensure_profile_default_loadout(uuid) to authenticated;
