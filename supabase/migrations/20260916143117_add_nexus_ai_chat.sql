create table if not exists public.nexus_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa' check (char_length(title) between 1 and 120),
  mode text not null default 'gaming' check (mode in ('gaming', 'development')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.nexus_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.nexus_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 12000),
  core_ids text[] not null default array['nexus']::text[],
  provider text,
  model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nexus_threads_user_last_message_idx
  on public.nexus_threads (user_id, last_message_at desc);
create index if not exists nexus_messages_thread_created_idx
  on public.nexus_messages (thread_id, created_at);
create index if not exists nexus_messages_user_created_idx
  on public.nexus_messages (user_id, created_at desc);

alter table public.nexus_threads enable row level security;
alter table public.nexus_messages enable row level security;

create policy "Users can read own Nexus threads"
  on public.nexus_threads for select
  using (auth.uid() = user_id);
create policy "Users can create own Nexus threads"
  on public.nexus_threads for insert
  with check (auth.uid() = user_id);
create policy "Users can update own Nexus threads"
  on public.nexus_threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete own Nexus threads"
  on public.nexus_threads for delete
  using (auth.uid() = user_id);

create policy "Users can read messages in own Nexus threads"
  on public.nexus_messages for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.nexus_threads t
      where t.id = nexus_messages.thread_id
        and t.user_id = auth.uid()
    )
  );
create policy "Users can create messages in own Nexus threads"
  on public.nexus_messages for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.nexus_threads t
      where t.id = nexus_messages.thread_id
        and t.user_id = auth.uid()
    )
  );
