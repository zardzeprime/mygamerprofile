# MGP Game Lifecycle Watch

Status: active, review-gated.

## Purpose

Keep public game pages accurate as live-service games change. The watch is broader than the VALORANT news feed: it tracks data that can silently become stale, including patches, competitive map pools, agents/champions, items, modes, skins/cosmetics and competitive calendars.

## Council ownership

- **Vassago / PULSE** — content lifecycle owner. Decides whether a detected change materially affects public MGP data.
- **Marbas / GEAR** — automation owner. Runs the daily official-source scan and keeps the detection/review pipeline healthy.
- **Andrealphus / VECTOR** — UX/consistency reviewer. Checks that an accurate data change is also represented clearly in desktop/mobile UI.
- **Andromalius / ATLAS** remains responsible whenever a change introduces new external media or licensing/provenance questions.

This does not create an eighth Council member; it formalizes a lifecycle responsibility inside Os Sete.

## Daily sources

Official-first sources currently watched:

1. Riot Games VALORANT game updates / patch notes.
2. Riot Games League of Legends game updates / patch notes.
3. Riot Data Dragon version feed.
4. Existing dedicated VALORANT official-news automation remains responsible for Riot/VALORANT Esports/official YouTube news discovery.

The watch is allowed to use secondary sources only during human/AI review to clarify a roster or competitive fact that Riot does not expose in a reusable structured form. A secondary source never overrides a contradictory official Riot source.

## Current verified baselines — 2026-09-18

### VALORANT

- Latest published gameplay patch: **13.05**.
- Current Competitive/Deathmatch map pool after Patch 13.04:
  - Abyss
  - Ascent
  - Haven
  - Lotus
  - Split
  - Summit
  - Sunset
- Patch-chain provenance for the current pool is tracked from official Riot rotation notes. Public MGP data should not infer rotation from the full map API catalog.
- Champions Shanghai starts **2026-09-24**; the current seeded group schedule is source-checked against VALORANT Esports.

### League of Legends

- Latest patch: **26.18**.
- Latest Riot Data Dragon version: **16.18.1**.
- Current special/live editorial modes include **Arena**, **ARAM: Desordem** and **League of Legends Classic**. Their availability/rules remain patch-sensitive.
- Champion/item/icon/splash payloads should prefer current Data Dragon instead of frozen hand-entered stats.

## Review contract

The workflow runs daily and writes only candidate changes to `docs/editorial/game-lifecycle-candidates.json`. If new candidates exist, it opens or updates a GitHub pull request. It never auto-merges.

Before a candidate changes a public page:

1. Confirm the source is first-party/official when one exists.
2. Confirm the effective patch/date.
3. Determine whether the site currently presents the affected fact as live/current.
4. Update the smallest source-of-truth data structure possible.
5. Run regression checks/build/lint.
6. Have Andrealphus check mobile/desktop representation when layout or density changes.
7. Have Andromalius check provenance when media changes.
8. Keep unknown/ambiguous values hidden rather than inferred.

## Failure behavior

Source outages never delete current data. A failed source is logged and the remaining sources continue. No candidate means no branch/PR.
