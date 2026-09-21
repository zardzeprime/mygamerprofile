# MGP AI Core Architecture

## Purpose

MGP splits AI-assisted development into one orchestration core and multiple specialist cores. The architecture reduces context waste, keeps decisions auditable, and lets each specialist preserve its own backlog and history.

This is currently a **development orchestration contract**, not a claim that seven autonomous model processes are permanently running in production. A future agent/runtime layer can implement these contracts directly.

## Core topology

### NEXUS — Mother / Orchestrator

NEXUS receives the user's intent and owns the integrated result. It coordinates the specialist cores, resolves conflicts, performs or coordinates implementation, and returns the final handoff.

### Sabnock — Security
Owns authentication, authorization, abuse prevention, session integrity, secret handling, dependency/security risk, attack-surface review, rate limiting, validation and secure defaults.

### Bael — Privacy
Owns personal-data handling, consent, visibility, data minimization, retention, telemetry, deletion/export expectations and privacy-by-design.

### Andromalius — Image Rights & Licensing
Owns provenance and rights checks for images and other external media: copyright/licensing, attribution, hotlinking/rehosting decisions, right-of-image concerns and asset-source records.

### Vassago — Updates
Owns freshness: platform/game changes, stale editorial data, source changes, dependency/version review and content that must be periodically revalidated.

### Marbas — Automation
Owns repetitive or scheduled workflows: CI/CD, scripts, scheduled jobs, data refresh pipelines, content import, validation jobs, migrations and operational automations.

### Andrealphus — Optimization
Owns technical efficiency and optimization history: runtime performance, rendering, bundles, images, network cost, caching, database/query efficiency, duplicate code and UX performance.

## Mandatory council gate

Every **non-trivial product/code change** must pass through NEXUS and receive a recorded review from **all six specialist cores** before it is considered release-ready. A specialist may return `not_applicable` when its domain is genuinely unaffected, but the review must still be recorded. This rule is mandatory for public beta/release assessments.

Required order:
1. NEXUS classifies the change and prepares the integrated brief.
2. Sabnock reviews security impact.
3. Bael reviews privacy/data impact.
4. Andromalius reviews asset provenance/licensing impact.
5. Vassago reviews freshness/current-data impact.
6. Marbas reviews automation/operations impact.
7. Andrealphus reviews performance, UX and responsive impact.
8. NEXUS resolves conflicts and records the integrated result.
9. Only after this gate may a change be marked `release-ready`.

A failed, blocked, or unavailable specialist review must remain visible in the release report; it must never be silently treated as approval.

## Mandatory public-beta readiness report

Before a requested public beta/release decision, Os Sete must produce a compact readiness report. Each member independently supplies:
- `readinessPercent`: integer 0–100;
- `reason`: one short sentence;
- `blockers`: any release-blocking issue, or an empty list.

NEXUS then records:
- the seven individual percentages;
- an overall percentage calculated from the recorded assessments;
- unresolved blockers;
- tested commit SHA and timestamp;
- whether the assessment applies to preview, published production, or both.

Percentages are advisory technical opinions, not substitutes for build/security/runtime checks. The report must not invent a specialist result if that specialist did not actually run.

When email reporting is configured and authorized, the completed report should be sent to the configured project-owner report address. Email failure must not alter the readiness percentage; it is reported separately as a delivery failure.

## Specialist handoff format

A specialist response is compact and structured around:
- `scope`;
- `decisions`;
- `actions`;
- `risks`;
- `next`;
- `blocked`;
- `readinessPercent` and `reason` when performing a release-readiness review.

## Persistent state

`docs/ai/core-state.json` is the shared memory for specialist work inside the repository. Each core has four operational buckets:
- `completed`;
- `inProgress`;
- `next`;
- `blocked`.

Keep entries short, factual and useful for the next session.

## Os Sete — Conselho da NEXUS

- **NEXUS (Coordenação e IA) — A Regente**; stable technical ID: `nexus`.
- **Sabnock (Segurança) — A Fortaleza**; stable technical ID: `aegis`.
- **Bael (Privacidade) — O Véu**; stable technical ID: `veil`.
- **Andromalius (Direitos e procedência) — O Guardião da Procedência**; stable technical ID: `atlas`.
- **Vassago (Pesquisa e atualizações) — O Investigador**; stable technical ID: `pulse`.
- **Marbas (Automação) — O Artífice**; stable technical ID: `gear`.
- **Andrealphus (Performance e UX) — O Geômetra**; stable technical ID: `vector`.

Names and epithets are creative branding inspired by the Ars Goetia. Responsibilities are the project's operational contract, not historical claims. Stable IDs preserve stored history and routing compatibility. Reports use `name (function)` and the masthead `MG PROFILE · OS SETE`.
