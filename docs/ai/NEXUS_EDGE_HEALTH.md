# NEXUS Edge health contract

`nexus-inference` accepts a POST body with `{"type":"health"}` and returns only non-secret operational information:

- `ready`: whether at least one inference provider is configured in Edge runtime.
- `transport`: `supabase-edge`.
- `providers`: provider id, configured boolean and configured model name.

No API key, token or secret value is returned. The MG Profile server uses this contract to decide whether the NEXUS UI should show the inference engine as ready.
