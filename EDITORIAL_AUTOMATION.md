# MGP — Community Editorial Automation

Last reviewed: 2026-09-15

## Goal

Publish useful, conversation-starting MGP editorial content on a regular cadence without giving a language model unrestricted write access to the live community.

The initial target is **one candidate post per day**, rotating through active game communities. Generation and publication are deliberately separate operations.

## Lifecycle

`source discovery -> grounded draft -> automated checks -> human review -> scheduled -> published`

The database queue is `public.community_editorial_drafts` and is server-only by default through RLS.

## Source policy

Prefer first-party sources whenever a post depends on a changing fact:

- Riot Games / official VALORANT or League channels;
- Bandai Namco / FromSoftware official pages for Souls, Elden Ring and Nightreign;
- EA official channels for EA SPORTS FC;
- Steam/Valve documentation when the topic is Steam functionality;
- MGP's own evergreen editorial data for prompts that do not require fresh external facts.

Community sources may be used to discover a topic, but an automated MGP Editorial post should not restate rumors as facts. Leaks, private material, paywalled copying and scraped full articles are out of scope.

## Daily scheduler

A future server-side scheduler should:

1. pick an active game that has not received a recent automated candidate;
2. choose either an evergreen prompt or a current topic from an allowlisted source;
3. fetch only the context needed for that topic;
4. generate a concise title, body and interaction prompt;
5. attach source URL/label, source publication date when available, audience rating and model/version metadata;
6. run duplicate and safety checks;
7. insert the result with `status = 'draft'`;
8. stop. It must **not** publish merely because generation succeeded.

## Checks before approval

A candidate should be rejected or sent back for editing when it:

- has no source for a changing factual claim;
- materially duplicates a recent MGP post;
- invents patch notes, release dates, rankings, quotes or API capabilities;
- copies long passages from a source;
- contains explicit sexual material, gratuitous gore, harassment, hate, doxxing or instructions that put minors at risk;
- reveals major story spoilers without an appropriate warning;
- presents a rumor or community theory as confirmed fact;
- implies MGP is officially endorsed by a publisher when it is not;
- presents manual/derived profile data as provider-verified data.

## Audience labels

- `general`: ordinary discussion suitable for the broad community;
- `teen`: typical discussion of games with violence or mature themes, without prohibited explicit material;
- `mature`: lawful sensitive discussion that requires stronger presentation controls and must still comply with MGP's content rules.

An audience label never authorizes pornography, explicit sexual content, exploitation or gratuitous gore.

## Publication phase

For the first production phase, a moderator must move a candidate from `draft` to `approved`. A publisher job may then turn an approved/scheduled draft into a normal MGP Editorial post and record `published_post_id`.

Only after MGP has an audit history should narrow classes of evergreen content be considered for auto-approval. Current news, patch changes, legal/API changes and mature topics should continue requiring human review.

## Suggested daily mix

The automation should avoid becoming a news bot only. A healthy rotation can include:

- questions that invite personal experience;
- build or playstyle discussions;
- official patch/update summaries with source;
- lore prompts clearly separated from confirmed canon vs theory;
- esports discussion based on official/current results;
- beginner-friendly tips already verified in MGP editorial data;
- anniversaries or historical facts with a source;
- community challenges that do not encourage cheating or abuse.

## Provider constraints

Riot-related automation must respect Riot's developer/content rules and must not create alternate MMR/ELO systems or features that compromise competitive integrity. EA account/API claims must reflect the access actually granted to MGP. Steam and Google integrations are separate from editorial publishing and their credentials must never be passed to an LLM prompt.

## Secrets and model access

Any future model API key is server-side only. Provider tokens, OAuth secrets, Supabase service-role keys and raw authentication credentials must never be included in model prompts, browser bundles, draft text or public logs.
