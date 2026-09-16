# NEXUS runtime

NEXUS is the MGP mother/orchestrator AI. This document describes the runtime that powers the in-product chat and the boundary between inference providers and administrative tools.

## 1. Two separate centers

NEXUS deliberately separates **reasoning/inference** from **actions/tools**.

### Inference providers

These providers generate NEXUS responses through official server-side APIs:

1. **OpenAI** — default model `gpt-5.6-sol`
2. **Google Gemini** — default model `gemini-3.8-flash`
3. **Anthropic Claude** — default model `claude-sonnet-4-6`

The order is configured with `NEXUS_PROVIDER_ORDER`. If a configured provider fails, the router tries the next configured provider. The assistant message stores the provider/model that actually answered and the providers attempted.

Consumer subscriptions are not treated as API credentials. Do not automate consumer chat sessions, browser cookies or hidden web UI calls to imitate normal human usage. Integrations must use official APIs, OAuth, MCP or supported project tools.

### Administrative tool bridges

These systems provide context/actions rather than generic inference:

- **GitHub** — repository-scoped GitHub App; branch/commit/PR workflow.
- **Supabase** — project-limited Management API/OAuth access; reviewed migrations.
- **Lovable** — official Lovable MCP server (`https://mcp.lovable.dev`) through OAuth.

Lovable's Agent can therefore become a tool NEXUS delegates build work to, but it is not modeled as a drop-in generic LLM endpoint.

## 2. Chat experiences

### Global Gamer mode

The NEXUS launcher is global across the MGP site.

Visitors who are not signed in can use a **10-response anonymous trial**. The first visible chat message is a local NEXUS greeting and does not consume the quota. Each successfully generated assistant response consumes one of the ten trial responses. Once the quota reaches zero, the composer locks and the visitor is asked to sign in or create an MGP profile.

Guest chat characteristics:

- no email is required;
- an HTTP-only, SameSite=Lax server session stores only an opaque guest UUID;
- the server-side guest record expires after 30 days;
- direct browser access to guest chat tables is denied;
- the quota is incremented atomically when an assistant response is recorded;
- a per-session short-window rate limit reduces abuse and accidental rapid retries;
- MGP does not use raw device fingerprinting merely to enforce the free trial;
- messages can be sent to the official AI provider selected by the NEXUS model router.

Clearing browser cookies may produce a new anonymous session. Preventing that completely would require stronger identity or device tracking, which is intentionally not part of the guest MVP.

Authenticated users continue using Gamer mode with persistent account-scoped conversation history. Gamer mode uses a relaxed gaming-native personality while keeping internal repository and administrative details private.

### Development mode

Restricted to users with the `admin` role in `public.user_roles`. Development mode can discuss MGP internals and routes work to specialist cores (AEGIS, VEIL, ATLAS, PULSE, GEAR, VECTOR).

Development mode does **not** automatically grant external GitHub/Supabase/Lovable credentials. Each tool bridge must be separately authorized.

## 3. Persistence

Authenticated conversation history is stored in:

- `public.nexus_threads`
- `public.nexus_messages`

Both tables use RLS and are scoped to the authenticated user.

Anonymous trial state is stored separately in:

- `public.nexus_guest_sessions`
- `public.nexus_guest_messages`

Guest tables are server-only: RLS deny policies and revoked `anon`/`authenticated` table grants prevent the client from reading or writing them directly. The trusted backend uses the service-role client only for this narrowly scoped workflow.

Messages may store:

- role/content;
- selected specialist cores;
- provider/model;
- basic runtime metadata;
- timestamp.

Do not store provider API keys, OAuth refresh tokens or other secrets in chat tables.

## 4. Human approval boundary

NEXUS may discuss and prepare changes autonomously, but destructive or production-impacting operations require explicit human approval before execution. Examples include:

- deleting data/tables/files;
- force pushes or history rewriting;
- production deployments;
- auth/security policy changes with broad impact;
- destructive Supabase migrations;
- changing external integration permissions.

Prefer reversible workflows: branch -> diff/review -> merge, and migration -> review -> apply.

## 5. Provider and guest-session configuration

Server-only environment variables:

```text
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
NEXUS_PROVIDER_ORDER=openai,gemini,anthropic
NEXUS_OPENAI_MODEL=gpt-5.6-sol
NEXUS_GEMINI_MODEL=gemini-3.8-flash
NEXUS_ANTHROPIC_MODEL=claude-sonnet-4-6
NEXUS_GUEST_SESSION_SECRET=
```

`NEXUS_GUEST_SESSION_SECRET` should be a random value with at least 32 characters. The runtime can temporarily derive the guest-cookie secret from the server-only Supabase service-role credential when the dedicated secret is absent, but a dedicated secret is preferred for key separation.

At least one inference provider must be configured for NEXUS to generate live responses. The local first-message greeting can render without a model call.

## 6. Model strategy

The default strategy is **failover**, not sending every prompt to every model. This keeps latency, privacy exposure and cost under control.

Later, NEXUS may support an explicit `council` mode for difficult admin-only tasks. In council mode, a bounded number of providers can independently analyze the same problem and NEXUS can synthesize their outputs. It must be opt-in because it multiplies inference cost and data disclosure.

## 7. Brand provenance

The NEXUS brand/provenance boundary is documented in `docs/NEXUS_BRAND_PROVENANCE.md`. Personal legal identifiers such as CPF, private phone numbers and identity documents must not be committed to the repository merely to prove ownership.

## 8. Current limitations

- The MGP runtime does not inherit ChatGPT account memory, ChatGPT Plus quotas or ChatGPT connectors.
- Anonymous guest history is not automatically merged into an account after sign-in; that can become an explicit opt-in feature later.
- A scheduled expired-guest cleanup job is still pending; expiry is already recorded in the schema.
- The Lovable MCP OAuth client is registered architecturally but still needs a runtime MCP client + user authorization before NEXUS can invoke it from the MGP server.
- GitHub and Supabase administrative bridges likewise need their own scoped credentials before in-product execution is enabled.
- Specialist cores are routing contracts today; they become independent agents only when a real worker/runtime is implemented for them.
