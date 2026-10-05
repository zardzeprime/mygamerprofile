# MGP 0.1.9 → 0.2 stabilization roadmap

## Purpose

0.1.9 is the structural release that narrows scope and prepares MGP for durable public accounts in 0.2.

The release is intentionally focused on four active game hubs:

- Dark Souls Remastered
- Dark Souls III
- Valorant
- League of Legends

Elden Ring, Elden Ring Nightreign and EA SPORTS FC remain preserved in code/database but are paused from the active catalog until assets/content reach the same standard.

## 0.1.9 workstreams

### Accounts, privacy and safety

- Keep Supabase Auth as session/JWT/RLS infrastructure.
- Add per-field privacy for optional gender/country/subdivision identity data.
- Keep birth date and age-assurance data separate from public profile identity.
- Add Google OAuth using the existing auth identity model.
- Configure custom SMTP before public 0.2.
- Run AEGIS/VEIL review after every auth/profile schema wave.

### Profiles and cosmetics

- Animated MGP-original backgrounds: Rift Nebula, Emberstorm and Hextech Pulse.
- Cosmetic catalog supports background, banner, badge and chibi types.
- Inventory/loadout storage is prepared before any gacha UI exists.
- Game-themed chibis/badges require asset-rights review before publication.
- Do not launch paid/randomized reward mechanics without product, legal, age and regional review.

### Riot integration

- Riot ID search uses official ACCOUNT-V1 server-side and never leaks `RIOT_API_KEY`.
- Production API key/product registration remains an owner blocker.
- Riot Sign On remains disabled until Riot grants production RSO approval.
- A Riot ID lookup is discovery, not ownership verification.

### Competitive compendium

- Valorant and League competitive tabs become source-tracked team/player/settings compendiums.
- Entries record provenance and last-verification time.
- VLR and ProSettings may be used as manual editorial references when permitted; do not bulk scrape third-party databases.
- Player photos/logos require ATLAS review before mirroring or rehosting.

### NEXUS

- Maintain provider health/failover visibility.
- Guest NEXUS remains limited to ten assistant replies before login.
- Developer mode stays admin-only.
- GitHub/Supabase/Lovable tools remain separate from inference providers.
- Destructive production actions keep a human-approval boundary.

### Performance / UX

- Initial boot uses the same MGP transition loader as route navigation.
- Animated profile visuals respect `prefers-reduced-motion`.
- Active catalog is intentionally smaller to reduce unfinished surfaces.
- VECTOR should profile image payloads, route bundles and database query patterns before 0.2.

## External blockers before 0.2

- Riot production API application/key.
- Riot RSO approval if account linking is desired.
- Google OAuth client configuration for production origins/callbacks.
- MGP domain and transactional SMTP sender configuration.
- Final asset-rights review for logos, esports photos, chibis and banners.
- NEXUS production provider keys/rate limits/cost guardrails.

## 0.2 release gates

0.2 should not be declared stable until:

1. Account create/login/recovery/logout/delete flows survive end-to-end testing.
2. Existing user profile and game data survives OAuth identity/linking changes.
3. Public/private profile and field-level privacy are verified with anonymous, owner and unrelated-account tests.
4. Supabase security/performance advisors are reviewed; unresolved warnings are documented.
5. No secrets are shipped to the browser or committed to the repository.
6. Upload paths enforce file type/size/ownership and have sensible storage policies.
7. Riot lookup handles missing key, expired development key, rate limits and not-found states safely.
8. NEXUS has at least one healthy provider plus a documented fallback path.
9. Core pages are mobile-tested and loading/empty/error states are coherent.
10. Database migration history matches production schema.

## After 0.2

- Expand paused game hubs one at a time.
- Add curated esports datasets.
- Add earned/event cosmetics and chibi collections after rights review.
- Evaluate randomized cosmetic systems only after legal/product safeguards are defined.
- Gradually grant NEXUS scoped administrative actions through reviewed tool bridges.
