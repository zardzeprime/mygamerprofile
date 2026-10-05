# NEXUS provider failover

The Supabase Edge runtime accepts the configured provider order and skips providers without a backend secret.

Default provider order for the current runtime:

1. Gemini
2. Groq
3. OpenAI
4. Anthropic
5. OpenRouter

Inside Gemini, Gamer/low-effort mode prioritizes capacity and latency with:
`gemini-3.5-flash-lite → gemini-3.6-flash → gemini-3.1-flash-lite → gemini-3.7-flash → configured primary`.

Development/medium-high effort keeps the configured primary (currently 3.8 Flash) first, then steps down to stable Flash/Lite fallbacks.

The router is latency-bounded: fast providers receive shorter per-provider deadlines, the entire provider chain has an overall budget, and when multiple providers are configured NEXUS prefers immediate failover over retrying the same slow provider. Same-provider retry is reserved for the single-provider case.

MGP content grounding is best-effort and cached. A slow catalog/database lookup must not block a normal NEXUS answer.

The legacy direct-server router remains available only for deployments that deliberately provide provider credentials to the TanStack server runtime. Raw Edge `completion` calls remain disabled by default; in-product chat uses the authenticated/guest Edge actions.


Provider-chain failures are written to the private `nexus_runtime_events` table with sanitized provider/model error context. This table is service-role only and exists so transient capacity/timeout failures can be diagnosed without exposing provider errors to site visitors.
