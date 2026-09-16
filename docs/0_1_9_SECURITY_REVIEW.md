# MGP v0.1.9 — AEGIS/VEIL security review

Reviewed against the Supabase security and performance advisors on 2026-09-16.

## Fixed by the accompanying migration

- Remove `authenticated` execution from guest-only NEXUS trial RPCs.
- Replace seven per-row `auth.uid()` RLS evaluations with statement-cached `(select auth.uid())`.
- Add covering indexes for the editorial draft reviewer and published-post foreign keys.

## Intentional, documented SECURITY DEFINER RPCs

The following functions remain `SECURITY DEFINER` because the underlying tables are not directly readable by their callers:

- `get_public_profile_identity(uuid)`: callable by `anon` and `authenticated`; returns only fields whose individual visibility is public, unless the caller owns the profile. It does not return birth date or private account demographics.
- `ensure_nexus_guest_session(uuid)`, `list_nexus_guest_messages(uuid, integer)`, and `record_nexus_guest_exchange(...)`: callable by `anon` for the guest trial and by `service_role` for server operations. Session IDs are opaque UUIDs, content is bounded, the trial has a response quota, and writes are rate-limited.

These exceptions should be re-reviewed whenever their function bodies or grants change.

## Dashboard-only actions before v0.2

- Enable leaked-password protection.
- Configure a production custom SMTP provider and MGP sender domain.
- Review password policy and redirect allowlists.
- Configure Google OAuth credentials and test account linking/recovery.
- Re-run security and performance advisors after applying this migration.

## Release boundary

No Riot, Google, SMTP, NEXUS provider, or service-role secret may be committed to GitHub or exposed through a `VITE_*` variable. Production keys belong in hosting/Supabase secret configuration only.
