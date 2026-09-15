-- v0.1.5B — account identity, age verification and external account foundations.
-- Demographic and age-assurance data is intentionally kept out of public profiles.

create table if not exists public.account_demographics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender_identity text not null default 'prefer_not_to_say',
  gender_custom_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_demographics_gender_check
    check (gender_identity in ('male', 'female', 'non_binary', 'custom', 'prefer_not_to_say')),
  constraint account_demographics_custom_check
    check (
      (gender_identity = 'custom' and gender_custom_label is not null and char_length(trim(gender_custom_label)) between 1 and 60)
      or (gender_identity <> 'custom' and gender_custom_label is null)
    )
);

comment on table public.account_demographics is
  'Private account demographics. Not a public profile surface and not an advertising-targeting source.';

alter table public.account_demographics enable row level security;

create policy "account_demographics_select_own"
  on public.account_demographics for select to authenticated
  using (auth.uid() = user_id);

create policy "account_demographics_insert_own"
  on public.account_demographics for insert to authenticated
  with check (auth.uid() = user_id);

create policy "account_demographics_update_own"
  on public.account_demographics for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Strong 18+ assurance state. Raw identity documents do not belong in this table.
-- Prefer an external age-assurance provider that returns only a verdict/reference.
create table if not exists public.account_age_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'unverified',
  verified_over_18 boolean not null default false,
  method text,
  provider_name text,
  provider_reference text,
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_age_verifications_status_check
    check (status in ('unverified', 'pending', 'verified', 'rejected', 'expired')),
  constraint account_age_verifications_method_check
    check (method is null or method in ('document_provider', 'document_manual', 'government_identity_provider', 'other_approved_method')),
  constraint account_age_verifications_verified_consistency
    check ((status = 'verified' and verified_over_18 = true and verified_at is not null) or status <> 'verified')
);

comment on table public.account_age_verifications is
  '18+ assurance verdict and provenance only. Do not store raw RG/CNH/passport images here.';

alter table public.account_age_verifications enable row level security;

create policy "account_age_verifications_select_own"
  on public.account_age_verifications for select to authenticated
  using (auth.uid() = user_id);

-- No authenticated INSERT/UPDATE policy: verification state is written by trusted server/provider callbacks.

-- Public-to-owner metadata for account links. OAuth/access/refresh tokens are never stored here.
create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_user_id text not null,
  display_name text,
  status text not null default 'connected',
  granted_scopes text[] not null default '{}'::text[],
  public_metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  disconnected_at timestamptz,
  constraint connected_accounts_provider_check check (provider in ('steam', 'riot', 'google')),
  constraint connected_accounts_status_check check (status in ('connected', 'reauth_required', 'disconnected')),
  unique (user_id, provider),
  unique (provider, provider_user_id)
);

comment on table public.connected_accounts is
  'Owner-visible provider link metadata only. Provider secrets/tokens remain server-side.';

alter table public.connected_accounts enable row level security;

create policy "connected_accounts_select_own"
  on public.connected_accounts for select to authenticated
  using (auth.uid() = user_id);

-- Provider callbacks/service-role own writes and disconnect transitions.

-- Explicit age/access policy per supported game. This is separate from the visual rating label.
alter table public.games add column if not exists minimum_age smallint not null default 0;
alter table public.games add column if not exists age_gate_level text not null default 'none';

alter table public.games drop constraint if exists games_minimum_age_check;
alter table public.games add constraint games_minimum_age_check check (minimum_age between 0 and 18);
alter table public.games drop constraint if exists games_age_gate_level_check;
alter table public.games add constraint games_age_gate_level_check check (age_gate_level in ('none', 'account_age', 'verified_18'));

update public.games set minimum_age = 16, age_gate_level = 'account_age'
where slug in ('dark-souls-remastered', 'dark-souls-iii', 'elden-ring', 'elden-ring-nightreign', 'valorant');

update public.games set minimum_age = 12, age_gate_level = 'account_age'
where slug = 'league-of-legends';

update public.games set minimum_age = 0, age_gate_level = 'none'
where slug = 'ea-sports-fc';

comment on column public.games.minimum_age is
  'MGP access baseline in years. Re-evaluate per official Brazilian classification when adding/updating a title.';
comment on column public.games.age_gate_level is
  'none = no age gate; account_age = birth-date age band; verified_18 = strong adult assurance required.';
