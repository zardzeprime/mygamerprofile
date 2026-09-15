-- v0.1.5A — moderated editorial automation queue.
-- This table is intentionally service-role only: RLS is enabled and no client policy is granted.
-- AI-generated material starts as a draft and cannot become a community post merely by being inserted here.

create table if not exists public.community_editorial_drafts (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text not null,
  body text not null,
  interaction_prompt text,
  source_url text,
  source_label text,
  source_published_at timestamptz,
  audience_rating text not null default 'general',
  model_label text,
  status text not null default 'draft',
  scheduled_for timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_editorial_drafts_status_check
    check (status in ('draft', 'approved', 'scheduled', 'published', 'rejected')),
  constraint community_editorial_drafts_audience_check
    check (audience_rating in ('general', 'teen', 'mature'))
);

comment on table public.community_editorial_drafts is
  'Server-only queue for sourced MGP editorial drafts. Draft generation and publication are separate steps.';
comment on column public.community_editorial_drafts.source_url is
  'Primary source used to ground the draft. Prefer official publisher/developer sources for automated topics.';
comment on column public.community_editorial_drafts.model_label is
  'Internal provenance for automation/model version; not a claim that the model is the author of the source.';

alter table public.community_editorial_drafts enable row level security;

create index if not exists community_editorial_drafts_status_schedule_idx
  on public.community_editorial_drafts (status, scheduled_for);
create index if not exists community_editorial_drafts_game_created_idx
  on public.community_editorial_drafts (game_id, created_at desc);
