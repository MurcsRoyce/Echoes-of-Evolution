-- Logged-in users use the `authenticated` role, not `anon`. The original policies only
-- targeted `anon`, so Join Match fails after sign-in with:
--   new row violates row-level security policy for table "matchmaking_queue"
-- Run this in Supabase → SQL Editor if you already applied the older matchmaking migration.

drop policy if exists "Allow authenticated all matchmaking_queue" on public.matchmaking_queue;
create policy "Allow authenticated all matchmaking_queue"
  on public.matchmaking_queue for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Allow authenticated all matches" on public.matches;
create policy "Allow authenticated all matches"
  on public.matches for all
  to authenticated
  using (true)
  with check (true);
