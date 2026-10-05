# MGP auth email template

The branded Portuguese signup confirmation template lives at:

- `supabase/templates/confirmation.html`
- Subject: `Confirme seu e-mail e monte seu perfil no MGP`

The repository also records the intended auth URL configuration in `supabase/config.toml`:

- Site URL: `https://mygamerprofile.lovable.app`
- Production redirect: `https://mygamerprofile.lovable.app/**`
- Local redirects: `http://localhost:3000/**` and `http://localhost:5173/**`

## Hosted Supabase project

Hosted Supabase Auth does **not** automatically apply the local `config.toml` email template just because the repository is connected to GitHub.

In the Supabase Dashboard, set the following:

1. **Authentication > URL Configuration**
   - Site URL: `https://mygamerprofile.lovable.app`
   - Add redirect URL: `https://mygamerprofile.lovable.app/**`
2. **Authentication > Email Templates > Confirm signup**
   - Subject: `Confirme seu e-mail e monte seu perfil no MGP`
   - Paste the HTML from `supabase/templates/confirmation.html`

If the production redirect is not in the Auth allow list, Supabase can reject the `emailRedirectTo` sent by the app and fall back to the Site URL. If the Site URL is still localhost, confirmation links will therefore end at localhost.

The application signup flow now sends `https://mygamerprofile.lovable.app/onboarding` as the production confirmation redirect. Localhost is only used when registration itself is running on localhost.
