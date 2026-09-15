# MGP — Integrations & External Dependencies

This file is the control inventory for external systems currently used by or referenced by MGP. No private secret values belong in this document.

## Runtime / product dependencies

### Supabase
- Purpose: Authentication, PostgreSQL, Row Level Security, Storage, profile/game/social data.
- Project: `gudvdgpjfapshzqyfcpj` (`sa-east-1`).
- Client credential: publishable key only. It is intentionally public and must always be protected by RLS.
- Server/service-role key: **not committed to this repository**.
- Storage currently used by the product: avatars and post images. User banner writes are disabled as of v0.1.4C.
- Hosted Auth settings that remain dashboard-level: leaked-password protection and hosted email-template activation.

### VALORANT-API.com
- Purpose: temporary structured static provider for VALORANT agents, maps, weapons, skins, content tiers, chromas and available streamed preview metadata.
- Runtime location: server functions in `src/lib/valorant-content.functions.ts`.
- Authentication: none currently required.
- Status: temporary. Prefer Riot Public Content Catalog / approved Riot APIs where practical before a production-scale release.

### Riot Games / official VALORANT sources
- Purpose: authoritative patch notes, announcements, esports information, public game assets and editorial verification.
- Sources include `playvalorant.com`, `valorantesports.com`, Riot developer documentation and Riot public content resources.
- MGP includes the Riot fan-project disclaimer required by the Legal Jibber Jabber policy.

### YouTube
- Purpose: official game trailer embeds/links and prepared VALORANT live-broadcast discovery.
- Trailer embeds work without a private API key.
- Live discovery is prepared behind the server-only environment variable `YOUTUBE_API_KEY`.
- `YOUTUBE_API_KEY` must never use a `VITE_` prefix or be committed to Git.

### VLR.gg / owcdn
- Purpose: temporary external team/event logo references for VALORANT esports cards.
- Authentication: none.
- Risk: external hotlinks can change or disappear. Text/sigla fallbacks exist.
- Status: temporary; replace with approved/official or MGP-hosted authorized assets when possible.

### External game-art references
- Dark Souls Remastered cover currently references an external public cover-art mirror.
- VALORANT cover currently references an external public key-art mirror.
- Both have local MGP-generated fallback artwork.
- Risk: hotlink availability/licensing provenance. Production should prefer approved/local hosted assets.

### Google Fonts
- Purpose: Sora and Manrope web fonts.
- Loaded from Google Fonts in the root document.

## Development / infrastructure

### GitHub
- Source of truth for code, branches, pull requests and history.
- GitHub Actions runs production build and changed-source lint before merges used in the MGP workflow.
- Published history must not be rewritten with force-push/rebase/amend according to repository guidance.

### Lovable
- Connected development/preview workflow.
- Not treated as the source of truth; GitHub and Supabase remain independently controlled.
- MGP should remain portable away from Lovable as the project matures.

### ChatGPT / OpenAI
- Used as a development assistant for planning, code changes, research orchestration and repository/Supabase operations through authorized connectors.
- **No OpenAI model/API is embedded in the MGP runtime today.**
- There are no autonomous AI agents with direct production write access.

### VALORANT News Watch automation
- ChatGPT-side scheduled review automation, not an in-site AI service.
- Checks official Riot/VALORANT Esports sources.
- May create a GitHub branch + PR for missing official news/history.
- Must never auto-merge or write directly to `main`.
- Rumors, leaks and unofficial reposts are excluded.

## Editorial / research sources (not runtime APIs)

These have been used to verify or draft editorial information but are not application dependencies:
- Dark Souls Wikidot — mechanics/stat/scaling research.
- Bandai Namco / official YouTube channels — Dark Souls promotional references/trailers.
- Steam / official publishers — release/platform metadata.
- Metacritic / OpenCritic — reference critic-score snapshots.
- Riot Games official pages — VALORANT game/update/esports facts.

## Security rules for future integrations

1. Secrets stay server-side and out of `VITE_*`, Git history and client bundles.
2. New providers should have documented purpose, data provenance, license/usage terms and failure fallback.
3. No scraping of account/player data when an approved API exists.
4. External media should have a local/controlled fallback where practical.
5. Automated content updates must go through reviewable PRs unless a later audited ingestion pipeline is explicitly approved.
6. RLS remains the primary data boundary for all client-accessible Supabase tables and storage.
