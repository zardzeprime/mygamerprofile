# AVAPGV Watch

AVAPGV Watch is the operational alert lane for MG Profile's AI-core model.

## Os Sete — Conselho da NEXUS

- **NEXUS (Coordenação e IA)** — A Regente.
- **Sabnock (Segurança)** — A Fortaleza.
- **Bael (Privacidade)** — O Véu.
- **Andromalius (Direitos e procedência)** — O Guardião da Procedência.
- **Vassago (Pesquisa e atualizações)** — O Investigador.
- **Marbas (Automação)** — O Artífice.
- **Andrealphus (Performance e UX)** — O Geômetra.

NEXUS coordinates six child specialist agents. Andrealphus reports directly on performance and UX. Reports must distinguish performed checks from domains not assessed; do not give all seven a BOM status by default.

Alert format: severity, owning core, what changed, repository/workflow reference and recommended next action. Secret values, tokens and credentials must never appear in alerts.

## Branded email delivery

Meaningful AVAPGV findings are delivered as responsive Portuguese HTML email through the separately configured Gmail automation. A temporary connector unavailability in one execution must be reported as a delivery failure for that execution only; it must not be described as an account or Gmail failure without evidence. Later successful delivery does not retroactively erase the incident, but confirms the channel recovered. The email visual contract mirrors MG Profile without depending on remote images:

- near-black page background (`#090A0C`);
- graphite report cards (`#121419`) with subtle borders (`#292C33`);
- warm-gold accents (`#C9A95D`);
- compact `MG PROFILE · OS SETE` masthead;
- overall status pill using only `BOM`, `+/-` or `RUIM`;
- separate cards for responsible core, what changed, concrete reference, risk/impact and next action;
- timestamp in the user's Bahia timezone;
- plain-text fallback for clients that do not render HTML;
- footer confirming that no secrets, tokens or credentials are included.

Andromalius alerts must distinguish material that is merely publicly accessible from material whose license or terms actually permit reuse. Public availability alone is never treated as reuse permission.

The external delivery automation is configured separately from repository code so email credentials are not stored in GitHub.
