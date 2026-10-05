create table if not exists public.nexus_runtime_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  provider text,
  detail text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.nexus_runtime_events enable row level security;

revoke all on table public.nexus_runtime_events from anon, authenticated;
grant select, insert on table public.nexus_runtime_events to service_role;

create index if not exists nexus_runtime_events_created_at_idx
  on public.nexus_runtime_events (created_at desc);
