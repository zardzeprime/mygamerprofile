# AVAPGV Watch

AVAPGV Watch is the operational alert lane for MG Profile's AI-core model.

Core ownership:

- **AEGIS** — security, authentication, authorization, secrets and intrusion signals.
- **VEIL** — privacy and personal-data exposure.
- **ATLAS** — media provenance, licensing and rights.
- **PULSE** — freshness, platform/game/source changes.
- **GEAR** — automations, CI/CD, scheduled jobs and pipelines.
- **VECTOR** — performance and technical regressions.
- **NEXUS** — cross-domain coordination.

Alert format: severity, owning core, what changed, repository/workflow reference and recommended next action. Secret values, tokens and credentials must never appear in alerts.

## Branded email delivery

Meaningful AVAPGV findings are delivered as responsive Portuguese HTML email through the separately configured Gmail automation. The email visual contract mirrors MG Profile without depending on remote images:

- near-black page background (`#090A0C`);
- graphite report cards (`#121419`) with subtle borders (`#292C33`);
- warm-gold accents (`#C9A95D`);
- compact `MG PROFILE / AVAPGV WATCH` masthead;
- overall status pill using only `BOM`, `+/-` or `RUIM`;
- separate cards for responsible core, what changed, concrete reference, risk/impact and next action;
- timestamp in the user's Bahia timezone;
- plain-text fallback for clients that do not render HTML;
- footer confirming that no secrets, tokens or credentials are included.

ATLAS alerts must distinguish material that is merely publicly accessible from material whose license or terms actually permit reuse. Public availability alone is never treated as reuse permission.

The external delivery automation is configured separately from repository code so email credentials are not stored in GitHub.
