-- NEXUS guest persistence is accessed only by the server-side Edge Function.
-- Keep SECURITY DEFINER helpers off the public Data API so anonymous/authenticated
-- clients cannot call them directly and bypass the Edge gateway controls.

revoke execute on function public.ensure_nexus_guest_session(uuid)
  from public, anon, authenticated;

revoke execute on function public.list_nexus_guest_messages(uuid, integer)
  from public, anon, authenticated;

revoke execute on function public.record_nexus_guest_exchange(
  uuid,
  text,
  text,
  text[],
  text,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function public.ensure_nexus_guest_session(uuid)
  to service_role;

grant execute on function public.list_nexus_guest_messages(uuid, integer)
  to service_role;

grant execute on function public.record_nexus_guest_exchange(
  uuid,
  text,
  text,
  text[],
  text,
  text,
  jsonb
) to service_role;
