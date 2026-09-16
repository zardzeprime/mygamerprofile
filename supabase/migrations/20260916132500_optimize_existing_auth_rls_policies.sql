-- Optimize existing owner-only RLS policies without changing access semantics.

drop policy if exists "account_age_data_insert_own" on public.account_age_data;
create policy "account_age_data_insert_own" on public.account_age_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "account_age_data_select_own" on public.account_age_data;
create policy "account_age_data_select_own" on public.account_age_data
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "account_age_verifications_select_own" on public.account_age_verifications;
create policy "account_age_verifications_select_own" on public.account_age_verifications
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "account_demographics_insert_own" on public.account_demographics;
create policy "account_demographics_insert_own" on public.account_demographics
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "account_demographics_select_own" on public.account_demographics;
create policy "account_demographics_select_own" on public.account_demographics
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "account_demographics_update_own" on public.account_demographics;
create policy "account_demographics_update_own" on public.account_demographics
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "connected_accounts_select_own" on public.connected_accounts;
create policy "connected_accounts_select_own" on public.connected_accounts
  for select to authenticated using ((select auth.uid()) = user_id);
