# MGP — Integrations & External Dependencies

This file is the control inventory for external systems currently used by or referenced by MGP. No private secret values belong in this document. Approval/readiness details live in `PLATFORM_READINESS.md`.

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

### Riot Games — VALORANT / League of Legends
- Current purpose: authoritative patch notes, announcements, esports information, public game assets and editorial verification.
- Future purpose: optional user-authorized Riot account linking and supported player/game data after product approval.
- Sources include `playvalorant.com`, `leagueoflegends.com`, Riot esports properties, Riot developer documentation and Riot public content resources.
- MGP includes the Riot fan-project disclaimer required by the Legal Jibber Jabber policy.
- Production player integrations must use a registered Riot product, production credentials and Riot Sign On where required/approved.
- `RIOT_API_KEY`, `RIOT_RSO_CLIENT_ID` and `RIOT_RSO_CLIENT_SECRET` are future **server-only** variables; none should be exposed in client bundles.
- Status: editorial/public-content use exists; production account integration is **not yet approved or enabled**.

### Steam / Valve
- Future purpose: link a user's Steam identity and import supported library/playtime/achievement data when the relevant Steam APIs and privacy settings allow it.
- Account ownership verification must use an official Steam authentication route appropriate for a community site.
- A normal Steam Web API user key and Steamworks publisher credentials are different capability levels; MGP must not assume publisher-only access.
- `STEAM_WEB_API_KEY` is a future **server-only** variable.
- Do not represent an inferred first-play date as an official Steam field. Any derived date must be labeled with its source/method.
- Status: planned, not enabled.

### Google Identity / OAuth
- Future purpose: optional Google sign-in/account authentication using the minimum identity scopes needed by MGP.
- Prefer `openid`, `email` and `profile`; unrelated sensitive/restricted scopes are out of scope unless a future feature clearly requires them.
- `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are future configuration. The secret is server-only.
- Production configuration requires accurate branding, authorized domains/redirect URIs and public Privacy/Terms URLs.
- Status: planned, not enabled.

### Google AdSense / advertising
- Future purpose: site monetization after content, privacy, consent and age-safety surfaces are production-ready.
- MGP must not use age-assurance data for advertising profiling.
- Identified minors must receive age-appropriate/non-profiled treatment in accordance with applicable law and provider tooling.
- Ad scripts must not be enabled before the consent/cookie implementation is ready.
- Status: planned; AdSense is not integrated in this revision.

### EA SPORTS FC / EA
- Current purpose: editorial/community hub and user-declared Game Profile data.
- EA's 2026 FC Community API rollout is limited to selected partners and, at this review point, is not accepting additional community-site applications.
- MGP therefore must not advertise EA account import as an available feature until EA actually grants an official route/access.
- The MGP catalog uses one durable `EA SPORTS FC` identity; annual editions remain metadata/content under that hub.
- Status: editorial/manual only.

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
- New v0.1.5A game entries initially use MGP-generated placeholder art rather than adding new unreviewed third-party hotlinks.
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
- v0.1.5A adds a server-only editorial draft queue and design document for a future in-site automation, but no model is currently authorized to publish directly to production.
- Any future `OPENAI_API_KEY` is server-only and must never receive Steam/Riot/Google/Supabase credentials in prompts.

### VALORANT News Watch automation
- ChatGPT-side scheduled review automation, not an in-site AI service.
- Checks official Riot/VALORANT Esports sources.
- May create a GitHub branch + PR for missing official news/history.
- Must never auto-merge or write directly to `main`.
- Rumors, leaks and unofficial reposts are excluded.

## Editorial / research sources (not runtime APIs)

These have been used to verify or draft editorial information but are not application dependencies:
- Dark Souls Wikidot — mechanics/stat/scaling research.
- Bandai Namco / FromSoftware official properties — Dark Souls, Elden Ring and Nightreign release/DLC references.
- Steam / official publishers — release/platform metadata and integration documentation.
- Metacritic / OpenCritic — reference critic-score snapshots where explicitly shown.
- Riot Games official pages — VALORANT / League game, update, esports and developer-policy facts.
- Electronic Arts official properties — EA SPORTS FC product and Community API status.
- Google official documentation — OAuth/verification and AdSense policy readiness.

## Security rules for future integrations

1. Secrets stay server-side and out of `VITE_*`, Git history and client bundles.
2. New providers should have documented purpose, data provenance, license/usage terms and failure fallback.
3. No scraping of account/player data when an approved API/authentication path exists.
4. Every connected-account provider needs explicit connect/disconnect behavior and clear provenance for imported data.
5. External media should have a local/controlled fallback where practical.
6. Automated community content starts as a sourced, auditable draft; direct autonomous production publishing is not the initial operating mode.
7. RLS remains the primary data boundary for all client-accessible Supabase tables and storage.
8. Age-assurance data is for safety/compliance and must not be repurposed for behavioral ad targeting.
9. If any real secret was historically committed, removing the file from the current tree is not sufficient; rotate the affected credential before production use.
