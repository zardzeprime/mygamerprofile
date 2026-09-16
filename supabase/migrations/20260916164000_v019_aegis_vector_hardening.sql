-- MGP v0.1.9 AEGIS/VECTOR hardening.
-- Keeps the public profile helper intentionally callable while tightening guest-only NEXUS RPCs.

-- Guest trial RPCs are for anonymous visitors. Signed-in users use nexus_threads/nexus_messages.
revoke all on function public.ensure_nexus_guest_session(uuid) from public;
revoke all on function public.list_nexus_guest_messages(uuid, integer) from public;
revoke all on function public.record_nexus_guest_exchange(uuid, text, text, text[], text, text, jsonb) from public;

revoke execute on function public.ensure_nexus_guest_session(uuid) from authenticated;
revoke execute on function public.list_nexus_guest_messages(uuid, integer) from authenticated;
revoke execute on function public.record_nexus_guest_exchange(uuid, text, text, text[], text, text, jsonb) from authenticated;

grant execute on function public.ensure_nexus_guest_session(uuid) to anon, service_role;
grant execute on function public.list_nexus_guest_messages(uuid, integer) to anon, service_role;
grant execute on function public.record_nexus_guest_exchange(uuid, text, text, text[], text, text, jsonb) to anon, service_role;

-- Cache auth.uid() once per statement instead of recalculating it for every candidate row.
drop policy if exists account_age_data_insert_own on public.account_age_data;
create policy account_age_data_insert_own
on public.account_age_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists account_age_data_select_own on public.account_age_data;
create policy account_age_data_select_own
on public.account_age_data
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists account_age_verifications_select_own on public.account_age_verifications;
create policy account_age_verifications_select_own
on public.account_age_verifications
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists account_demographics_insert_own on public.account_demographics;
create policy account_demographics_insert_own
on public.account_demographics
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists account_demographics_select_own on public.account_demographics;
create policy account_demographics_select_own
on public.account_demographics
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists account_demographics_update_own on public.account_demographics;
create policy account_demographics_update_own
on public.account_demographics
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists connected_accounts_select_own on public.connected_accounts;
create policy connected_accounts_select_own
on public.connected_accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Cover editorial moderation/publishing foreign-key lookups.
create index if not exists community_editorial_drafts_published_post_id_idx
  on public.community_editorial_drafts (published_post_id)
  where published_post_id is not null;

create index if not exists community_editorial_drafts_reviewed_by_idx
  on public.community_editorial_drafts (reviewed_by)
  where reviewed_by is not null;
