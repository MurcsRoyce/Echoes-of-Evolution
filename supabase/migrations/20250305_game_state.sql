-- Game state per match: turn, health, EP, game over. Enable Realtime for sync.
create table if not exists public.match_game_state (
  match_id uuid primary key references public.matches(id) on delete cascade,
  state jsonb not null default '{}',
  updated_at timestamptz default now()
);

comment on table public.match_game_state is 'Synced game state: turn, player health/EP, gameOver. Enable Realtime (UPDATE).';

alter table public.match_game_state enable row level security;

drop policy if exists "Allow anon all match_game_state" on public.match_game_state;
create policy "Allow anon all match_game_state"
  on public.match_game_state for all to anon using (true) with check (true);
