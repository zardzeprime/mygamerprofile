drop function if exists public.has_role(uuid, public.app_role);

revoke all on type public.app_role from public, anon, authenticated;
grant usage on type public.app_role to authenticated, service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;