alter table public.profiles add column if not exists profile_background text not null default 'mgp-grid';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_profile_background_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_profile_background_check
      check (profile_background in ('mgp-grid','ember','tactical','midnight'));
  end if;
end $$;

create index if not exists comments_author_id_idx on public.comments(author_id);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists follows_following_id_idx on public.follows(following_id);
create index if not exists game_profiles_game_id_idx on public.game_profiles(game_id);
create index if not exists lfg_posts_game_id_idx on public.lfg_posts(game_id);
create index if not exists lfg_posts_user_id_idx on public.lfg_posts(user_id);
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_game_id_idx on public.posts(game_id);
create index if not exists reactions_post_id_idx on public.reactions(post_id);
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists reports_reviewed_by_idx on public.reports(reviewed_by);

alter policy "Users can read own roles" on public.user_roles using ((select auth.uid()) = user_id);
alter policy "Public profiles are viewable by everyone" on public.profiles using ((visibility = 'public') or ((select auth.uid()) = id));
alter policy "Users can create own profile" on public.profiles with check ((select auth.uid()) = id);
alter policy "Users can delete own profile" on public.profiles using ((select auth.uid()) = id);
alter policy "Users can update own profile" on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy "Authors can delete own posts" on public.posts using ((select auth.uid()) = author_id);
alter policy "Authors can update own posts" on public.posts using (((select auth.uid()) = author_id) and (deleted_at is null)) with check ((select auth.uid()) = author_id);
alter policy "Users can create posts" on public.posts with check ((select auth.uid()) = author_id);
alter policy "Public game profiles are viewable" on public.game_profiles using ((visibility = 'public') or ((select auth.uid()) = user_id));
alter policy "Users can create own game profiles" on public.game_profiles with check ((select auth.uid()) = user_id);
alter policy "Users can delete own game profiles" on public.game_profiles using ((select auth.uid()) = user_id);
alter policy "Users can update own game profiles" on public.game_profiles using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can follow others" on public.follows with check (((select auth.uid()) = follower_id) and ((select auth.uid()) <> following_id));
alter policy "Users can unfollow" on public.follows using ((select auth.uid()) = follower_id);
alter policy "Creators can delete own LFG posts" on public.lfg_posts using ((select auth.uid()) = user_id);
alter policy "Creators can update own LFG posts" on public.lfg_posts using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can create LFG posts" on public.lfg_posts with check ((select auth.uid()) = user_id);
alter policy "Users can add reactions" on public.reactions with check ((select auth.uid()) = user_id);
alter policy "Users can remove own reactions" on public.reactions using ((select auth.uid()) = user_id);
alter policy "Authors can delete own comments" on public.comments using ((select auth.uid()) = author_id);
alter policy "Authors can update own comments" on public.comments using (((select auth.uid()) = author_id) and (deleted_at is null)) with check ((select auth.uid()) = author_id);
alter policy "Users can create comments" on public.comments with check ((select auth.uid()) = author_id);
alter policy "Users can create reports" on public.reports with check ((select auth.uid()) = reporter_id);
alter policy "Admins can update reports" on public.reports using (exists (select 1 from public.user_roles where user_roles.user_id = (select auth.uid()) and user_roles.role = 'admin'::app_role)) with check (exists (select 1 from public.user_roles where user_roles.user_id = (select auth.uid()) and user_roles.role = 'admin'::app_role));
alter policy "Users can view own reports and admins can view all" on public.reports using (((select auth.uid()) = reporter_id) or exists (select 1 from public.user_roles where user_roles.user_id = (select auth.uid()) and user_roles.role = 'admin'::app_role));
