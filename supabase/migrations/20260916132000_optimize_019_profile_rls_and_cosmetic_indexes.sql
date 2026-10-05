-- Optimize 0.1.9 profile/cosmetic policies and foreign-key access paths.

drop policy if exists "identity owner select" on public.profile_identity_details;
create policy "identity owner select" on public.profile_identity_details
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "identity owner insert" on public.profile_identity_details;
create policy "identity owner insert" on public.profile_identity_details
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "identity owner update" on public.profile_identity_details;
create policy "identity owner update" on public.profile_identity_details
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "identity owner delete" on public.profile_identity_details;
create policy "identity owner delete" on public.profile_identity_details
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "inventory owner select" on public.profile_inventory;
create policy "inventory owner select" on public.profile_inventory
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "inventory owner insert" on public.profile_inventory;
create policy "inventory owner insert" on public.profile_inventory
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "inventory owner delete" on public.profile_inventory;
create policy "inventory owner delete" on public.profile_inventory
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "loadout owner or public profile select" on public.profile_loadouts;
create policy "loadout owner or public profile select" on public.profile_loadouts
  for select to anon, authenticated using (
    (select auth.uid()) = user_id or exists (
      select 1 from public.profiles p where p.id = user_id and p.visibility = 'public'
    )
  );
drop policy if exists "loadout owner insert" on public.profile_loadouts;
create policy "loadout owner insert" on public.profile_loadouts
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "loadout owner update" on public.profile_loadouts;
create policy "loadout owner update" on public.profile_loadouts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists profile_cosmetics_game_slug_idx on public.profile_cosmetics(game_slug);
create index if not exists profile_inventory_cosmetic_slug_idx on public.profile_inventory(cosmetic_slug);
create index if not exists profile_loadouts_background_slug_idx on public.profile_loadouts(background_slug);
create index if not exists profile_loadouts_banner_slug_idx on public.profile_loadouts(banner_slug);
create index if not exists profile_loadouts_chibi_slug_idx on public.profile_loadouts(chibi_slug);
