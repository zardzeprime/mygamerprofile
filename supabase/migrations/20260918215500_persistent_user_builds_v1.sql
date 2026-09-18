create table if not exists public.user_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_slug text not null references public.games(slug) on update cascade on delete cascade,
  subject_key text null,
  title text not null check (char_length(title) between 1 and 100),
  build_data jsonb not null default '{}'::jsonb,
  source_context jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_builds_user_game_idx
  on public.user_builds(user_id, game_slug, updated_at desc);

create index if not exists user_builds_public_game_idx
  on public.user_builds(game_slug, updated_at desc)
  where visibility = 'public';

alter table public.user_builds enable row level security;

drop policy if exists "public builds readable" on public.user_builds;
create policy "public builds readable"
on public.user_builds
for select
to anon, authenticated
using (visibility = 'public' or auth.uid() = user_id);

drop policy if exists "owners create builds" on public.user_builds;
create policy "owners create builds"
on public.user_builds
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "owners update builds" on public.user_builds;
create policy "owners update builds"
on public.user_builds
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "owners delete builds" on public.user_builds;
create policy "owners delete builds"
on public.user_builds
for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists update_user_builds_updated_at on public.user_builds;
create trigger update_user_builds_updated_at
before update on public.user_builds
for each row execute function public.update_updated_at_column();

create or replace function public.save_user_build_v1(
  p_game_slug text,
  p_subject_key text,
  p_title text,
  p_build_data jsonb,
  p_source_context jsonb default '{}'::jsonb,
  p_visibility text default 'private'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'MGP_AUTH_REQUIRED';
  end if;

  if not exists(select 1 from public.profiles where id = v_user_id) then
    raise exception 'MGP_PROFILE_REQUIRED';
  end if;

  if not exists(select 1 from public.games where slug = p_game_slug and active = true) then
    raise exception 'MGP_GAME_UNAVAILABLE';
  end if;

  if p_visibility not in ('public','private') then
    raise exception 'MGP_INVALID_VISIBILITY';
  end if;

  if char_length(trim(p_title)) < 1 or char_length(trim(p_title)) > 100 then
    raise exception 'MGP_INVALID_BUILD_TITLE';
  end if;

  insert into public.user_builds(
    user_id,
    game_slug,
    subject_key,
    title,
    build_data,
    source_context,
    visibility
  )
  values (
    v_user_id,
    p_game_slug,
    nullif(trim(p_subject_key), ''),
    trim(p_title),
    coalesce(p_build_data, '{}'::jsonb),
    coalesce(p_source_context, '{}'::jsonb),
    p_visibility
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.save_user_build_v1(text,text,text,jsonb,jsonb,text) from public, anon;
grant execute on function public.save_user_build_v1(text,text,text,jsonb,jsonb,text) to authenticated;
