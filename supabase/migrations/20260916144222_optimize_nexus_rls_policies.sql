drop policy if exists "Users can read own Nexus threads" on public.nexus_threads;
drop policy if exists "Users can create own Nexus threads" on public.nexus_threads;
drop policy if exists "Users can update own Nexus threads" on public.nexus_threads;
drop policy if exists "Users can delete own Nexus threads" on public.nexus_threads;
drop policy if exists "Users can read messages in own Nexus threads" on public.nexus_messages;
drop policy if exists "Users can create messages in own Nexus threads" on public.nexus_messages;

create policy "Users can read own Nexus threads"
  on public.nexus_threads for select
  using ((select auth.uid()) = user_id);
create policy "Users can create own Nexus threads"
  on public.nexus_threads for insert
  with check ((select auth.uid()) = user_id);
create policy "Users can update own Nexus threads"
  on public.nexus_threads for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete own Nexus threads"
  on public.nexus_threads for delete
  using ((select auth.uid()) = user_id);

create policy "Users can read messages in own Nexus threads"
  on public.nexus_messages for select
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.nexus_threads t
      where t.id = nexus_messages.thread_id
        and t.user_id = (select auth.uid())
    )
  );
create policy "Users can create messages in own Nexus threads"
  on public.nexus_messages for insert
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.nexus_threads t
      where t.id = nexus_messages.thread_id
        and t.user_id = (select auth.uid())
    )
  );
