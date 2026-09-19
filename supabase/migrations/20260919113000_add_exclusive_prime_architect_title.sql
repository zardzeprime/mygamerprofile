alter table public.profile_titles
  add column if not exists exclusive_to_user_id uuid null references public.profiles(id) on delete cascade;

create index if not exists profile_titles_exclusive_to_user_idx
  on public.profile_titles(exclusive_to_user_id)
  where exclusive_to_user_id is not null;

drop policy if exists profile_titles_public_read on public.profile_titles;
create policy profile_titles_public_read
  on public.profile_titles
  for select
  to anon, authenticated
  using (
    active = true
    and (
      exclusive_to_user_id is null
      or exclusive_to_user_id = (select auth.uid())
    )
  );

insert into public.profile_titles(
  slug,
  name,
  description,
  rarity,
  source,
  icon_key,
  unlock_rule,
  active,
  exclusive_to_user_id
)
select
  'prime-architect',
  jsonb_build_object(
    'pt-BR','Arquiteto Prime',
    'en','Prime Architect',
    'es','Arquitecto Prime'
  ),
  jsonb_build_object(
    'pt-BR','Título mítico exclusivo da conta fundadora Zardze Prime.',
    'en','Mythic title exclusive to the founding Zardze Prime account.',
    'es','Título mítico exclusivo de la cuenta fundadora Zardze Prime.'
  ),
  'mythic',
  'admin',
  'crown',
  '{"type":"exclusive_account"}'::jsonb,
  true,
  p.id
from public.profiles p
where lower(p.username) = 'zardze'
order by p.created_at asc
limit 1
on conflict(slug) do update set
  name = excluded.name,
  description = excluded.description,
  rarity = excluded.rarity,
  source = excluded.source,
  icon_key = excluded.icon_key,
  unlock_rule = excluded.unlock_rule,
  active = true,
  exclusive_to_user_id = excluded.exclusive_to_user_id,
  updated_at = now();

insert into public.profile_title_unlocks(user_id, title_slug, unlock_context, is_new)
select
  p.id,
  'prime-architect',
  jsonb_build_object('source','exclusive_account','account','zardze-prime'),
  true
from public.profiles p
where lower(p.username) = 'zardze'
  and exists (
    select 1
    from public.profile_titles t
    where t.slug = 'prime-architect'
      and t.exclusive_to_user_id = p.id
  )
order by p.created_at asc
limit 1
on conflict(user_id,title_slug) do nothing;
