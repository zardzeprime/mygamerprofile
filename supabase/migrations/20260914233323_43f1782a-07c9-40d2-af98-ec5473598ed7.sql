create table public.reports (
    id uuid primary key default gen_random_uuid(),
    reporter_id uuid not null references public.profiles(id) on delete cascade,
    target_type text not null,
    target_id uuid not null,
    reason text not null,
    details text,
    status text not null default 'pending',
    created_at timestamp with time zone not null default now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid references public.profiles(id) on delete set null,
    constraint target_type_check check (target_type in ('profile', 'post', 'comment', 'lfg')),
    constraint reason_check check (reason in ('spam', 'harassment', 'hate', 'sexual_content', 'extreme_violence', 'scam', 'other')),
    constraint status_check check (status in ('pending', 'reviewing', 'resolved', 'rejected'))
);

grant select, insert on public.reports to authenticated;
grant all on public.reports to service_role;

alter table public.reports enable row level security;

create policy "Users can view own reports and admins can view all"
on public.reports
for select
to authenticated
using (
    auth.uid() = reporter_id
    or exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = 'admin'
    )
);

create policy "Users can create reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = reporter_id);

create policy "Admins can update reports"
on public.reports
for update
to authenticated
using (
    exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = 'admin'
    )
)
with check (
    exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = 'admin'
    )
);