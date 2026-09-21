# MGP v0.1 — Visual Foundation

## Pre-launch polish — stage 1

- [x] Lock the interface to dark mode while preserving accent-color personalization
- [x] Remove light/system controls and safely migrate stored/account appearance preferences
- [x] Harden the header, hub navigation, cards, touch targets and responsive framing
- [x] Validate desktop, tablet and mobile presentation, accessibility, lint, typecheck and build

- [x] Extend the visual tokens, motion system, custom cursor, and accessibility fallbacks
- [x] Add centralized local audio preferences and sound feedback
- [x] Add organized original game assets and preview architecture
- [x] Refine the header, footer, Home, catalog, and premium game cards
- [x] Redesign reusable Game Hubs, module states, and GameLivePanel
- [x] Refine the public profile presentation and showcases
- [x] Verify light/dark, desktop/mobile, keyboard, reduced motion, build, and runtime

# MGP v0.1.2A — Dark Souls Boss Wiki

- [x] Turn the Dark Souls Remastered Bosses tab into a functional encyclopedia
- [x] Cover all 26 base-game + Artorias of the Abyss bosses
- [x] Add spoiler-light context and optional deeper lore
- [x] Add NG soul rewards, notable drops, tail-cut rewards, location and progression status
- [x] Add search and Required / Optional / DLC filters
- [x] Keep third-party boss artwork out until an official/licensed or original MGP asset is available

# MGP v0.1.2B — Dark Souls Stats & Scaling Guide

- [x] Publish the first MGP editorial guide inside the Dark Souls Guides tab
- [x] Explain all eight core attributes and their important soft caps / breakpoints
- [x] Explain requirements versus scaling and the S / A / B / C / D / E grading system
- [x] Explain the 1.5x effective Strength rule while two-handing
- [x] Cover STR, DEX, INT and FAI scaling and how upgrade paths change them
- [x] Explain the Pyromancy Flame exception and why INT / FAI do not raise pyromancy damage
- [x] Add interactive stat selection and build-direction suggestions
- [x] Ship the guide in Portuguese, English and Spanish

# MGP — Souls Visual & Editorial Foundation

- [x] Optimize the repository artwork for Dark Souls III, Elden Ring, and EA SPORTS FC
- [x] Connect the three local covers with reviewed card and hero framing
- [x] Move Dark Souls III and Elden Ring boss research into a dedicated data module
- [x] Rebuild the shared Souls boss explorer with selectable details, filters, mechanics, and licensed-art placeholders
- [x] Validate changed files, automatic build health, and responsive presentation

# MGP v0.1.3A — VALORANT Foundation

- [x] Rebuild the VALORANT Overview with editorial synopsis, release, developer, publisher, latest patch and critic reference score
- [x] Refocus VALORANT tabs on Overview / Agents / Maps / Weapons / Competitive / Lineups
- [x] Add an interactive Agent encyclopedia with roles and ability kits
- [x] Add a tactical Map atlas with the current competitive rotation marked
- [x] Add a detailed Weapons arsenal with economy, penetration and range-based damage tables
- [x] Add an official Champions Shanghai schedule snapshot with competition filters
- [x] Stack competitive schedule and featured MGP content in the VALORANT Overview sidebar
- [x] Prepare server-side official YouTube live-broadcast discovery behind YOUTUBE_API_KEY
- [x] Keep Competitive and Lineups as expandable foundations for later releases
- [ ] Replace the temporary static content mirror/provider with Riot Public Content Catalog / approved Riot API integration where practical
- [ ] Persist esports match/provider sync in Supabase when live automation is enabled

# MGP v0.1.3B — VALORANT Skins & Esports Polish

- [x] Normalize Agent ability labels to Ability/Habilidade/Habilidad 1–3 + Ultimate
- [x] Add team and event logo references to VALORANT esports match cards with readable fallbacks
- [x] Add a dedicated Skins tab to the VALORANT game hub
- [x] Add weapon-first skin browsing and an interactive desktop skin wheel
- [x] Add mobile-friendly horizontal skin browsing
- [x] Show skin edition/rarity, color variants, upgrade levels and VP reference pricing
- [x] Add transparent Radianite estimates for common level/variant upgrade patterns
- [x] Preserve available streamed-video metadata for a later animation-preview update
- [ ] Replace fragile external esports-logo hotlinks with approved/official hosted assets when available
- [ ] Add exact historical per-skin VP pricing from an approved provider/editorial dataset

# MGP v0.1.3C — Previews, News & Motion

- [x] Refine the skin wheel with smaller/farther orbit cards and a stronger center focus
- [x] Capture wheel scrolling only while the pointer is over the skin showcase
- [x] Add per-weapon skin search inside the selected weapon collection
- [x] Turn streamed skin/chroma media into an animated MGP preview modal
- [x] Make the full game catalog card clickable instead of requiring an Open Hub CTA
- [x] Make the game-card play control open an inline official trailer and the arrow open the official external video
- [x] Add Dark Souls Remastered and VALORANT official trailer references
- [x] Add a VALORANT News tab with official-only filtering, search and chronological ordering
- [x] Seed the news archive with current Riot patch notes, official trailers, esports announcements and confirmed future-dated changes
- [x] Add lightweight module/card entrance and hover motion while respecting reduced-motion preferences
- [x] Maintain VALORANT News through a review-only automation that opens GitHub PRs and never auto-merges
- [ ] Add per-ability gameplay video previews only when a stable official/approved source exists for the full Agent roster

# MGP v0.1.4C — Responsive, Profiles & Security Correction Pass

- [x] Add global responsive overflow guards and mobile-safe proportions across the shell and game hubs
- [x] Prevent mobile browser focus zoom by keeping form controls at a mobile-safe font size
- [x] Reduce oversized hub hero heights and tighten small-screen spacing without changing desktop identity
- [x] Rebuild the public profile route with fault-tolerant profile/post/game-profile loading
- [x] Add direct My Profile navigation for signed-in users
- [x] Limit user-uploaded profile media to the avatar and remove free banner upload from profile settings
- [x] Add four controlled MGP profile-background presets as the foundation for future premium/animated cosmetics
- [x] Restrict profile avatar URLs to the MGP avatar bucket
- [x] Add missing foreign-key indexes and optimize repeated auth checks in RLS policies
- [x] Keep the branded Portuguese confirmation-email template versioned in the repository
- [ ] Activate the branded confirmation template in hosted Supabase Auth when management access is available
- [ ] Enable Supabase leaked-password protection in hosted Auth settings
- [ ] Validate the final layout on representative real iOS and Android devices after deployment

# Future — VALORANT Competitive + Lineups

- [ ] Add official/approved live VCT provider sync and match status updates
- [ ] Add community-created lineup publishing with map, Agent, ability, side, position and provenance
- [ ] Add moderation and verified MGP lineup curation

# MGP v0.2 — Social Identity Expansion

- [ ] Expand profile cosmetics, ownership/entitlements and premium presentation without pay-to-win mechanics
- [ ] Introduce controlled animated profile backgrounds and cosmetic inventory
- [ ] Deepen community publishing, moderation and creator provenance
