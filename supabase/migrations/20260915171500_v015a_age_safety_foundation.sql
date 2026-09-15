-- v0.1.5A — age/safety foundation for social features.
-- Exact birth date is deliberately kept out of public.profiles.
-- Missing age data must be treated by the application as restricted, never as adult.

create table if not exists public.account_age_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null,
  guardian_status text not null default 'not_applicable',
  age_assurance_method text not null default 'self_reported_birth_date',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_age_data_birth_date_reasonable check (birth_date >= date '1900-01-01' and birth_date <= current_date),
  constraint account_age_data_guardian_status_check check (guardian_status in ('not_applicable', 'required', 'pending', 'confirmed')),
  constraint account_age_data_assurance_method_check check (age_assurance_method in ('self_reported_birth_date', 'guardian_confirmed', 'provider_assured'))
);

comment on table public.account_age_data is 'Restricted age/safety data. Never expose birth_date on public profiles or use it for ad profiling.';
comment on column public.account_age_data.birth_date is 'Used only for age-band, safety and compliance decisions.';
comment on column public.account_age_data.guardian_status is 'Guardian confirmation is server-controlled; authenticated users do not receive a direct update policy for this table.';
comment on column public.account_age_data.age_assurance_method is 'self_reported_birth_date is an age signal, not high-assurance legal verification.';

alter table public.account_age_data enable row level security;

create policy "account_age_data_select_own"
  on public.account_age_data
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "account_age_data_insert_own"
  on public.account_age_data
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Deliberately no authenticated UPDATE policy.
-- Corrections, guardian confirmation and stronger age-assurance upgrades must go through
-- a trusted server-side/moderation flow rather than a client-writable status flag.

-- Presentation metadata for age-aware community UX. These labels never authorize prohibited content.
alter table public.posts add column if not exists audience_rating text not null default 'general';
alter table public.posts add column if not exists content_warning text;
alter table public.posts add column if not exists source_kind text not null default 'community';

comment on column public.posts.audience_rating is 'Presentation/safety label: general, teen or mature. MGP content rules still apply to every audience.';
comment on column public.posts.source_kind is 'Expected values: community, mgp_editorial or automation_draft.';
