create or replace function public.profile_follow_counts(target_user_id uuid)
returns table(followers bigint, following bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.follows where following_id = target_user_id)::bigint as followers,
    (select count(*) from public.follows where follower_id = target_user_id)::bigint as following;
$$;

revoke all on function public.profile_follow_counts(uuid) from public;
grant execute on function public.profile_follow_counts(uuid) to anon, authenticated;

create or replace function public.is_username_available(candidate text, exclude_user_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    candidate ~ '^[a-z0-9_]{3,20}$'
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(candidate)
        and (exclude_user_id is null or id <> exclude_user_id)
    );
$$;

revoke all on function public.is_username_available(text, uuid) from public;
grant execute on function public.is_username_available(text, uuid) to anon, authenticated;
