# NEXUS provider failover

The Supabase Edge runtime accepts the configured provider order and skips providers without a backend secret.

Default Edge order for v0.1.9:

1. Gemini
2. Groq
3. OpenRouter
4. OpenAI
5. Anthropic

The legacy direct-server router remains a fallback for deployments that deliberately provide provider credentials to the TanStack server runtime. The browser never receives provider credentials.
