-- Harden permissive read policies without changing intended public features.

alter policy "Games are publicly readable"
on public.games
using (active = true);

alter policy "Game modules are publicly readable"
on public.game_modules
using (
  enabled = true
  and exists (
    select 1
    from public.games g
    where g.id = game_modules.game_id
      and g.active = true
  )
);

alter policy "LFG posts are publicly readable"
on public.lfg_posts
using (
  (
    status = 'open'
    and (expires_at is null or expires_at > now())
  )
  or (select auth.uid()) = user_id
);

alter policy "Usernames are publicly readable"
on public.profile_usernames
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_usernames.user_id
      and (
        p.visibility = 'public'
        or p.id = (select auth.uid())
      )
  )
);

alter policy "Reactions are publicly readable"
on public.reactions
using (
  exists (
    select 1
    from public.posts p
    where p.id = reactions.post_id
      and p.deleted_at is null
  )
);

alter policy "Follows are visible to authenticated users"
on public.follows
using (
  follower_id = (select auth.uid())
  or following_id = (select auth.uid())
  or (
    exists (
      select 1
      from public.profiles pf
      where pf.id = follows.follower_id
        and pf.visibility = 'public'
    )
    and exists (
      select 1
      from public.profiles pt
      where pt.id = follows.following_id
        and pt.visibility = 'public'
    )
  )
);

-- Public object retrieval is already controlled by the public bucket flag.
-- Removing these broad SELECT policies prevents unrestricted object listing.
drop policy if exists "Avatar images are publicly viewable" on storage.objects;
drop policy if exists "Banner images are publicly viewable" on storage.objects;
drop policy if exists "Post images are publicly viewable" on storage.objects;
