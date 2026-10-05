# NEXUS Edge health contract

`nexus-inference` accepts a POST body with `{"type":"health"}` and returns only non-secret operational information:

- `ready`: whether at least one inference provider is configured in Edge runtime.
- `transport`: current Edge runtime identifier (`supabase-edge-v3`).
- `providers`: provider id, configured boolean and configured model name.

No API key, token or secret value is returned. The MG Profile client uses the same Edge gateway for guest/member traffic. Signed-in chat bootstrap now uses one `member.bootstrap` request so authentication, provider status and thread discovery do not require duplicate gateway/auth round trips.
