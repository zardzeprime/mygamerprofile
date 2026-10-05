# Riot + Steam API setup — MG Profile

This document describes the server-side configuration expected by the current MGP codebase.

## Shared rule

Never place provider secrets in `VITE_*` variables, public JavaScript, screenshots, commits, issues or client-visible configuration.

The current code expects:

```text
PUBLIC_APP_URL=https://mgprofile.online
RIOT_API_KEY=
RIOT_RSO_CLIENT_ID=
RIOT_RSO_CLIENT_SECRET=
STEAM_WEB_API_KEY=
```

## Riot Games

### Current MGP state

- `src/lib/riot.functions.ts` already performs server-side Riot Account API lookups.
- `src/components/games/RiotPlayerSearch.tsx` consumes that server function without exposing the API key.
- `public/riot.txt` is already present for Riot domain/product verification.
- the Connections settings page exposes only safe readiness booleans; it never returns the key.
- RSO credentials are reserved but the actual account-linking flow must wait for Riot production approval.

### Key types

A development key is for development/prototyping and expires regularly. It is not acceptable for public consumption.
A personal key is for personal/small private use and cannot be used for an open public alpha/beta.
A public MGP launch using Riot player APIs should use an approved production application/key.

### VALORANT

VALORANT player-account integrations require player opt-in via Riot Sign On (RSO). RSO is available only after production-level approval.

Do not represent Riot-ID lookup alone as ownership/account verification. The future MGP “connected Riot account” state should only be written after an approved RSO flow verifies the player.

### Deployment secrets

Add the production/development key to the server deployment environment:

```text
RIOT_API_KEY=<secret>
```

After Riot grants RSO credentials:

```text
RIOT_RSO_CLIENT_ID=<secret>
RIOT_RSO_CLIENT_SECRET=<secret>
```

Do not prefix any of these with `VITE_`.

## Steam

### User Web API key

For the current MGP use case, a normal Steam Web API user key is sufficient for public-profile lookups and public-library data.

Associate the key with the MGP domain:

```text
mgprofile.online
```

Store the result only on the server:

```text
STEAM_WEB_API_KEY=<secret>
```

### Current MGP state

`src/lib/steam.functions.ts` supports:

- a SteamID64;
- a Steam Community `/profiles/<steamid>` URL;
- a Steam Community `/id/<vanity>` URL;
- a plain vanity name;
- profile summary lookup;
- owned-game library lookup when the Steam user's privacy settings expose it;
- graceful private/limited-library handling.

The Steam key never reaches the browser.

### Linking a Steam account

Steam supports browser account linking through OpenID 2.0 using:

```text
https://steamcommunity.com/openid/
```

The returned claimed ID contains the verified 64-bit SteamID.

MGP should use Steam OpenID for account ownership/identity linking and use the Web API only after that link exists. Looking up an arbitrary public profile is not equivalent to proving the MGP user owns it.

### Privacy behavior

Steam library/playtime endpoints can return no game list when the account's game details are private. Treat that as a privacy state, not an API failure.

## Production checklist

1. `PUBLIC_APP_URL=https://mgprofile.online`.
2. Add `STEAM_WEB_API_KEY` to the production server environment.
3. Add the current Riot key only to the server environment.
4. Keep Riot public-account features private/development-only until a production key is approved.
5. After Riot production approval, add RSO client credentials and implement the opt-in linking flow.
6. Implement Steam OpenID linking before writing a Steam connection to `connected_accounts`.
7. Test both providers with server logs and never log raw secrets.
