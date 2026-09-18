# NEXUS provider failover

The Supabase Edge runtime accepts the configured provider order and skips providers without a backend secret.

Default Edge order for the current runtime:

1. Gemini
2. Groq
3. OpenAI
4. Anthropic
5. OpenRouter

The router is latency-bounded: fast providers receive shorter per-provider deadlines, the entire provider chain has an overall budget, and when multiple providers are configured NEXUS prefers immediate failover over retrying the same slow provider. Same-provider retry is reserved for the single-provider case.

MGP content grounding is best-effort and cached. A slow catalog/database lookup must not block a normal NEXUS answer.

The legacy direct-server router remains available only for deployments that deliberately provide provider credentials to the TanStack server runtime. Raw Edge `completion` calls remain disabled by default; in-product chat uses the authenticated/guest Edge actions.
