-- Logged-in clients use JWT role `authenticated`; match_game_state had only `anon` policies.
drop policy if exists "Allow authenticated all match_game_state" on public.match_game_state;
create policy "Allow authenticated all match_game_state"
  on public.match_game_state for all to authenticated using (true) with check (true);
