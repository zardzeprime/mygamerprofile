create table public.lfg_posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    game_id uuid not null references public.games(id) on delete cascade,
    platform text not null,
    region text,
    language text,
    mode text,
    description text not null,
    mic_required boolean not null default false,
    slots_total integer not null default 1,
    slots_open integer not null default 1,
    status text not null default 'open',
    expires_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint status_check check (status in ('open', 'closed', 'expired')),
    constraint slots_positive check (slots_total > 0 and slots_open >= 0)
);

grant select, insert, update, delete on public.lfg_posts to authenticated;
grant all on public.lfg_posts to service_role;
grant select on public.lfg_posts to anon;

alter table public.lfg_posts enable row level security;

create policy "LFG posts are publicly readable"
on public.lfg_posts
for select
to anon, authenticated
using (true);

create policy "Users can create LFG posts"
on public.lfg_posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Creators can update own LFG posts"
on public.lfg_posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Creators can delete own LFG posts"
on public.lfg_posts
for delete
to authenticated
using (auth.uid() = user_id);

create trigger update_lfg_posts_updated_at
before update on public.lfg_posts
for each row execute function public.update_updated_at_column();