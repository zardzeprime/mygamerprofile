create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    display_name text not null,
    bio text,
    avatar_url text,
    banner_url text,
    language text not null default 'pt-BR',
    theme_preference text not null default 'system',
    visibility text not null default 'public',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint username_format check (username ~* '^[a-z0-9_]{3,20}$'),
    constraint language_check check (language in ('pt-BR', 'en')),
    constraint theme_check check (theme_preference in ('light', 'dark', 'system')),
    constraint visibility_check check (visibility in ('public', 'private'))
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.profiles to anon;

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
on public.profiles
for select
to anon, authenticated
using (visibility = 'public' or auth.uid() = id);

create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();