# MGP v0.1.3A — VALORANT integration notes

## Static game content

The v0.1.3A Agents, Maps and Weapons collections are fetched server-side from Valorant-API as a temporary structured mirror. No player/account data is requested. The UI is intentionally provider-agnostic so the source can be replaced without rewriting the encyclopedia components.

Production target: Riot's Public Content Catalog / VAL-CONTENT-V1 where practical. Riot documents the Public Content Catalog as free-to-use VALORANT assets and metadata, but notes that catalog updates are a manual process and may lag behind a patch.

## Live VCT broadcasts

`src/lib/valorant-broadcast.functions.ts` is ready to query the official `@ValorantEsports` YouTube channel using YouTube Data API v3. Configure this secret only on the server/deployment environment:

```text
YOUTUBE_API_KEY=...
```

Do not expose the key through a `VITE_` variable or client-side bundle. Without the key, the site keeps the official editorial schedule visible and simply disables automatic live-video discovery.

The current implementation checks the official channel for `live` and `upcoming` broadcasts and caches the result briefly. A future provider sync can match an active broadcast to a specific scheduled match and persist status/results.

## Database

No second database is required. The existing Supabase project is sufficient. When automated esports synchronization is enabled, add a dedicated `esports_matches` table (game, competition, region, stage, scheduled_at, status, teams, logo URLs, broadcast URL, source and updated_at) and update it through a server-side job/Edge Function.

## Team logos

v0.1.3A uses styled team abbreviations rather than scraping logo assets from esports sites. Replace these with logo URLs only when the approved/official esports provider exposes them reliably.

## Riot notice

The site footer includes Riot's requested fan-project notice. Keep it visible while Riot-owned VALORANT assets are used.
