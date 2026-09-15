# MGP — Connected Accounts

Last reviewed: 2026-09-15

## Goal

Let a player voluntarily link official platform identities to MGP so Game Profiles can distinguish self-declared information from provider-backed information.

Provider passwords are never collected by MGP. Provider secrets and access/refresh tokens are server-side only.

## Shared data model

`public.connected_accounts` contains owner-visible link metadata only:

- MGP user id
- provider (`steam`, `riot`, `google`)
- provider user id
- display label
- connection/reauth state
- granted scope names
- non-secret public metadata
- connected / last-synced timestamps

OAuth tokens, API secrets and provider credentials must not be stored in this client-readable table.

## Steam

### Identity link

Use Steam's browser OpenID flow to obtain and verify the user's SteamID. The user signs in on Steam Community, not on an MGP password form.

Planned route shape:

- start: `/connect/steam`
- return: `/connect/steam/callback`

The callback verifies the OpenID response server-side, extracts the SteamID and creates/updates the `connected_accounts` record.

### Data sync

A server-only Steam Web API key can then query endpoints that are actually available to a normal community website and permitted by the player's Steam privacy settings.

MGP targets supported/public data such as profile identity, game library/playtime and achievements where available. Do not claim access to publisher-only Steamworks data. Do not present a guessed first-play date as an official Steam field.

## Riot Games

VALORANT/League account-level player data must follow Riot's approved production-product rules.

Production path:

1. Register MGP as a product in the Riot Developer Portal.
2. Obtain an approved Production API Key/product registration.
3. Request/use Riot Sign On (RSO) where required for player opt-in data.
4. Add only the scopes/endpoints approved for the MGP use case.
5. Store Riot credentials server-side and connect the returned Riot identity to the MGP user.

Planned route shape:

- start: `/connect/riot`
- callback: `/connect/riot/callback`

No production Riot button should redirect until the actual product credentials and approved RSO configuration exist.

## Google

Google is intended primarily as optional sign-in/account identity, not as a source of gaming data.

Initial scopes should remain minimal:

- `openid`
- `email`
- `profile`

Production configuration needs:

- Google Auth Platform branding
- production audience
- verified authorized domain(s)
- web OAuth client
- exact HTTPS redirect URI
- current MGP Privacy Policy and Terms URLs

Planned route shape:

- start: `/connect/google`
- callback: `/connect/google/callback`

If MGP later uses Google only as an authentication provider through Supabase Auth, the final redirect URI may be the Supabase OAuth callback instead; use the exact callback supplied by the configured auth provider rather than inventing one.

## UI state

`/settings/connections` is the single user-facing control center.

Buttons stay disabled/marked as coming soon until the corresponding provider is fully configured. This prevents a production-looking dead OAuth flow and gives provider reviewers a clear prototype of the intended user journey.

## Disconnect and deletion

A disconnect operation must:

1. revoke provider tokens when the provider offers revocation;
2. remove or deactivate server-held credentials;
3. mark/remove the `connected_accounts` link;
4. stop future synchronization;
5. preserve only historical information that MGP has a valid reason to retain, with clear provenance.

Disconnecting a platform must never delete the user's MGP account unless the user separately requests MGP account deletion.
