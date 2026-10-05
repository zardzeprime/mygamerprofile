alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

create or replace function public.complete_mgp_onboarding_v1(
  p_username text,
  p_display_name text,
  p_language text,
  p_birth_date date,
  p_gender_identity text,
  p_gender_custom_label text default null,
  p_favorite_game_slugs text[] default '{}'::text[]
)
returns table(username text, display_name text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_username text := lower(trim(p_username));
  v_display_name text := trim(p_display_name);
  v_age integer;
begin
  if v_user_id is null then
    raise exception 'MGP_AUTH_REQUIRED';
  end if;

  if exists(select 1 from public.profiles where id = v_user_id) then
    raise exception 'MGP_ONBOARDING_ALREADY_COMPLETED';
  end if;

  if v_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'MGP_INVALID_USERNAME';
  end if;

  if char_length(v_display_name) < 1 or char_length(v_display_name) > 80 then
    raise exception 'MGP_INVALID_DISPLAY_NAME';
  end if;

  if p_language not in ('pt-BR','en','es') then
    raise exception 'MGP_INVALID_LANGUAGE';
  end if;

  if p_gender_identity not in ('male','female','non_binary','custom','prefer_not_to_say') then
    raise exception 'MGP_INVALID_GENDER';
  end if;

  if p_gender_identity = 'custom'
     and (p_gender_custom_label is null or char_length(trim(p_gender_custom_label)) < 1) then
    raise exception 'MGP_CUSTOM_GENDER_REQUIRED';
  end if;

  if p_birth_date is null or p_birth_date > current_date then
    raise exception 'MGP_INVALID_BIRTH_DATE';
  end if;

  v_age := extract(year from age(current_date, p_birth_date))::integer;
  if v_age < 13 or v_age > 120 then
    raise exception 'MGP_AGE_NOT_ALLOWED';
  end if;

  if exists (
    select 1
    from public.profile_usernames pu
    where lower(pu.username) = v_username
  ) then
    raise exception 'MGP_USERNAME_TAKEN';
  end if;

  insert into public.account_age_data(
    user_id,
    birth_date,
    guardian_status,
    age_assurance_method
  )
  values (
    v_user_id,
    p_birth_date,
    case when v_age < 18 then 'required' else 'not_applicable' end,
    'self_reported_birth_date'
  );

  insert into public.account_demographics(
    user_id,
    gender_identity,
    gender_custom_label
  )
  values (
    v_user_id,
    p_gender_identity,
    case
      when p_gender_identity = 'custom' then left(trim(p_gender_custom_label), 60)
      else null
    end
  );

  insert into public.profiles(
    id,
    username,
    display_name,
    language,
    theme_preference,
    visibility,
    onboarding_completed_at
  )
  values (
    v_user_id,
    v_username,
    v_display_name,
    p_language,
    'system',
    'public',
    now()
  );

  insert into public.profile_loadouts(user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  insert into public.profile_inventory(user_id, cosmetic_slug, acquisition_source)
  select v_user_id, pc.slug, 'starter'
  from public.profile_cosmetics pc
  where pc.active = true
    and pc.acquisition_method = 'starter'
  on conflict (user_id, cosmetic_slug) do nothing;

  insert into public.game_profiles(user_id, game_id, profile_data, visibility)
  select
    v_user_id,
    g.id,
    jsonb_build_object('favorite', true),
    'public'
  from public.games g
  where g.active = true
    and g.slug = any(coalesce(p_favorite_game_slugs, '{}'::text[]))
  on conflict (user_id, game_id)
  do update set
    profile_data = public.game_profiles.profile_data || jsonb_build_object('favorite', true),
    updated_at = now();

  return query
  select p.username, p.display_name
  from public.profiles p
  where p.id = v_user_id;
end;
$$;

revoke all on function public.complete_mgp_onboarding_v1(text,text,text,date,text,text,text[]) from public, anon;
grant execute on function public.complete_mgp_onboarding_v1(text,text,text,date,text,text,text[]) to authenticated;

comment on function public.complete_mgp_onboarding_v1(text,text,text,date,text,text,text[]) is
  'Atomic MGP onboarding: profile, private age/demographics, starter loadout/inventory and favorite games are committed together.';
