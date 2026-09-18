alter table public.profile_cosmetics
  drop constraint if exists profile_cosmetics_kind_check;

alter table public.profile_cosmetics
  add constraint profile_cosmetics_kind_check
  check (kind = any (array[
    'background'::text,
    'banner'::text,
    'badge'::text,
    'chibi'::text,
    'avatar_frame'::text,
    'cursor'::text,
    'profile_effect'::text
  ]));

alter table public.profile_loadouts
  add column if not exists avatar_frame_slug text null,
  add column if not exists cursor_slug text null,
  add column if not exists effect_slug text null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profile_loadouts_avatar_frame_slug_fkey') then
    alter table public.profile_loadouts
      add constraint profile_loadouts_avatar_frame_slug_fkey
      foreign key (avatar_frame_slug) references public.profile_cosmetics(slug)
      on update cascade on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profile_loadouts_cursor_slug_fkey') then
    alter table public.profile_loadouts
      add constraint profile_loadouts_cursor_slug_fkey
      foreign key (cursor_slug) references public.profile_cosmetics(slug)
      on update cascade on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profile_loadouts_effect_slug_fkey') then
    alter table public.profile_loadouts
      add constraint profile_loadouts_effect_slug_fkey
      foreign key (effect_slug) references public.profile_cosmetics(slug)
      on update cascade on delete set null;
  end if;
end
$$;

comment on column public.profile_loadouts.avatar_frame_slug is
  'Equipped profile avatar frame cosmetic.';
comment on column public.profile_loadouts.cursor_slug is
  'Equipped site cursor cosmetic; client must respect touch and reduced-motion accessibility.';
comment on column public.profile_loadouts.effect_slug is
  'Equipped profile presentation effect cosmetic.';
