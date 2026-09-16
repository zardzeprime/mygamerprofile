# MGP v0.1.9 — AEGIS/VEIL security review

Reviewed against the production Supabase state on 2026-09-16.

## Applied

- Removed `authenticated` execution from guest-only NEXUS trial RPCs; they remain available to `anon` and `service_role`.
- Replaced seven per-row `auth.uid()` RLS evaluations with statement-cached `(select auth.uid())` policies.
- Added covering indexes for the editorial draft reviewer and published-post foreign keys.
- Deployed the NEXUS inference boundary as a JWT-verified Supabase Edge Function.

## Intentional, documented SECURITY DEFINER RPCs

The following functions remain `SECURITY DEFINER` because the underlying tables are not directly readable by their callers:

- `get_public_profile_identity(uuid)`: callable by `anon` and `authenticated`; returns only fields whose individual visibility is public, unless the caller owns the profile. It does not return birth date or private account demographics.
- `ensure_nexus_guest_session(uuid)`, `list_nexus_guest_messages(uuid, integer)`, and `record_nexus_guest_exchange(...)`: guest-trial RPCs callable by `anon` and `service_role`. Session IDs are opaque UUIDs, content is bounded, the trial has a response quota, and writes are rate-limited.

These exceptions must be re-reviewed whenever function bodies or grants change.

## Still account/dashboard configuration, not repository code

- Enable leaked-password protection if not already enabled in the Supabase Auth dashboard.
- Configure a production custom SMTP provider and MG Profile sender domain before relying on Supabase Auth email at scale.
- Review password policy and redirect allowlists before v0.2.
- Configure Google OAuth credentials and test account linking/recovery when Google connection work begins.

## Release boundary

No Riot, Google, SMTP, NEXUS provider, or service-role secret may be committed to GitHub or exposed through a `VITE_*` variable. Production provider keys belong in backend/Supabase secret configuration only.
