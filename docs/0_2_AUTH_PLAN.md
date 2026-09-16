# MGP 0.2 — Authentication plan

## Decision

MGP keeps **Supabase Auth** as the authentication/session/JWT infrastructure for 0.2.

The product experience remains fully MGP-branded: login/register screens, account copy, profile management and transactional email styling belong to MGP. Supabase stays behind the scenes because it already integrates sessions with PostgreSQL Row Level Security (RLS), password recovery and OAuth identities.

Replacing it with a home-grown authentication server before 0.2 would add unnecessary risk around password storage, session rotation, account recovery, email verification and RLS identity propagation.

## Email + password

MGP continues to support email/password accounts through Supabase Auth while the UI is owned by MGP.

Before public 0.2:

- configure a custom SMTP provider for production authentication mail;
- use an MGP-controlled sender identity such as `no-reply@auth.<mgp-domain>` when the domain exists;
- customize verification, recovery and security email templates;
- enable leaked-password protection and review password policy;
- verify redirect allowlists for production/staging/local origins.

A mailbox product and transactional email delivery are separate concerns. MGP does not need to pay for a full employee mailbox just to send transactional authentication mail; it needs a verified domain plus a suitable transactional SMTP provider. A human inbox such as `support@...` can be added separately if required.

## Google sign-in

Google is added through Supabase OAuth rather than a parallel account database.

Client flow:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${origin}/auth/callback` },
});
```

Google OAuth client secrets remain server/provider configuration and must never be embedded in the browser bundle or committed to GitHub.

A Google login should resolve to the same MGP user/profile model and retain all existing profile/game/social data.

## Riot accounts

Riot identity lookup and Riot Sign On are separate capabilities.

- Public Riot ID search uses the official Riot API and `RIOT_API_KEY` server-side.
- Linking/authenticating a Riot account uses Riot Sign On (RSO), which requires an approved production application from Riot.
- MGP must not treat a Riot ID lookup as proof that the visitor owns that account.

## Data model

`auth.users` remains the identity anchor. `public.profiles.id` continues to reference it, which preserves existing foreign keys and RLS rules across posts, game profiles, follows, reports, NEXUS threads and connected accounts.

Provider connections are represented in `public.connected_accounts`; provider access tokens/secrets stay server-side and are not stored in public profile JSON.

## 0.2 release gates

Before account creation is considered stable:

1. Google OAuth production credentials configured and callback URLs tested.
2. Custom SMTP configured and verification/recovery templates tested.
3. Leaked-password protection enabled where available.
4. RLS/security advisor review clean or every remaining warning explicitly accepted/documented.
5. Account deletion/export and connection revoke behavior tested.
6. Profile privacy tests cover public/private profile plus per-field identity privacy.
7. No API key or OAuth secret exists in `VITE_*`, frontend source, chat history exports or committed `.env` files.
