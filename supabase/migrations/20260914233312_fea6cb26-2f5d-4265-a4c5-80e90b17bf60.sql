create table public.reactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    post_id uuid not null references public.posts(id) on delete cascade,
    reaction_type text not null default 'like',
    created_at timestamp with time zone not null default now(),
    unique (user_id, post_id, reaction_type)
);

grant select, insert, delete on public.reactions to authenticated;
grant all on public.reactions to service_role;
grant select on public.reactions to anon;

alter table public.reactions enable row level security;

create policy "Reactions are publicly readable"
on public.reactions
for select
to anon, authenticated
using (true);

create policy "Users can add reactions"
on public.reactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove own reactions"
on public.reactions
for delete
to authenticated
using (auth.uid() = user_id);