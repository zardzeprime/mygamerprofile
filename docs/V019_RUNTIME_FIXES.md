# MG Profile v0.1.9 — runtime fixes

Applied in the `fix/v0-1-9-nexus-profile-alerts` stabilization branch.

## NEXUS

- Production inference is routed through the Supabase Edge Function `nexus-inference`.
- Provider secrets stay in backend/Edge Function secret storage and are never moved to `VITE_*` variables or browser code.
- Edge failover supports Gemini, Groq, OpenRouter, OpenAI and Anthropic.
- The app reports readiness from the Edge runtime instead of assuming Lovable secrets are visible in the TanStack server `process.env`.
- Direct server provider calls remain a deployment fallback.

## Profiles

- The account menu resolves the current profile with the authenticated browser Supabase client and exposes `Ver meu perfil` / `View my profile` / `Ver mi perfil` before settings.
- A failed profile lookup is visible as an unavailable state instead of silently removing the menu entry.

## VALORANT competitive compendium

- VLR.gg is the editorial reference for teams, rosters, events and competitive context.
- ProSettings.net is the reference for sensitivity, eDPI, crosshair, video and gear.
- Champions Shanghai 2026 teams and rosters are seeded with provenance.
- Fast-changing player settings are copied into MGP only after individual verification; unverified entries link to the live ProSettings directory rather than publishing guessed values.

## Operations

- AVAPGV Watch is the operational alert channel for AEGIS, VEIL, ATLAS, PULSE, GEAR, VECTOR and NEXUS findings.
- Alerts must never contain secret values or credentials.
