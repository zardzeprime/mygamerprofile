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

The external delivery automation is configured separately from repository code so email credentials are not stored in GitHub.
