-- Matchmaking listens for INSERT on public.matches; in-game sync listens for UPDATE on match_game_state.
-- Without these tables in supabase_realtime, clients never receive postgres_changes and pairing appears stuck.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_game_state'
  ) then
    alter publication supabase_realtime add table public.match_game_state;
  end if;
end $$;
