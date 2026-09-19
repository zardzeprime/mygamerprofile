create table if not exists public.steam_link_states (
  state_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.steam_link_states enable row level security;

drop policy if exists steam_link_states_insert_own on public.steam_link_states;
create policy steam_link_states_insert_own
  on public.steam_link_states
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create index if not exists steam_link_states_user_id_idx
  on public.steam_link_states(user_id);

create index if not exists steam_link_states_expires_at_idx
  on public.steam_link_states(expires_at);

comment on table public.steam_link_states is
  'Short-lived one-time state hashes used to bind Steam OpenID callbacks to authenticated MGP users.';
