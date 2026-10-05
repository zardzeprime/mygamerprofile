alter table public.profiles
  add column if not exists accent_color text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_accent_color_hex_check'
  ) then
    alter table public.profiles
      add constraint profiles_accent_color_hex_check
      check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end
$$;

comment on column public.profiles.accent_color is
  'Optional user-selected six-digit hex accent color for MG Profile UI personalization.';
