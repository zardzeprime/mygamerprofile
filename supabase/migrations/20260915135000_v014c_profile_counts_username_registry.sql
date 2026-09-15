alter table public.profiles
  add column if not exists followers_count bigint not null default 0,
  add column if not exists following_count bigint not null default 0;

update public.profiles p
set followers_count = (select count(*) from public.follows f where f.following_id = p.id),
    following_count = (select count(*) from public.follows f where f.follower_id = p.id);

create table if not exists public.profile_usernames (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null
);
create unique index if not exists profile_usernames_lower_username_uidx
  on public.profile_usernames (lower(username));
alter table public.profile_usernames enable row level security;

drop policy if exists "Usernames are publicly readable" on public.profile_usernames;
create policy "Usernames are publicly readable"
  on public.profile_usernames for select
  to anon, authenticated
  using (true);

insert into public.profile_usernames(user_id, username)
select id, username from public.profiles
on conflict (user_id) do update set username = excluded.username;

create or replace function public.sync_profile_username_registry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.profile_usernames where user_id = old.id;
    return old;
  end if;
  insert into public.profile_usernames(user_id, username)
  values (new.id, new.username)
  on conflict (user_id) do update set username = excluded.username;
  return new;
end;
$$;

revoke all on function public.sync_profile_username_registry() from public, anon, authenticated;

drop trigger if exists profiles_sync_username_registry on public.profiles;
create trigger profiles_sync_username_registry
after insert or update of username or delete on public.profiles
for each row execute function public.sync_profile_username_registry();

create or replace function public.sync_profile_follow_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
    return old;
  end if;
  return null;
end;
$$;

revoke all on function public.sync_profile_follow_counts() from public, anon, authenticated;

drop trigger if exists follows_sync_profile_counts on public.follows;
create trigger follows_sync_profile_counts
after insert or delete on public.follows
for each row execute function public.sync_profile_follow_counts();

drop function if exists public.profile_follow_counts(uuid);
drop function if exists public.is_username_available(text, uuid);
