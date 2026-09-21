-- Ephemeral LFG lifecycle for the public beta.
-- Groups and match DMs are intentionally short-lived to keep the MGP database lean.
-- Reported conversations remain available while moderation is pending/reviewing.

alter table public.lfg_posts
  add column if not exists group_ttl_hours smallint not null default 24,
  add column if not exists chat_ttl_hours smallint not null default 24;

alter table public.lfg_posts
  drop constraint if exists lfg_posts_group_ttl_hours_check,
  add constraint lfg_posts_group_ttl_hours_check
    check (group_ttl_hours in (6, 12, 24, 48)),
  drop constraint if exists lfg_posts_chat_ttl_hours_check,
  add constraint lfg_posts_chat_ttl_hours_check
    check (chat_ttl_hours in (6, 12, 24, 48));

alter table public.lfg_applications
  add column if not exists chat_expires_at timestamptz;

comment on column public.lfg_posts.group_ttl_hours is
  'How long the LFG listing remains open: 6, 12, 24 or 48 hours.';
comment on column public.lfg_posts.chat_ttl_hours is
  'How long a text DM remains available after a match is accepted: 6, 12, 24 or 48 hours.';
comment on column public.lfg_applications.chat_expires_at is
  'Expiration time for the temporary text DM created by an accepted match.';

create or replace function public.apply_lfg_lifecycle_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.group_ttl_hours is distinct from old.group_ttl_hours then
    new.expires_at := now() + make_interval(hours => new.group_ttl_hours);
  end if;
  return new;
end;
$$;

revoke all on function public.apply_lfg_lifecycle_defaults() from public, anon, authenticated;

drop trigger if exists trg_apply_lfg_lifecycle_defaults on public.lfg_posts;
create trigger trg_apply_lfg_lifecycle_defaults
before insert or update of group_ttl_hours
on public.lfg_posts
for each row execute function public.apply_lfg_lifecycle_defaults();

update public.lfg_posts
set expires_at = coalesce(expires_at, created_at + make_interval(hours => group_ttl_hours))
where expires_at is null;

create or replace function public.enforce_lfg_application_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  owner_id uuid;
  v_chat_ttl_hours smallint;
begin
  if new.lfg_post_id <> old.lfg_post_id
     or new.applicant_user_id <> old.applicant_user_id then
    raise exception 'LFG_APPLICATION_IDENTITY_IMMUTABLE';
  end if;

  if new.status = old.status then
    return new;
  end if;

  if old.status <> 'pending' then
    raise exception 'LFG_APPLICATION_FINAL';
  end if;

  select lp.user_id, lp.chat_ttl_hours
    into owner_id, v_chat_ttl_hours
  from public.lfg_posts lp
  where lp.id = new.lfg_post_id;

  if new.status in ('accepted','rejected') then
    if owner_id is distinct from (select auth.uid()) then
      raise exception 'LFG_OWNER_REQUIRED';
    end if;

    if not private.lfg_users_compatible(owner_id, new.applicant_user_id) then
      raise exception 'LFG_AGE_MISMATCH';
    end if;

    if private.lfg_users_blocked(owner_id, new.applicant_user_id) then
      raise exception 'LFG_BLOCKED';
    end if;

    new.responded_at := now();

    if new.status = 'accepted' then
      new.chat_expires_at := now() + make_interval(hours => coalesce(v_chat_ttl_hours, 24));

      update public.lfg_posts
      set slots_open = slots_open - 1,
          updated_at = now()
      where id = new.lfg_post_id
        and status = 'open'
        and expires_at > now()
        and slots_open > 0;

      if not found then
        raise exception 'LFG_NO_SLOTS_AVAILABLE';
      end if;
    else
      new.chat_expires_at := null;
    end if;
  elsif new.status = 'cancelled' then
    if new.applicant_user_id is distinct from (select auth.uid()) then
      raise exception 'LFG_APPLICANT_REQUIRED';
    end if;
    new.responded_at := now();
    new.chat_expires_at := null;
  else
    raise exception 'LFG_INVALID_TRANSITION';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop policy if exists "Matched users can read LFG DMs" on public.lfg_dm_messages;
drop policy if exists "Matched users can read active LFG DMs" on public.lfg_dm_messages;
drop policy if exists "Admins can read LFG DMs for moderation" on public.lfg_dm_messages;
drop policy if exists "Participants or admins can read active LFG DMs" on public.lfg_dm_messages;

create policy "Participants or admins can read active LFG DMs"
on public.lfg_dm_messages for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'::public.app_role
  )
  or (
    ((select auth.uid()) = sender_user_id or (select auth.uid()) = recipient_user_id)
    and exists (
      select 1
      from public.lfg_applications la
      join public.lfg_posts lp on lp.id = la.lfg_post_id
      where la.id = application_id
        and la.status = 'accepted'
        and la.chat_expires_at is not null
        and la.chat_expires_at > now()
        and (
          (sender_user_id = la.applicant_user_id and recipient_user_id = lp.user_id)
          or
          (recipient_user_id = la.applicant_user_id and sender_user_id = lp.user_id)
        )
    )
  )
);

drop policy if exists "Age-compatible matched users can send LFG DMs" on public.lfg_dm_messages;
create policy "Age-compatible users can send active LFG DMs"
on public.lfg_dm_messages for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1
    from public.lfg_applications la
    join public.lfg_posts lp on lp.id = la.lfg_post_id
    where la.id = application_id
      and la.status = 'accepted'
      and la.chat_expires_at is not null
      and la.chat_expires_at > now()
      and private.lfg_users_compatible(la.applicant_user_id, lp.user_id)
      and not private.lfg_users_blocked(la.applicant_user_id, lp.user_id)
      and (
        (sender_user_id = la.applicant_user_id and recipient_user_id = lp.user_id)
        or
        (recipient_user_id = la.applicant_user_id and sender_user_id = lp.user_id)
      )
  )
);

create index if not exists lfg_posts_expires_idx
  on public.lfg_posts(status, expires_at)
  where status = 'open';

create index if not exists lfg_applications_chat_expires_idx
  on public.lfg_applications(chat_expires_at)
  where status = 'accepted' and chat_expires_at is not null;

create or replace function public.cleanup_expired_lfg_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired_groups integer := 0;
  v_deleted_messages integer := 0;
  v_deleted_applications integer := 0;
  v_deleted_posts integer := 0;
begin
  update public.lfg_posts
  set status = 'expired',
      updated_at = now()
  where status = 'open'
    and expires_at is not null
    and expires_at <= now();

  get diagnostics v_expired_groups = row_count;

  delete from public.lfg_dm_messages m
  using public.lfg_applications la
  where m.application_id = la.id
    and la.status = 'accepted'
    and la.chat_expires_at is not null
    and la.chat_expires_at <= now()
    and not exists (
      select 1
      from public.reports r
      join public.lfg_dm_messages flagged
        on flagged.id = r.target_id
      where flagged.application_id = m.application_id
        and r.target_type = 'lfg_message'
        and r.status in ('pending','reviewing')
    );

  get diagnostics v_deleted_messages = row_count;

  delete from public.lfg_applications la
  where (
      la.status in ('rejected','cancelled')
      and la.updated_at <= now() - interval '7 days'
    )
    or (
      la.status = 'pending'
      and la.updated_at <= now() - interval '7 days'
      and exists (
        select 1
        from public.lfg_posts lp
        where lp.id = la.lfg_post_id
          and (lp.status <> 'open' or lp.expires_at <= now())
      )
    )
    or (
      la.status = 'accepted'
      and la.chat_expires_at is not null
      and la.chat_expires_at <= now() - interval '7 days'
      and not exists (
        select 1
        from public.lfg_dm_messages m
        where m.application_id = la.id
      )
    );

  get diagnostics v_deleted_applications = row_count;

  delete from public.lfg_posts lp
  where lp.status in ('expired','closed')
    and lp.updated_at <= now() - interval '7 days'
    and not exists (
      select 1
      from public.lfg_applications la
      where la.lfg_post_id = lp.id
    )
    and not exists (
      select 1
      from public.reports r
      where r.target_type = 'lfg'
        and r.target_id = lp.id
        and r.status in ('pending','reviewing')
    );

  get diagnostics v_deleted_posts = row_count;

  return jsonb_build_object(
    'expired_groups', v_expired_groups,
    'deleted_messages', v_deleted_messages,
    'deleted_applications', v_deleted_applications,
    'deleted_posts', v_deleted_posts
  );
end;
$$;

revoke all on function public.cleanup_expired_lfg_data() from public, anon, authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
    into existing_job_id
  from cron.job
  where jobname = 'mgp-lfg-expiry-cleanup'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'mgp-lfg-expiry-cleanup',
    '17 * * * *',
    'select public.cleanup_expired_lfg_data();'
  );
end;
$$;


drop policy if exists "Age-compatible users can request LFG matches" on public.lfg_applications;
create policy "Age-compatible users can request LFG matches"
on public.lfg_applications for insert
to authenticated
with check (
  applicant_user_id = (select auth.uid())
  and private.lfg_age_matches_post(applicant_user_id, lfg_post_id)
  and exists (
    select 1
    from public.lfg_posts lp
    where lp.id = lfg_post_id
      and lp.status = 'open'
      and lp.expires_at is not null
      and lp.expires_at > now()
      and lp.slots_open > 0
      and lp.user_id <> (select auth.uid())
  )
);
