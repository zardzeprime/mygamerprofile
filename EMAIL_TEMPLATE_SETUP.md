# MGP auth email template

The branded Portuguese signup confirmation template lives at:

- `supabase/templates/confirmation.html`
- Subject: `Confirme seu e-mail e monte seu perfil no MGP`

For local Supabase development, `supabase/config.toml` already points to this template.

For the hosted Supabase project, apply the same subject and HTML in **Authentication > Email Templates > Confirm signup**. Hosted email-template settings live in Supabase Auth project configuration and are not deployed by database migrations.

The template uses `{{ .SiteURL }}/brand/mgp-logo.png` for the MGP logo and `{{ .ConfirmationURL }}` for the verification CTA.
