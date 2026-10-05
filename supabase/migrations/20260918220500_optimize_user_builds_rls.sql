drop policy if exists "public builds readable" on public.user_builds;
create policy "public builds readable"
on public.user_builds
for select
to anon, authenticated
using (visibility = 'public' or (select auth.uid()) = user_id);

drop policy if exists "owners create builds" on public.user_builds;
create policy "owners create builds"
on public.user_builds
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "owners update builds" on public.user_builds;
create policy "owners update builds"
on public.user_builds
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "owners delete builds" on public.user_builds;
create policy "owners delete builds"
on public.user_builds
for delete
to authenticated
using ((select auth.uid()) = user_id);
