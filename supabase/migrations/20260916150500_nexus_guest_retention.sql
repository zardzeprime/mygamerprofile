create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'nexus-guest-expiry-cleanup',
  '23 4 * * *',
  $$delete from public.nexus_guest_sessions where expires_at < now();$$
);
