create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('bug','idea','content','next_game','other')),
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'open' check (status in ('open','reviewing','answered','closed')),
  admin_reply text null check (admin_reply is null or char_length(admin_reply) <= 4000),
  replied_by uuid null references public.profiles(id) on delete set null,
  replied_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_feedback enable row level security;

revoke all on table public.site_feedback from anon;
revoke all on table public.site_feedback from authenticated;

grant select, insert, update on table public.site_feedback to authenticated;
grant all on table public.site_feedback to service_role;

drop policy if exists "Users can create own feedback" on public.site_feedback;
create policy "Users can create own feedback"
on public.site_feedback for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own feedback and admins can view all" on public.site_feedback;
create policy "Users can view own feedback and admins can view all"
on public.site_feedback for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::public.app_role
  )
);

drop policy if exists "Admins can update feedback" on public.site_feedback;
create policy "Admins can update feedback"
on public.site_feedback for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::public.app_role
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'admin'::public.app_role
  )
);

create index if not exists site_feedback_user_created_idx
  on public.site_feedback (user_id, created_at desc);

create index if not exists site_feedback_status_created_idx
  on public.site_feedback (status, created_at desc);
