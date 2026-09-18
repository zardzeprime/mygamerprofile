# Google OAuth setup — MG Profile

The application code is prepared for Google sign-in through Supabase Auth.

## App behavior

- Login page: "Continue with Google".
- Registration page: Google is available as an account-creation path.
- Header: logged-out users can start Google sign-in directly.
- New OAuth users are sent to `/onboarding`.
- Onboarding requires acceptance of the current Terms of Use and Privacy Policy before a public profile is created.
- Requested Google scopes are intentionally minimal: `openid email profile`.

## Google Cloud / Google Auth Platform

Create a **Web application** OAuth client.

Authorized JavaScript origins should include the origins where MGP is actually served, for example:

- the production MGP domain once it is connected;
- the current Lovable preview origin when testing there;
- localhost only during local development.

Authorized redirect URI for the Google OAuth client:

`https://gudvdgpjfapshzqyfcpj.supabase.co/auth/v1/callback`

Google requires redirect URIs to match exactly.

## Supabase Auth

In Supabase Dashboard -> Authentication -> Providers -> Google:

1. Enable Google.
2. Paste the Google Client ID.
3. Paste the Google Client Secret.

In Authentication -> URL Configuration:

- set the production Site URL to the real MGP production origin;
- allow `/onboarding` for the production origin;
- allow the Lovable preview origin while preview testing is needed.

Current Lovable preview origin at the time this document was written:

`https://id-preview--95c5a73d-d8d1-4747-85d3-6194f336fae8.lovable.app`

## Secrets

Never commit the Google Client Secret to GitHub or expose it through `VITE_*` client variables.
The Client ID is public by design, but the Client Secret belongs only in the Supabase provider configuration / secure server-side configuration.

## Final test checklist

1. Open MGP logged out.
2. Start Google sign-in.
3. Choose a Google account.
4. Confirm the browser returns to MGP.
5. A first-time user should reach onboarding.
6. Accept legal documents, choose username and finish profile.
7. An existing user with a profile should be redirected away from onboarding to their profile.
8. Sign out and sign in with Google again to confirm account continuity.
