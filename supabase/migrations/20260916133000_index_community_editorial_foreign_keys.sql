create index if not exists community_editorial_drafts_published_post_idx
  on public.community_editorial_drafts(published_post_id);

create index if not exists community_editorial_drafts_reviewed_by_idx
  on public.community_editorial_drafts(reviewed_by);
