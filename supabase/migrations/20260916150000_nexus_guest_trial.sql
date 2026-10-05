create table if not exists public.nexus_guest_sessions (
  id uuid primary key,
  responses_used smallint not null default 0 check (responses_used between 0 and 10),
  max_responses smallint not null default 10 check (max_responses = 10),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create table if not exists public.nexus_guest_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.nexus_guest_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 12000),
  core_ids text[] not null default array['nexus']::text[],
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nexus_guest_sessions_expires_idx
  on public.nexus_guest_sessions (expires_at);
create index if not exists nexus_guest_messages_session_created_idx
  on public.nexus_guest_messages (session_id, created_at);

alter table public.nexus_guest_sessions enable row level security;
alter table public.nexus_guest_messages enable row level security;

-- Guest chat storage is server-only. The browser never receives direct table access;
-- the service-role server client is the only runtime allowed to read/write it.
create policy "No direct guest session access"
  on public.nexus_guest_sessions for all
  using (false)
  with check (false);
create policy "No direct guest message access"
  on public.nexus_guest_messages for all
  using (false)
  with check (false);

revoke all on table public.nexus_guest_sessions from anon, authenticated;
revoke all on table public.nexus_guest_messages from anon, authenticated;

create or replace function public.record_nexus_guest_assistant(
  p_session_id uuid,
  p_content text,
  p_core_ids text[] default array['nexus']::text[],
  p_provider text default null,
  p_model text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  message_id uuid,
  used_count smallint,
  remaining_count smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used smallint;
  v_max smallint;
  v_message_id uuid;
begin
  if char_length(p_content) < 1 or char_length(p_content) > 12000 then
    raise exception 'NEXUS_GUEST_INVALID_CONTENT';
  end if;

  update public.nexus_guest_sessions as s
  set responses_used = s.responses_used + 1,
      last_message_at = now()
  where s.id = p_session_id
    and s.expires_at > now()
    and s.responses_used < s.max_responses
  returning s.responses_used, s.max_responses into v_used, v_max;

  if not found then
    raise exception 'NEXUS_GUEST_LIMIT_REACHED';
  end if;

  insert into public.nexus_guest_messages (
    session_id,
    role,
    content,
    core_ids,
    provider,
    model,
    metadata
  ) values (
    p_session_id,
    'assistant',
    p_content,
    coalesce(p_core_ids, array['nexus']::text[]),
    p_provider,
    p_model,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_message_id;

  return query
    select v_message_id, v_used, (v_max - v_used)::smallint;
end;
$$;

revoke all on function public.record_nexus_guest_assistant(uuid, text, text[], text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_nexus_guest_assistant(uuid, text, text[], text, text, jsonb)
  to service_role;
