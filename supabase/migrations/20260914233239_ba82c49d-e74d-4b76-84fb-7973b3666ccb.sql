create table public.follows (
    id uuid primary key default gen_random_uuid(),
    follower_id uuid not null references public.profiles(id) on delete cascade,
    following_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    unique (follower_id, following_id),
    constraint no_self_follow check (follower_id != following_id)
);

grant select, insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;

alter table public.follows enable row level security;

create policy "Follows are visible to authenticated users"
on public.follows
for select
to authenticated
using (true);

create policy "Users can follow others"
on public.follows
for insert
to authenticated
with check (auth.uid() = follower_id and auth.uid() != following_id);

create policy "Users can unfollow"
on public.follows
for delete
to authenticated
using (auth.uid() = follower_id);