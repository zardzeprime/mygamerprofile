create or replace function public.get_public_profile_loadout(target_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare l public.profile_loadouts%rowtype;
begin
 if not exists(select 1 from public.profiles p where p.id=target_user_id and p.visibility='public') then return null; end if;
 select * into l from public.profile_loadouts where user_id=target_user_id;
 if not found then return jsonb_build_object('title',null,'background',null,'avatarFrame',null,'effect',null,'banner',null,'cursor',null); end if;
 return jsonb_build_object(
  'title',(select jsonb_build_object('slug',t.slug,'name',t.name,'description',t.description,'rarity',t.rarity,'iconKey',t.icon_key) from public.profile_titles t where t.slug=l.title_slug and t.active=true),
  'background',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.background_slug and c.active=true),
  'avatarFrame',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.avatar_frame_slug and c.active=true),
  'effect',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.effect_slug and c.active=true),
  'banner',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.banner_slug and c.active=true),
  'cursor',(select jsonb_build_object('slug',c.slug,'name',c.name,'rarity',c.rarity,'cssClass',c.css_class,'animated',c.animated) from public.profile_cosmetics c where c.slug=l.cursor_slug and c.active=true)
 );
end $$;
revoke all on function public.get_public_profile_loadout(uuid) from public;
grant execute on function public.get_public_profile_loadout(uuid) to anon,authenticated;
