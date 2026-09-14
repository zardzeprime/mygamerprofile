create table public.posts (
    id uuid primary key default gen_random_uuid(),
    author_id uuid not null references public.profiles(id) on delete cascade,
    game_id uuid references public.games(id) on delete set null,
    body text not null,
    image_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone,
    constraint body_length check (length(body) <= 2000)
);

grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
grant select on public.posts to anon;

alter table public.posts enable row level security;

create policy "Active posts are publicly readable"
on public.posts
for select
to anon, authenticated
using (deleted_at is null);

create policy "Users can create posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Authors can update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id and deleted_at is null)
with check (auth.uid() = author_id);

create policy "Authors can soft delete own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id);

create trigger update_posts_updated_at
before update on public.posts
for each row execute function public.update_updated_at_column();