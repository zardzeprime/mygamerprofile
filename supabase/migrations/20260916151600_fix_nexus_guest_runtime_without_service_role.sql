create or replace function public.ensure_nexus_guest_session(p_session_id uuid default null)
returns table(
  session_id uuid,
  responses_used smallint,
  max_responses smallint,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_used smallint;
  v_max smallint;
  v_expires timestamptz;
begin
  if p_session_id is not null then
    select s.id, s.responses_used, s.max_responses, s.expires_at
      into v_id, v_used, v_max, v_expires
    from public.nexus_guest_sessions s
    where s.id = p_session_id
      and s.expires_at > now();

    if found then
      return query select v_id, v_used, v_max, v_expires;
      return;
    end if;
  end if;

  insert into public.nexus_guest_sessions default values
  returning id, responses_used, max_responses, expires_at
    into v_id, v_used, v_max, v_expires;

  return query select v_id, v_used, v_max, v_expires;
end;
$$;

create or replace function public.list_nexus_guest_messages(
  p_session_id uuid,
  p_limit integer default 40
)
returns table(
  id uuid,
  role text,
  content text,
  core_ids text[],
  provider text,
  model text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select q.id, q.role, q.content, q.core_ids, q.provider, q.model, q.created_at
  from (
    select m.id, m.role, m.content, m.core_ids, m.provider, m.model, m.created_at
    from public.nexus_guest_messages m
    join public.nexus_guest_sessions s on s.id = m.session_id
    where m.session_id = p_session_id
      and s.expires_at > now()
      and m.role in ('user', 'assistant')
    order by m.created_at desc
    limit greatest(1, least(coalesce(p_limit, 40), 80))
  ) q
  order by q.created_at asc;
$$;

create or replace function public.record_nexus_guest_exchange(
  p_session_id uuid,
  p_user_content text,
  p_assistant_content text,
  p_core_ids text[] default array['nexus']::text[],
  p_provider text default null,
  p_model text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table(
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
  v_recent integer;
begin
  if char_length(trim(coalesce(p_user_content, ''))) < 1 or char_length(p_user_content) > 2500 then
    raise exception 'NEXUS_GUEST_INVALID_CONTENT';
  end if;

  if char_length(trim(coalesce(p_assistant_content, ''))) < 1 or char_length(p_assistant_content) > 12000 then
    raise exception 'NEXUS_GUEST_INVALID_CONTENT';
  end if;

  select count(*)::integer into v_recent
  from public.nexus_guest_messages m
  where m.session_id = p_session_id
    and m.role = 'user'
    and m.created_at >= now() - interval '1 minute';

  if v_recent >= 6 then
    raise exception 'NEXUS_GUEST_RATE_LIMIT';
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
    session_id, role, content, core_ids, metadata
  ) values (
    p_session_id,
    'user',
    p_user_content,
    coalesce(p_core_ids, array['nexus']::text[]),
    coalesce(p_metadata, '{}'::jsonb)
  );

  insert into public.nexus_guest_messages (
    session_id, role, content, core_ids, provider, model, metadata
  ) values (
    p_session_id,
    'assistant',
    p_assistant_content,
    coalesce(p_core_ids, array['nexus']::text[]),
    p_provider,
    p_model,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_message_id;

  return query select v_message_id, v_used, (v_max - v_used)::smallint;
end;
$$;

revoke all on function public.ensure_nexus_guest_session(uuid) from public;
revoke all on function public.list_nexus_guest_messages(uuid, integer) from public;
revoke all on function public.record_nexus_guest_exchange(uuid, text, text, text[], text, text, jsonb) from public;

grant execute on function public.ensure_nexus_guest_session(uuid) to anon, authenticated;
grant execute on function public.list_nexus_guest_messages(uuid, integer) to anon, authenticated;
grant execute on function public.record_nexus_guest_exchange(uuid, text, text, text[], text, text, jsonb) to anon, authenticated;
