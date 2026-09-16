# NEXUS inference Edge Function

This function is the secure inference boundary for MG Profile.

Expected custom Supabase Edge Function secrets (configure only the providers you use):

- `OPENAI_API_KEY`
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `ANTHROPIC_API_KEY`

Optional routing/model overrides:

- `NEXUS_PROVIDER_ORDER`
- `NEXUS_OPENAI_MODEL`
- `NEXUS_GEMINI_MODEL`
- `NEXUS_GROQ_MODEL`
- `NEXUS_OPENROUTER_MODEL`
- `NEXUS_ANTHROPIC_MODEL`
- `PUBLIC_APP_URL`

Never prefix model-provider secrets with `VITE_` and never place their values in source control.
