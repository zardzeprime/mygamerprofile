create table public.game_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    game_id uuid not null references public.games(id) on delete cascade,
    profile_data jsonb not null default '{}',
    visibility text not null default 'public',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    unique (user_id, game_id),
    constraint visibility_check check (visibility in ('public', 'private'))
);

grant select, insert, update, delete on public.game_profiles to authenticated;
grant all on public.game_profiles to service_role;
grant select on public.game_profiles to anon;

alter table public.game_profiles enable row level security;

create policy "Public game profiles are viewable"
on public.game_profiles
for select
to anon, authenticated
using (visibility = 'public' or auth.uid() = user_id);

create policy "Users can create own game profiles"
on public.game_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own game profiles"
on public.game_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own game profiles"
on public.game_profiles
for delete
to authenticated
using (auth.uid() = user_id);

create trigger update_game_profiles_updated_at
before update on public.game_profiles
for each row execute function public.update_updated_at_column();