-- Expand LFG into verified-age matchmaking with text-only post-match DMs.
-- Raw identity documents are intentionally not stored by MGP.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.account_age_verifications
  drop constraint if exists account_age_verifications_verified_consistency,
  add constraint account_age_verifications_verified_consistency
    check (
      (status = 'verified' and verified_at is not null)
      or (status <> 'verified' and verified_over_18 = false)
    );

comment on table public.account_age_verifications is
  'Age/identity assurance verdict and provenance only. Supports verified minors and adults. Raw identity documents must never be stored here.';

alter table public.lfg_posts
  add column if not exists title text,
  add column if not exists scheduled_for timestamptz,
  add column if not exists min_age smallint not null default 13,
  add column if not exists max_age smallint not null default 99,
  add column if not exists external_game_image_url text;

alter table public.lfg_posts
  drop constraint if exists lfg_posts_title_length_check,
  add constraint lfg_posts_title_length_check
    check (title is null or char_length(btrim(title)) between 3 and 120),
  drop constraint if exists lfg_posts_age_range_check,
  add constraint lfg_posts_age_range_check
    check (min_age between 13 and 99 and max_age between 13 and 99 and min_age <= max_age),
  drop constraint if exists lfg_posts_external_game_image_url_check,
  add constraint lfg_posts_external_game_image_url_check
    check (
      external_game_image_url is null
      or char_length(external_game_image_url) <= 1000
    );

comment on column public.lfg_posts.scheduled_for is
  'Optional date/time the group plans to play.';
comment on column public.lfg_posts.min_age is
  'Minimum verified age required to request a match with this group.';
comment on column public.lfg_posts.max_age is
  'Maximum verified age allowed to request a match with this group.';
comment on column public.lfg_posts.external_game_image_url is
  'Cached external game artwork/icon URL for LFG cards when the game is not in the native MGP catalog.';

create or replace function private.is_provider_age_verified(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.account_age_verifications av
      join public.account_age_data ad on ad.user_id = av.user_id
      where av.user_id = p_user_id
        and av.status = 'verified'
        and av.verified_at is not null
        and (av.expires_at is null or av.expires_at > now())
        and ad.age_assurance_method = 'provider_assured'
    );
$$;

revoke all on function private.is_provider_age_verified(uuid) from public, anon;
grant execute on function private.is_provider_age_verified(uuid) to authenticated;

create or replace function private.lfg_age_matches_post(p_user_id uuid, p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.account_age_data ad
      join public.account_age_verifications av on av.user_id = ad.user_id
      join public.lfg_posts lp on lp.id = p_post_id
      where ad.user_id = p_user_id
        and ad.age_assurance_method = 'provider_assured'
        and av.status = 'verified'
        and av.verified_at is not null
        and (av.expires_at is null or av.expires_at > now())
        and extract(year from age(current_date, ad.birth_date))::int between lp.min_age and lp.max_age
    );
$$;

revoke all on function private.lfg_age_matches_post(uuid, uuid) from public, anon;
grant execute on function private.lfg_age_matches_post(uuid, uuid) to authenticated;

drop policy if exists "Users can create LFG posts" on public.lfg_posts;
create policy "Verified users can create LFG posts"
on public.lfg_posts for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and private.is_provider_age_verified(user_id)
);

create table if not exists public.lfg_applications (
  id uuid primary key default gen_random_uuid(),
  lfg_post_id uuid not null references public.lfg_posts(id) on delete cascade,
  applicant_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint lfg_applications_status_check
    check (status in ('pending','accepted','rejected','cancelled')),
  constraint lfg_applications_note_check
    check (note is null or char_length(note) <= 500),
  unique (lfg_post_id, applicant_user_id)
);

alter table public.lfg_applications enable row level security;

revoke all on table public.lfg_applications from anon, authenticated;
grant select, insert, update on table public.lfg_applications to authenticated;
grant all on table public.lfg_applications to service_role;

create policy "Participants can read LFG applications"
on public.lfg_applications for select
to authenticated
using (
  applicant_user_id = (select auth.uid())
  or exists (
    select 1 from public.lfg_posts lp
    where lp.id = lfg_post_id
      and lp.user_id = (select auth.uid())
  )
);

create policy "Verified users can request LFG matches"
on public.lfg_applications for insert
to authenticated
with check (
  applicant_user_id = (select auth.uid())
  and private.is_provider_age_verified(applicant_user_id)
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

create policy "LFG participants can update application state"
on public.lfg_applications for update
to authenticated
using (
  applicant_user_id = (select auth.uid())
  or exists (
    select 1 from public.lfg_posts lp
    where lp.id = lfg_post_id
      and lp.user_id = (select auth.uid())
  )
)
with check (
  applicant_user_id = (select auth.uid())
  or exists (
    select 1 from public.lfg_posts lp
    where lp.id = lfg_post_id
      and lp.user_id = (select auth.uid())
  )
);

create index if not exists lfg_applications_post_status_idx
  on public.lfg_applications(lfg_post_id, status, created_at desc);
create index if not exists lfg_applications_applicant_status_idx
  on public.lfg_applications(applicant_user_id, status, created_at desc);

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

    if not private.is_provider_age_verified(owner_id) then
      raise exception 'LFG_OWNER_VERIFICATION_REQUIRED';
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

drop trigger if exists trg_enforce_lfg_application_transition on public.lfg_applications;
create trigger trg_enforce_lfg_application_transition
before update on public.lfg_applications
for each row execute function public.enforce_lfg_application_transition();

create table if not exists public.lfg_dm_messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.lfg_applications(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint lfg_dm_messages_body_check
    check (char_length(btrim(body)) between 1 and 2000),
  constraint lfg_dm_messages_distinct_users_check
    check (sender_user_id <> recipient_user_id)
);

alter table public.lfg_dm_messages enable row level security;

revoke all on table public.lfg_dm_messages from anon, authenticated;
grant select, insert on table public.lfg_dm_messages to authenticated;
grant update(read_at) on table public.lfg_dm_messages to authenticated;
grant all on table public.lfg_dm_messages to service_role;

create policy "Matched users can read LFG DMs"
on public.lfg_dm_messages for select
to authenticated
using (
  ((select auth.uid()) = sender_user_id or (select auth.uid()) = recipient_user_id)
  and exists (
    select 1
    from public.lfg_applications la
    join public.lfg_posts lp on lp.id = la.lfg_post_id
    where la.id = application_id
      and la.status = 'accepted'
      and (
        (sender_user_id = la.applicant_user_id and recipient_user_id = lp.user_id)
        or
        (recipient_user_id = la.applicant_user_id and sender_user_id = lp.user_id)
      )
  )
);

create policy "Matched users can send LFG DMs"
on public.lfg_dm_messages for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and private.is_provider_age_verified(sender_user_id)
  and exists (
    select 1
    from public.lfg_applications la
    join public.lfg_posts lp on lp.id = la.lfg_post_id
    where la.id = application_id
      and la.status = 'accepted'
      and (
        (sender_user_id = la.applicant_user_id and recipient_user_id = lp.user_id)
        or
        (recipient_user_id = la.applicant_user_id and sender_user_id = lp.user_id)
      )
  )
);

create policy "Recipients can mark LFG DMs read"
on public.lfg_dm_messages for update
to authenticated
using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

create index if not exists lfg_dm_messages_application_created_idx
  on public.lfg_dm_messages(application_id, created_at);
create index if not exists lfg_dm_messages_recipient_unread_idx
  on public.lfg_dm_messages(recipient_user_id, read_at)
  where read_at is null;


create index if not exists lfg_dm_messages_sender_idx
  on public.lfg_dm_messages(sender_user_id, created_at desc);
