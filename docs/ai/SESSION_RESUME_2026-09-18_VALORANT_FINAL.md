# MG Profile — session resume — VALORANT completion + profile customization
Date: 2026-09-18

## Repository state
- Repository: zardzeprime/mygamerprofile
- Working branch: `chatgpt/finish-valorant-customization-20260918`
- Base main when branch was created: `aebd6d180aa8867d8a101c0d5fba3a05932b9191`
- Product: MG Profile
- Persistent council state: `docs/ai/core-state.json`

## Product direction reaffirmed
MG Profile is not only a game wiki/esports reader. Its core is:
- gamer identity / My Gamer Profile;
- social communities and forum-style discussion;
- LFG and finding people to play with;
- guides, builds and tutorials;
- favorite games, achievements and future connected-platform data;
- deep visual profile customization.

The intended delivery sequence after this VALORANT completion pass is:
1. League of Legends
2. Dark Souls Remastered + Dark Souls III
3. Elden Ring
4. broader public test / reception

## VALORANT mobile overview fix
The screenshot bug was a mobile min-content overflow, not a content-data issue.

Changed:
- `src/routes/games.$slug.tsx`
  - explicit `grid-cols-[minmax(0,1fr)]` before the desktop two-column breakpoint;
  - `min-w-0` and `overflow-hidden` on the overview article;
  - wrapping on synopsis/fact text.
- `src/components/games/GameLivePanel.tsx`
  - `min-w-0` on the VALORANT aside.

Goal: VALORANT “Sobre o jogo” must frame like the Dark Souls mobile overview instead of being clipped horizontally.

## VALORANT pro-settings exhaustive pass
At the start of this pass:
- 350 roster entries
- 349 unique normalized handles
- 234 sourced settings keys
- 115 unique handles without settings

All 115 initially missing unique handles were attempted individually against public current sources. This was manual source/identity review, not bulk scraping.

Five source-safe records were added:
- Jerrwin
- Eggsterr, reconciled with ProSettings Eggster using ENVY/VLR identity context
- P0PPIN, reconciled with ProSettings Poppin using real-name/team context
- Boni
- alvinboy, reconciled with ProSettings Alvin using Alvin Hong / M80 context

Current expected coverage:
- 350 players
- 239 sourced settings
- 319 verified/observed role labels
- at least 55 crosshair codes
- 111 roster entries still lack settings
- 110 unique normalized handles remain unresolved

The complete attempted/unresolved list and ambiguity notes are in:
`docs/editorial/VALORANT_PRO_SETTINGS_AUDIT_2026-09-18.md`

Important rejection examples:
- current MGP `natz` is not nAts;
- current MGP `Laz` is not Koji Laz Ushida;
- current VLR `Dingwei` identity conflicts with the ProSettings person found;
- do not equate Cloudy/Cloud, Coco/coconut, Krst1Ng/k1Ng, or generic Zeus matches.

Never fill unresolved values by inference.

## Profile customization foundation
Production Supabase and repository migrations now reserve loadout slots for:
- background
- banner
- avatar frame
- cursor
- profile effect
- chibi/mascot
- badges (existing max 6)

Database additions:
- `profile_cosmetics.kind` now accepts `avatar_frame`, `cursor`, `profile_effect`
- `profile_loadouts.avatar_frame_slug`
- `profile_loadouts.cursor_slug`
- `profile_loadouts.effect_slug`
- covering indexes for all three new foreign-key columns

New frontend foundation:
- `src/config/profileCustomization.ts`
- `src/components/profile/ProfileCustomizationStudio.tsx`
- integrated in `settings.profile.tsx`
- original CSS concept previews in `src/profile-backgrounds.css`

Concept collections:
- MGP Core
- Peregrino das Cinzas / Ashen Pilgrim
- Protocolo de Sinal / Signal Protocol
- Arco do Rift / Rift Arc

Only existing background presets are actually equipable in this pass. The other selectors are honest “foundation ready” previews, not fake saved features.

Game-inspired cosmetics must use MGP-original assets or a documented licensed/permissioned/reusable source.

## Official VALORANT news automation
Registered source priority:
1. VALORANT Brasil Riot News
2. VALORANT Esports Brasil
3. VALORANT // Brasil official YouTube
4. VALORANT Brasil Instagram — API required
5. VALORANT Brasil TikTok — API required
6. global Riot News fallback/editorial reference

Files:
- `src/data/valorantOfficialSources.ts`
- `scripts/valorant-news-watch.mjs`
- `.github/workflows/valorant-news-watch.yml`
- `docs/editorial/valorant-news-candidates.json`
- `docs/editorial/VALORANT_NEWS_AUTOMATION.md`

The daily workflow:
- scheduled at 10:25 UTC;
- discovers first-party metadata only;
- updates a candidate JSON queue;
- opens/updates a review PR;
- never auto-merges or directly publishes to the live feed.

Instagram/TikTok are not scraped around platform restrictions. They remain API/connector-required.

The static public feed was also refreshed with current official Brazil-facing items, including Champions Shanghai Opening Day, the 2026 Champions anthem and the September development update.

## Validation / database notes
- CI now includes `node --check scripts/valorant-news-watch.mjs`.
- `check:valorant` regression floors were raised to settings >= 239 and crosshairs >= 55.
- Supabase advisor re-check after indexing shows no unindexed-FK warning for the new customization slots.
- Existing unrelated Supabase advisories remain around older RLS/security-definer/auth configuration and unused indexes; they were not introduced by this pass.

## Remaining VALORANT constraints
Structurally this pass is intended to close VALORANT after CI/rendered validation.

Source-bound gaps remain:
- 111/350 roster entries still have no verified public settings match after individual review.
- Missing settings remain hidden, not fabricated.
- Instagram/TikTok automatic ingestion waits for an approved API/connector.
- Official social discovery creates review candidates; it is not an uncontrolled auto-publisher.

## Resume prompt
Continue MG Profile from this handoff. Read this document and `docs/ai/core-state.json` first. Preserve source/provenance rules and do not infer missing pro-player data. Confirm the current branch/PR/CI state before editing. Finish any failing validation for the VALORANT completion pass, merge only after CI is green, verify Lovable sync, and then move the primary content-development focus to League of Legends. Keep MG Profile centered on gamer identity, communities/forum discussion, LFG, guides/builds/tutorials and deeply customizable profiles. Use original MGP visuals for game-inspired cosmetics unless reuse rights are explicitly documented.
