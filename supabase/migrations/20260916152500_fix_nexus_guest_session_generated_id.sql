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

  insert into public.nexus_guest_sessions as s (id)
  values (gen_random_uuid())
  returning s.id, s.responses_used, s.max_responses, s.expires_at
    into v_id, v_used, v_max, v_expires;

  return query select v_id, v_used, v_max, v_expires;
end;
$$;
