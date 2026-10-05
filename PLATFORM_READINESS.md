# MGP — Platform & Monetization Readiness

Last reviewed: 2026-09-15

This document is an engineering/product checklist, not legal advice. Policies can change; re-check each provider immediately before submitting an application.

## Release gate

Before requesting production credentials or turning on ads, MGP should have all of the following in production or in a reviewer-accessible staging environment:

- stable public domain and HTTPS;
- working account creation, login, logout and account deletion/request flow;
- Privacy Policy and Terms of Use linked from public pages and signup;
- clear operator/support contact;
- documented data retention and deletion behavior;
- server-only secret storage; no production secret in Git, `VITE_*`, browser bundles or public logs;
- explicit user consent before connecting an external account;
- a disconnect/revoke flow for every external account;
- provider/source labels for imported data;
- a graceful fallback when a provider is unavailable;
- moderation/reporting and an age-safety model for social/community features;
- an inventory of third-party processors and APIs in `INTEGRATIONS.md`.

## Riot Games — VALORANT and League of Legends

### Product registration

MGP serves Riot players, so the product should be registered in the Riot Developer Portal. Riot requires products serving players to be registered even when a product is not yet consuming an official documented API.

### Production key

A public product must not run on a personal/development key. Apply for a Production API Key with a working, testable product/prototype and an accurate product description. Keep each separately registered product/use case aligned with the Developer Portal entry.

### Riot Sign On (RSO)

For VALORANT player-data integrations, linking must use Riot Sign On and explicit opt-in. RSO access is available to Production-level developers and the RSO client is provisioned as part of the approval/integration process.

MGP target flow:

1. User chooses **Connect Riot**.
2. MGP explains which Riot data will be read and how it will be displayed.
3. User is redirected to Riot's authorization flow.
4. MGP stores provider identifiers/tokens only on the server, with the minimum retention needed.
5. Imported fields are marked as verified/imported rather than user-declared.
6. User can disconnect Riot and stop future synchronization.

### Monetization

For Riot-related functionality/content, monetization requires the product to be registered and have an **Approved** or **Acknowledged** status. A free tier must remain available; advertising is an accepted free-tier monetization method. No gambling/betting, account boosting, unfair monetization, or features that compromise game integrity.

MGP must not present an alternative Riot MMR/ELO as if it were official. If MGP shows rank, match or account data, use Riot-supported data and label provenance accurately.

## Steam

### What is available without becoming a Steam publisher

A standard Steam Web API user key is available to Steam users who have a Steam account, associate a domain and accept the Steam Web API Terms of Use. This is suitable for supported public/user-key Web API methods; protected publisher-only APIs are a different tier.

### Account linking

Steam OpenID is the practical identity-linking route for a community site when the goal is to prove ownership of a Steam account. Valve's Steamworks OAuth flow is partner-oriented and obtaining an OAuth Client ID requires contacting Valve; some OAuth methods also require publisher credentials.

MGP should therefore separate these concepts:

- **Connect Steam identity**: verify the user's SteamID through an official Steam authentication flow.
- **Import available public/account-authorized game data**: call supported Web API methods server-side, honoring Steam privacy settings and API terms.
- **Publisher-only operations**: out of scope unless MGP later becomes an eligible Steamworks partner for a specific use case.

### Data expectations

Potential imported profile fields include owned games and playtime when Steam exposes them under the user's privacy/settings and the relevant endpoint. Achievement availability is app/endpoint dependent and also subject to privacy and API behavior.

Do **not** promise an exact "date the user started playing" as a universal Steam field. If MGP later derives a date from first observed MGP sync, achievement timestamps or another supported source, label it as derived and state the source.

### Security

Steam keys and tokens stay server-side and requests containing Web API keys use HTTPS. MGP should cache conservatively and include rate/error handling rather than calling Steam on every profile render.

## Google Sign-In / Google APIs

Use Google OAuth only for the scopes MGP actually needs. For basic account sign-in, prefer identity scopes (`openid`, `email`, `profile`) rather than unrelated sensitive scopes.

Production apps should configure the Google Auth Platform with:

- verified/accurate app branding;
- authorized domains and redirect URIs;
- public Privacy Policy and Terms URLs;
- current developer/support contact;
- a declared external audience where appropriate;
- only the scopes actually requested by the running product.

Sensitive or restricted scopes trigger additional verification and, for restricted scopes, may require a security assessment. MGP should avoid Gmail/Drive/other unrelated scopes unless a future feature has a clear user benefit that cannot be delivered with a narrower scope.

## Google AdSense / advertising

Before applying:

- the AdSense account holder must meet Google's age requirement (18+);
- MGP must contain substantial original, useful content rather than thin/placeholder-only pages;
- the applicant must control the site/source and the site must comply with AdSense program policies;
- navigation, legal pages and contact information should be complete and publicly accessible;
- the Privacy Policy must describe advertising/cookie/identifier use before ads are enabled;
- consent tooling must be implemented where required by applicable law and Google policy;
- minors must not receive behavioral/profiled advertising where prohibited.

MGP should not activate ad scripts until the consent and age-treatment logic is ready. For users identified as minors, use non-profiled/age-appropriate treatment and do not use age-assurance data for advertising profiling.

## EA SPORTS FC

EA launched the FC Community API in 2026 with a limited partner rollout. At the time of this review, EA states that it is **not accepting applications from additional community sites**. MGP can still create an EA SPORTS FC editorial/community page and user-declared Game Profile now, but must not present EA-account import as available or approved.

Use a durable catalog entry named **EA SPORTS FC** rather than creating a new MGP game identity every year. Edition-specific information (FC 26, FC 27, etc.) can live as season/edition metadata under the same MGP game.

## Elden Ring family model

- **Elden Ring** is the main game entry.
- **Shadow of the Erdtree** belongs under Elden Ring as an expansion/DLC, not as a separate MGP game/community.
- **Elden Ring Nightreign** is a standalone game and gets its own MGP game entry/community.
- Nightreign DLC/expansions belong under the Nightreign entry.

This keeps user libraries, communities, guides and future Steam imports aligned with actual standalone products.

## Community editorial automation

Do not give an LLM unrestricted production write access.

Recommended pipeline:

1. Maintain an allowlist of official publisher/developer sources per game.
2. A daily scheduler selects a game/topic and fetches source context.
3. The model creates a short draft with source/provenance metadata.
4. Duplicate, safety and factual-consistency checks run before publication.
5. Initially, drafts require moderator approval.
6. Only after the pipeline has an audit history should narrowly scoped evergreen posts be eligible for automatic publication.

Suggested database lifecycle: `draft -> approved -> scheduled -> published`, with source URL, source type, model/version and reviewer/publisher stored for auditability.

## Age and social-safety foundation — Brazil

The ECA Digital (Lei 15.211/2025) is in force in 2026 and applies to digital services directed to, or likely accessed by, children/adolescents. MGP should use safety-by-design rather than relying on a generic "I am 18" popup.

Product rules for MGP:

- under 13: account creation is not supported by MGP policy;
- 13–16: social/community access requires a guardian-linked/guardian-authorized account flow before unrestricted participation;
- 17: MGP may keep its stricter policy requiring responsible-adult awareness/assistance;
- 18+: normal adult account;
- exact birth date is private and never shown on the public profile;
- age-assurance information is used only for age/safety/compliance purposes, not ad profiling;
- explicit pornography/sexual content and gratuitous gore remain prohibited for everyone;
- lawful mature themes related to age-rated games may be tagged and blurred/restricted for minors;
- a simple reveal confirmation can be used as an extra UX warning for lawful mature discussion, but it is **not** treated as reliable legal age verification for content prohibited to minors;
- personalized/behavioral advertising must not be targeted to children or adolescents.

## MGP implementation order

1. Harden secrets and environment-variable handling.
2. Land the expanded game catalog and DB migration.
3. Land age-data storage + onboarding gate without putting DOB in public profiles.
4. Update Terms/Privacy and add content-rating/community rules.
5. Add external-account connection tables and provider-agnostic connect/disconnect UX.
6. Register Riot product / prepare production-key review package.
7. Configure Google production OAuth branding and minimal scopes.
8. Register Steam Web API key/domain and implement Steam identity linking using the supported route for the use case.
9. Apply for AdSense only after public content/community/legal/consent surfaces are production-ready.
10. Add the editorial-draft automation with manual approval first.
