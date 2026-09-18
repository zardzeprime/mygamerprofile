# VALORANT + League live-content audit — 2026-09-18

This document records the source-of-truth review performed before MG Profile moves on to Dark Souls Remastered and Dark Souls III.

## Council review

- **Vassago / PULSE:** freshness and live-game facts.
- **Marbas / GEAR:** recurring source checks and review automation.
- **Andrealphus / VECTOR:** presentation, density, mobile/desktop consistency and stale-label risk.
- **Andromalius / ATLAS:** media provenance whenever an update introduces or replaces external artwork.

## VALORANT

### Maps

Public API catalogs are not used to infer the ranked map pool. Rotation is tracked from Riot patch notes.

Current Competitive + Deathmatch pool after Patch 13.04:

- Abyss
- Ascent
- Haven
- Lotus
- Split
- Summit
- Sunset

Rotation chain:
- 12.05: Lotus + Fracture in; Abyss + Corrode out.
- 12.08: Ascent in; Bind out.
- 13.00: Summit + Sunset in; Fracture + Pearl out.
- 13.04: Abyss in; Breeze out.

ValorantMaps.tsx was corrected to this seven-map pool.

### Agents

The page loads the current playable-character catalog dynamically instead of freezing a hand-maintained list. Roles, descriptions, icons and ability descriptions come through the structured VALORANT content mirror used by MGP. The lifecycle watcher must still compare new Riot patch notes for balance/new-agent changes because the mirror is not itself Riot's editorial source.

### Weapons

Weapon price/stats/damage tables are dynamically loaded. Balance claims that become patch-sensitive should always be checked against Riot patch notes before being presented as editorial/current commentary.

### Skins

Skin/chroma/level/media discovery is dynamic. The content-tier-derived VP number is explicitly labeled reference/estimate, not an exact individual store price. Limited collections, Battle Pass content and special bundles are allowed to have no exact MGP VP price unless an authoritative per-skin source is available.

### News

The public feed remains official-source-only. The existing daily VALORANT News Watch checks Riot News, VALORANT Esports and the official VALORANT Brasil YouTube feed and opens a review PR; it does not auto-publish.

### Competitive

Champions Shanghai group schedule is source-checked against VALORANT Esports:
- Sep 24: Team Liquid vs Paper Rex; TYLOO vs G2
- Sep 25: Nongshim RedForce vs NRG; Karmine Corp vs Xi Lai Gaming
- Sep 26: Global Esports vs Team Vitality; LOUD vs EDward Gaming
- Sep 27: 100 Thieves vs T1; JD Gaming vs FUT Esports

Player settings remain individually sourced and dated. Missing values are hidden rather than inferred.

## League of Legends

### Patch + Data Dragon

- Current public patch baseline: **26.18**.
- Current Data Dragon baseline reviewed by MGP: **16.18.1**.
- Champion, item, map, icon and splash payloads continue to resolve the newest Data Dragon version at runtime; 16.18.1 is only the offline fallback.

### Champions

Champion list, roles/classes, lore, passive, spells, costs/cooldowns/ranges and official Data Dragon assets are dynamic. Ability media remains lazy-loaded so a full champion directory does not preload every video.

### Items

The item shop derives current Summoner's Rift items, prices, stats and build relations from Data Dragon. MGP's Basic/Epic/Legendary labels are navigation labels derived from the recipe tree and do not revive the retired Mythic-tier system.

### Modes

Current editorial special-mode baseline:
- Arena
- ARAM: Desordem / ARAM: Mayhem
- League of Legends Classic

Classic is now represented separately from modern Summoner's Rift. Arena's source is kept on 26.17 because Riot describes its alternating balance-patch cadence there; ARAM Mayhem and Classic are current in 26.18.

### Esports

International season dates are source-checked against LoL Esports:
- First Stand: Mar 16–22
- MSI: Jun 28–Jul 12
- Worlds: Oct 15–Nov 14

The current upcoming schedule snapshot was refreshed from LoL Esports on 2026-09-18. Unknown bracket opponents stay TBD.

Starter roster snapshot was re-checked for:
- T1: Doran / Oner / Faker / Peyz / Keria
- Gen.G: Kiin / Canyon / Chovy / Ruler / Duro
- Hanwha Life: Zeus / Kanavi / Zeka / Gumayusi / Delight
- Dplus: Siwoo / Lucid / ShowMaker / Smash / Career
- G2: BrokenBlade / SkewMond / Caps / Hans Sama / Labrov
- Team Liquid Alienware: Morgan / Josedeodo / Quid / Yeon / CoreJJ
- FlyQuest: GaKGoS / Gryffinn / Quad / Massu / Cryogen
- LOS: Zest / Curse / Feisty / Duduhh / Ackerman

These are dated competitive snapshots, not permanent identity data; lifecycle review should flag roster changes.

## Accuracy rules going forward

1. Official first-party source wins whenever Riot publishes the fact.
2. Structured mirrors may power dynamic game content but do not establish patch/rotation/editorial claims by themselves.
3. Competitive secondary sources can fill roster/settings gaps when Riot does not expose equivalent structured data, but every such fact remains dated and source-linked.
4. Unknown values stay unknown; do not estimate settings, future bracket winners or exact cosmetic prices.
5. New artwork/media goes through ATLAS provenance review.
6. Live-service facts are rechecked by the daily Game Lifecycle Watch before they can quietly go stale.
