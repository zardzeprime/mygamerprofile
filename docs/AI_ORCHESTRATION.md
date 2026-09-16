# MGP AI Core Architecture

## Purpose

MGP splits AI-assisted development into one orchestration core and multiple specialist cores. The architecture is intended to reduce context waste, keep decisions auditable, and let each specialist preserve its own backlog and history.

This is currently a **development orchestration contract**, not a claim that seven autonomous model processes are permanently running in production. A future agent/runtime layer can implement these contracts directly.

## Core topology

### NEXUS — Mother / Orchestrator

NEXUS receives the user's intent and owns the integrated result. It decides which specialist cores are relevant, gives each one the smallest useful context, resolves conflicts, performs or coordinates implementation, and returns the final handoff.

NEXUS should not duplicate specialist work when a specialist state or prior decision already exists.

### AEGIS — Security

Owns authentication, authorization, abuse prevention, session integrity, secret handling, dependency/security risk, attack-surface review, rate limiting, validation and secure defaults.

Typical triggers: auth changes, database policies, uploads, APIs, permissions, account recovery, admin tools, third-party integrations and security incidents.

### VEIL — Privacy

Owns personal-data handling, consent, visibility, data minimization, retention, telemetry, deletion/export expectations and privacy-by-design.

Typical triggers: profiles, connected accounts, analytics, location, messages, minors/age flows, sharing controls and anything that changes who can see or retain user data.

### ATLAS — Image Rights & Licensing

Owns provenance and rights checks for images and other external media: copyright/licensing, attribution, hotlinking/rehosting decisions, right-of-image concerns and asset-source records.

Typical triggers: game art, boss art, screenshots, avatars, promotional media, externally sourced icons, videos and user-uploaded media.

### PULSE — Updates

Owns freshness. It tracks platform/game changes, stale editorial data, source changes, dependency/version review and content that must be periodically revalidated.

Typical triggers: live game data, new patches, platform APIs, pricing/features that change over time, dependencies and editorial facts with a freshness requirement.

### GEAR — Automation

Owns repetitive or scheduled workflows: CI/CD, scripts, cron/scheduled jobs, data refresh pipelines, content import, validation jobs, migrations and operational automations.

Typical triggers: anything repeated manually more than once, scheduled refreshes, deployment checks, recurring validation and batch processing.

### VECTOR — Optimization

Owns technical efficiency and optimization history: runtime performance, rendering, bundles, images, network cost, caching, database/query efficiency, duplicate code and UX performance.

VECTOR must always inspect its prior state before recommending optimization work. It should distinguish already-completed work from active and future work.

## Routing contract

For each non-trivial task, NEXUS should:

1. Classify the task by domain.
2. Select only the specialist cores that materially affect it.
3. Give each selected core a compact task brief.
4. Receive a specialist handoff containing decisions, risks, work performed and unresolved items.
5. Resolve conflicts between cores.
6. Implement or coordinate the integrated change.
7. Update persistent core state when the work meaningfully changes a specialist domain.

A task can be handled by NEXUS alone when no specialist domain is materially involved.

## Specialist handoff format

A specialist response should be compact and structured around:

- `scope`: what it reviewed;
- `decisions`: conclusions that affect implementation;
- `actions`: concrete work completed;
- `risks`: remaining concerns;
- `next`: follow-up work;
- `blocked`: missing information or dependencies.

Specialist cores should avoid restating unrelated project history.

## Cross-core examples

An external boss-art import typically routes to **ATLAS** for provenance/licensing and **VECTOR** only if image weight/delivery materially changes performance. **NEXUS** owns the final UI implementation.

A profile visibility feature typically routes to **VEIL** and **AEGIS**. VEIL defines who should see the data and the privacy expectations; AEGIS verifies enforcement and access control; NEXUS integrates the result.

A scheduled game-data refresh typically routes to **PULSE** to define freshness and **GEAR** to implement the recurring workflow. AEGIS or VEIL is added only when the pipeline introduces security or personal-data concerns.

## Persistent state

`docs/ai/core-state.json` is the shared memory for specialist work inside the repository. Each core has four operational buckets:

- `completed` — important work already done;
- `inProgress` — work currently underway;
- `next` — queued or recommended work;
- `blocked` — work waiting on a decision, source, credential or dependency.

Keep entries short, factual and useful for the next session. Do not turn the state file into a full changelog.

## Runtime evolution

If MGP later gains a real multi-agent backend, `src/config/aiCores.ts` should become the source of truth for routing metadata. A future orchestrator can map these logical cores to separate models, prompts, queues or workers without changing the domain boundaries defined here.
