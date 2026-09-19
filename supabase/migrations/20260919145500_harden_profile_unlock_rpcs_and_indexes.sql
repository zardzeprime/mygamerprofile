-- Restrict owner-only profile progression RPCs to authenticated callers.
-- Both functions also validate auth.uid() internally; this removes the default
-- PUBLIC execute grant so anonymous clients cannot invoke them at all.
revoke execute on function public.evaluate_profile_unlocks(uuid) from public, anon;
grant execute on function public.evaluate_profile_unlocks(uuid) to authenticated, service_role;

revoke execute on function public.ensure_profile_default_loadout(uuid) from public, anon;
grant execute on function public.ensure_profile_default_loadout(uuid) to authenticated, service_role;

-- Cover foreign keys used by profile progression/loadout joins and deletes.
create index if not exists profile_title_unlocks_title_slug_idx
  on public.profile_title_unlocks(title_slug);

create index if not exists profile_cosmetic_unlocks_cosmetic_slug_idx
  on public.profile_cosmetic_unlocks(cosmetic_slug);

create index if not exists profile_loadouts_title_slug_idx
  on public.profile_loadouts(title_slug);
