# NEXUS Edge auth hotfix

The NEXUS Edge endpoint must serve both authenticated and guest MG Profile chat traffic. Supabase gateway JWT verification is therefore disabled for this function, while the function itself requires the project API key header, applies an origin allowlist for browser traffic, validates payload sizes/shapes, and rate-limits requests by IP.

Provider credentials remain backend-only Supabase secrets and are never returned to callers.

This is an application-level gateway for guest inference, not a substitute for user authentication. Signed-in thread ownership and guest quotas remain enforced by the MG Profile server/database layer.
