-- Match chat: messages per game for player-to-player chat

create table if not exists public.match_chat (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_slot smallint not null check (player_slot in (1, 2)),
  display_name text,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists match_chat_match_id_idx on public.match_chat (match_id, created_at desc);

comment on table public.match_chat is 'In-game chat messages per match.';

alter table public.match_chat enable row level security;

drop policy if exists "Allow anon all match_chat" on public.match_chat;
create policy "Allow anon all match_chat"
  on public.match_chat for all to anon using (true) with check (true);

-- Safe to re-run: skip if table is already in the Realtime publication
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_chat'
  ) then
    alter publication supabase_realtime add table public.match_chat;
  end if;
end $$;