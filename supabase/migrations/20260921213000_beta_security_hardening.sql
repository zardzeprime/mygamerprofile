-- Beta security hardening.
-- Reduce exposed privileges, harden SECURITY DEFINER RPCs, and add anti-flood
-- controls for community writes that could otherwise consume database/storage.

-- Internal tables are service-only. RLS already denied access, but table-level
-- grants are removed as a second layer of defense.
revoke all on table public.community_editorial_drafts from anon, authenticated;
revoke all on table public.mgp_content_catalog from anon, authenticated;
revoke all on table public.nexus_runtime_events from anon, authenticated;

drop policy if exists "No client access to editorial drafts" on public.community_editorial_drafts;
create policy "No client access to editorial drafts"
on public.community_editorial_drafts for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "No client access to MGP content catalog" on public.mgp_content_catalog;
create policy "No client access to MGP content catalog"
on public.mgp_content_catalog for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "No client access to NEXUS runtime events" on public.nexus_runtime_events;
create policy "No client access to NEXUS runtime events"
on public.nexus_runtime_events for all
to anon, authenticated
using (false)
with check (false);

-- User roles are readable only by the signed-in owner through RLS. Clients must
-- never be able to insert/update/delete their own role rows.
revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;

-- Public identity RPC intentionally exposes only fields whose individual
-- visibility flags are public. Empty search_path prevents object shadowing.
create or replace function public.get_public_profile_identity(p_user_id uuid)
returns table(gender_label text, country_code text, subdivision_code text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    case when d.gender_visibility = 'public' then d.gender_label else null end,
    case when d.country_visibility = 'public' then d.country_code else null end,
    case when d.subdivision_visibility = 'public' then d.subdivision_code else null end
  from public.profile_identity_details d
  join public.profiles p on p.id = d.user_id
  where d.user_id = p_user_id
    and (p.visibility = 'public' or (select auth.uid()) = p_user_id)
  limit 1;
$$;

-- Make RPC execution grants explicit rather than relying on defaults.
revoke all on function public.get_public_profile_identity(uuid) from public, anon, authenticated;
grant execute on function public.get_public_profile_identity(uuid) to anon, authenticated, service_role;

revoke all on function public.get_public_profile_loadout(uuid) from public, anon, authenticated;
grant execute on function public.get_public_profile_loadout(uuid) to anon, authenticated, service_role;

revoke all on function public.get_public_steam_showcase(uuid) from public, anon, authenticated;
grant execute on function public.get_public_steam_showcase(uuid) to anon, authenticated, service_role;

revoke all on function public.complete_mgp_onboarding_v1(text,text,text,date,text,text,text[]) from public, anon, authenticated;
grant execute on function public.complete_mgp_onboarding_v1(text,text,text,date,text,text,text[]) to authenticated, service_role;

revoke all on function public.ensure_profile_default_loadout(uuid) from public, anon, authenticated;
grant execute on function public.ensure_profile_default_loadout(uuid) to authenticated, service_role;

revoke all on function public.evaluate_profile_unlocks(uuid) from public, anon, authenticated;
grant execute on function public.evaluate_profile_unlocks(uuid) to authenticated, service_role;

revoke all on function public.save_user_build_v1(text,text,text,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.save_user_build_v1(text,text,text,jsonb,jsonb,text) to authenticated, service_role;

-- Anti-flood controls. These run below the UI layer, so direct REST calls are
-- still constrained.
create or replace function private.enforce_report_write_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if new.reporter_id is distinct from (select auth.uid()) then
    raise exception 'REPORT_OWNER_MISMATCH';
  end if;

  select count(*)::integer
    into recent_count
  from public.reports r
  where r.reporter_id = new.reporter_id
    and r.created_at >= now() - interval '1 hour';

  if recent_count >= 20 then
    raise exception 'REPORT_RATE_LIMIT';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_report_write_limit() from public, anon, authenticated;

drop trigger if exists trg_enforce_report_write_limit on public.reports;
create trigger trg_enforce_report_write_limit
before insert on public.reports
for each row execute function private.enforce_report_write_limit();

create or replace function private.enforce_feedback_write_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if new.user_id is distinct from (select auth.uid()) then
    raise exception 'FEEDBACK_OWNER_MISMATCH';
  end if;

  select count(*)::integer
    into recent_count
  from public.site_feedback f
  where f.user_id = new.user_id
    and f.created_at >= now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'FEEDBACK_RATE_LIMIT';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_feedback_write_limit() from public, anon, authenticated;

drop trigger if exists trg_enforce_feedback_write_limit on public.site_feedback;
create trigger trg_enforce_feedback_write_limit
before insert on public.site_feedback
for each row execute function private.enforce_feedback_write_limit();

create or replace function private.enforce_lfg_dm_write_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_sender_count integer;
  chat_count integer;
begin
  if new.sender_user_id is distinct from (select auth.uid()) then
    raise exception 'LFG_DM_SENDER_MISMATCH';
  end if;

  select count(*)::integer
    into recent_sender_count
  from public.lfg_dm_messages m
  where m.application_id = new.application_id
    and m.sender_user_id = new.sender_user_id
    and m.created_at >= now() - interval '1 minute';

  if recent_sender_count >= 30 then
    raise exception 'LFG_DM_RATE_LIMIT';
  end if;

  select count(*)::integer
    into chat_count
  from public.lfg_dm_messages m
  where m.application_id = new.application_id;

  if chat_count >= 500 then
    raise exception 'LFG_DM_CHAT_LIMIT';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_lfg_dm_write_limit() from public, anon, authenticated;

drop trigger if exists trg_enforce_lfg_dm_write_limit on public.lfg_dm_messages;
create trigger trg_enforce_lfg_dm_write_limit
before insert on public.lfg_dm_messages
for each row execute function private.enforce_lfg_dm_write_limit();
