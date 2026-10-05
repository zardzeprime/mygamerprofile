<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# MGP AI orchestration

MGP uses a mother/core model for AI-assisted development. The goal is to keep context small, responsibilities explicit, and specialist work reusable across sessions.

Before non-trivial work, read `docs/AI_ORCHESTRATION.md` and `docs/ai/core-state.json`.

## Mother core

**NEXUS** is the orchestration core. It owns the final plan, cross-domain integration, implementation decisions, conflict resolution, and user-facing handoff. NEXUS should delegate specialist analysis instead of making every specialist domain part of every task.

## Specialist cores

- **Sabnock / Security** — authentication, authorization, abuse prevention, secrets, dependency risk, attack surface and security review.
- **Bael / Privacy** — personal data, consent, retention, telemetry, account data, visibility and privacy-by-design.
- **Andromalius / Image Rights & Licensing** — image provenance, copyright/licensing, attribution, asset reuse, external media and right-of-image concerns.
- **Vassago / Updates** — stale data, game/platform changes, editorial freshness, dependency/version review and update tracking.
- **Marbas / Automation** — repetitive workflows, scheduled jobs, CI/CD, scripts, content pipelines and operational automation.
- **Andrealphus / Optimization** — performance, bundle/runtime cost, image delivery, UX efficiency, code duplication and technical optimization backlog.

## Routing rules

1. NEXUS remains the only core responsible for the integrated answer/implementation.
2. Use the minimum number of specialist cores needed for the task. Do not involve every core by default.
3. A specialist core must stay within its domain unless NEXUS explicitly requests a cross-domain handoff.
4. Cross-cutting changes may involve multiple cores, but each core reports only its own risks, decisions and actions.
5. Security/privacy/licensing concerns take precedence over convenience when they materially affect a change.
6. Do not claim that a specialist core is an autonomous background process unless a real runtime/worker exists. Today these cores are persistent development roles and routing contracts.
7. After meaningful work in a specialist domain, update the matching entry in `docs/ai/core-state.json` with concise `completed`, `inProgress`, `next`, and `blocked` notes.
8. For optimization work, Andrealphus must inspect previous optimization state before proposing new work, so completed work is not repeated.
9. For external images/assets, Andromalius must preserve source/provenance metadata and prefer assets with a clear reuse/attribution path.
10. Keep specialist outputs compact enough that NEXUS can integrate them without loading unrelated project context.

The machine-readable registry for these roles lives in `src/config/aiCores.ts`.

## Os Sete — Conselho da NEXUS

NEXUS (A Regente) is the parent AI and integration owner. The six specialists are child AI agents: scoped specializations invoked under NEXUS coordination, not independent permanently running workers.

- **NEXUS (Coordenação e IA) — A Regente**; stable technical ID: `nexus`.
- **Sabnock (Segurança) — A Fortaleza**; stable technical ID: `aegis`.
- **Bael (Privacidade) — O Véu**; stable technical ID: `veil`.
- **Andromalius (Direitos e procedência) — O Guardião da Procedência**; stable technical ID: `atlas`.
- **Vassago (Pesquisa e atualizações) — O Investigador**; stable technical ID: `pulse`.
- **Marbas (Automação) — O Artífice**; stable technical ID: `gear`.
- **Andrealphus (Performance e UX) — O Geômetra**; stable technical ID: `vector`.

Names and epithets are creative branding inspired by the Ars Goetia. Responsibilities are the project's operational contract, not historical claims. Stable IDs preserve stored history and routing compatibility. Reports use `name (function)` and the masthead `MG PROFILE · OS SETE`.
