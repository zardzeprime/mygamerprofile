create table public.comments (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.posts(id) on delete cascade,
    author_id uuid not null references public.profiles(id) on delete cascade,
    body text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone,
    constraint body_length check (length(body) <= 1000)
);

grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
grant select on public.comments to anon;

alter table public.comments enable row level security;

create policy "Active comments are publicly readable"
on public.comments
for select
to anon, authenticated
using (deleted_at is null);

create policy "Users can create comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Authors can update own comments"
on public.comments
for update
to authenticated
using (auth.uid() = author_id and deleted_at is null)
with check (auth.uid() = author_id);

create policy "Authors can soft delete own comments"
on public.comments
for delete
to authenticated
using (auth.uid() = author_id);

create trigger update_comments_updated_at
before update on public.comments
for each row execute function public.update_updated_at_column();