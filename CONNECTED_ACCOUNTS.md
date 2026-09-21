# MGP — Connected Accounts

Last reviewed: 2026-09-21

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

Google is used primarily as optional sign-in/account identity, not as a source of gaming data.

Current scopes are intentionally minimal:

- `openid`
- `email`
- `profile`

Production configuration uses Supabase Auth with the exact provider callback:

`https://gudvdgpjfapshzqyfcpj.supabase.co/auth/v1/callback`

The login/register flow uses normal Google OAuth. The authenticated Connected Accounts page uses Supabase identity linking so an email/password account can add Google without replacing the MGP user id. Connected state is derived from the user's Supabase Auth identities rather than requiring a duplicate `connected_accounts` row.

Google OAuth was probed successfully on 2026-09-21: the Supabase provider reported enabled and the authorize endpoint redirected to `accounts.google.com`.

## UI state

`/settings/connections` is the single user-facing control center.

Buttons stay disabled only for providers that are not production-ready. Steam and Google are active. Riot account linking remains disabled until production approval/RSO is available.

## Disconnect and deletion

A disconnect operation must:

1. revoke provider tokens when the provider offers revocation;
2. remove or deactivate server-held credentials;
3. mark/remove the `connected_accounts` link;
4. stop future synchronization;
5. preserve only historical information that MGP has a valid reason to retain, with clear provenance.

Disconnecting a platform must never delete the user's MGP account unless the user separately requests MGP account deletion.
