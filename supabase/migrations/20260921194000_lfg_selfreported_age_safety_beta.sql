-- Public beta LFG safety model.
-- Birth date remains private in account_age_data.
-- During beta, LFG uses self-reported birth date for safety bands; provider verification
-- infrastructure remains available for a future higher-assurance upgrade.

create table if not exists public.user_blocks (
  blocker_user_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint user_blocks_distinct_users_check check (blocker_user_id <> blocked_user_id)
);

alter table public.user_blocks enable row level security;

revoke all on table public.user_blocks from anon, authenticated;
grant select, insert, delete on table public.user_blocks to authenticated;
grant all on table public.user_blocks to service_role;

drop policy if exists "Users manage own blocks" on public.user_blocks;
drop policy if exists "Users can view own blocks" on public.user_blocks;
drop policy if exists "Users can create own blocks" on public.user_blocks;
drop policy if exists "Users can remove own blocks" on public.user_blocks;

create policy "Users can view own blocks"
on public.user_blocks for select
to authenticated
using (blocker_user_id = (select auth.uid()));

create policy "Users can create own blocks"
on public.user_blocks for insert
to authenticated
with check (blocker_user_id = (select auth.uid()));

create policy "Users can remove own blocks"
on public.user_blocks for delete
to authenticated
using (blocker_user_id = (select auth.uid()));

create index if not exists user_blocks_blocked_idx
  on public.user_blocks(blocked_user_id, blocker_user_id);

comment on table public.user_blocks is
  'Private block relationships. A blocked user is not informed through this table.';

create or replace function private.account_age_years(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select extract(year from age(current_date, ad.birth_date))::integer
  from public.account_age_data ad
  where ad.user_id = p_user_id;
$$;

revoke all on function private.account_age_years(uuid) from public, anon;
grant execute on function private.account_age_years(uuid) to authenticated;

create or replace function private.lfg_ages_compatible(p_age_a integer, p_age_b integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_age_a is null or p_age_b is null then false
    when p_age_a < 13 or p_age_b < 13 then false
    when least(p_age_a, p_age_b) <= 15
      then greatest(p_age_a, p_age_b) <= 16
    when least(p_age_a, p_age_b) <= 17
      then least(p_age_a, p_age_b) >= 16
       and greatest(p_age_a, p_age_b) <= 24
    else least(p_age_a, p_age_b) >= 18
  end;
$$;

revoke all on function private.lfg_ages_compatible(integer, integer) from public, anon;
grant execute on function private.lfg_ages_compatible(integer, integer) to authenticated;

create or replace function private.lfg_users_compatible(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.lfg_ages_compatible(
    private.account_age_years(p_user_a),
    private.account_age_years(p_user_b)
  );
$$;

revoke all on function private.lfg_users_compatible(uuid, uuid) from public, anon;
grant execute on function private.lfg_users_compatible(uuid, uuid) to authenticated;

create or replace function private.lfg_users_blocked(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_blocks ub
    where
      (ub.blocker_user_id = p_user_a and ub.blocked_user_id = p_user_b)
      or
      (ub.blocker_user_id = p_user_b and ub.blocked_user_id = p_user_a)
  );
$$;

revoke all on function private.lfg_users_blocked(uuid, uuid) from public, anon;
grant execute on function private.lfg_users_blocked(uuid, uuid) to authenticated;

create or replace function private.lfg_age_matches_post(p_user_id uuid, p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lfg_posts lp
    where lp.id = p_post_id
      and lp.user_id <> p_user_id
      and private.lfg_users_compatible(p_user_id, lp.user_id)
      and not private.lfg_users_blocked(p_user_id, lp.user_id)
  );
$$;

revoke all on function private.lfg_age_matches_post(uuid, uuid) from public, anon;
grant execute on function private.lfg_age_matches_post(uuid, uuid) to authenticated;

create or replace function public.apply_lfg_safety_age_range()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_age integer;
begin
  v_age := private.account_age_years(new.user_id);

  if v_age is null or v_age < 13 then
    raise exception 'LFG_AGE_REQUIRED';
  end if;

  if v_age <= 15 then
    new.min_age := 13;
    new.max_age := 16;
  elsif v_age = 16 then
    new.min_age := 13;
    new.max_age := 24;
  elsif v_age = 17 then
    new.min_age := 16;
    new.max_age := 24;
  elsif v_age <= 24 then
    new.min_age := 16;
    new.max_age := 99;
  else
    new.min_age := 18;
    new.max_age := 99;
  end if;

  return new;
end;
$$;

revoke all on function public.apply_lfg_safety_age_range() from public, anon, authenticated;

drop trigger if exists trg_apply_lfg_safety_age_range on public.lfg_posts;
create trigger trg_apply_lfg_safety_age_range
before insert or update of user_id
on public.lfg_posts
for each row execute function public.apply_lfg_safety_age_range();

update public.lfg_posts
set user_id = user_id
where status = 'open';

drop policy if exists "Verified users can request LFG matches" on public.lfg_applications;
drop policy if exists "Users can request LFG matches" on public.lfg_applications;
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
      and lp.slots_open > 0
      and lp.user_id <> (select auth.uid())
  )
);

create or replace function public.enforce_lfg_application_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  owner_id uuid;
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

  select lp.user_id into owner_id
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
      update public.lfg_posts
      set slots_open = slots_open - 1,
          updated_at = now()
      where id = new.lfg_post_id
        and status = 'open'
        and slots_open > 0;

      if not found then
        raise exception 'LFG_NO_SLOTS_AVAILABLE';
      end if;
    end if;
  elsif new.status = 'cancelled' then
    if new.applicant_user_id is distinct from (select auth.uid()) then
      raise exception 'LFG_APPLICANT_REQUIRED';
    end if;
    new.responded_at := now();
  else
    raise exception 'LFG_INVALID_TRANSITION';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop policy if exists "Matched users can send LFG DMs" on public.lfg_dm_messages;
drop policy if exists "Age-compatible matched users can send LFG DMs" on public.lfg_dm_messages;

create policy "Age-compatible matched users can send LFG DMs"
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
      and private.lfg_users_compatible(la.applicant_user_id, lp.user_id)
      and not private.lfg_users_blocked(la.applicant_user_id, lp.user_id)
      and (
        (sender_user_id = la.applicant_user_id and recipient_user_id = lp.user_id)
        or
        (recipient_user_id = la.applicant_user_id and sender_user_id = lp.user_id)
      )
  )
);

alter table public.reports
  drop constraint if exists reports_reason_check,
  add constraint reports_reason_check
    check (
      reason in (
        'spam',
        'harassment',
        'hate',
        'sexual_content',
        'extreme_violence',
        'scam',
        'age_misrepresentation',
        'unsafe_contact',
        'other'
      )
    ),
  drop constraint if exists reports_target_type_check,
  add constraint reports_target_type_check
    check (target_type in ('profile','post','comment','lfg','lfg_message'));
