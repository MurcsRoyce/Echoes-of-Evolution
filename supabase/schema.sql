-- Echoes of Evolution – Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Card set: every card we create for the game (source of truth)
create table if not exists public.cards (
  id text primary key,
  name text not null,
  tier smallint not null,
  flavor text,
  evolution_color_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.cards is 'Card set for Echoes of Evolution; one row per card.';

-- Player profiles (Option A)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  favorite_occupation_id text references public.cards(id) on delete set null,
  favorite_color_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'Player profiles: name and favorite occupation/color.';

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cards_updated_at on public.cards;
create trigger cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Allow anonymous read/write for now (no auth required). Tighten with RLS later when you add auth.
alter table public.cards enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Allow anon read cards" on public.cards;
create policy "Allow anon read cards"
  on public.cards for select
  to anon
  using (true);

drop policy if exists "Allow anon insert cards" on public.cards;
create policy "Allow anon insert cards"
  on public.cards for insert
  to anon
  with check (true);

drop policy if exists "Allow anon update cards" on public.cards;
create policy "Allow anon update cards"
  on public.cards for update
  to anon
  using (true);

drop policy if exists "Allow anon read profiles" on public.profiles;
create policy "Allow anon read profiles"
  on public.profiles for select
  to anon
  using (true);

drop policy if exists "Allow anon insert profiles" on public.profiles;
create policy "Allow anon insert profiles"
  on public.profiles for insert
  to anon
  with check (true);

drop policy if exists "Allow anon update profiles" on public.profiles;
create policy "Allow anon update profiles"
  on public.profiles for update
  to anon
  using (true);

-- Seed the 15 base occupation cards (id matches app slugs)
insert into public.cards (id, name, tier, flavor) values
  ('doctor', 'Doctor', 1, 'Heal and protect.'),
  ('teacher', 'Teacher', 1, 'Guide and inspire.'),
  ('farmer', 'Farmer', 1, 'Feed and sustain.'),
  ('engineer', 'Engineer', 1, 'Build and solve.'),
  ('worker', 'Worker', 1, 'Labor and produce.'),
  ('lawyer', 'Lawyer', 2, 'Argue and defend.'),
  ('police-officer', 'Police Officer', 2, 'Enforce and protect.'),
  ('soldier', 'Soldier', 2, 'Serve and fight.'),
  ('politician', 'Politician', 2, 'Lead and decide.'),
  ('merchant', 'Merchant', 3, 'Trade and connect.'),
  ('banker', 'Banker', 3, 'Finance and grow.'),
  ('entrepreneur', 'Entrepreneur', 3, 'Risk and build.'),
  ('artist', 'Artist', 4, 'Imagine and express.'),
  ('scientist', 'Scientist', 4, 'Discover and prove.'),
  ('journalist', 'Journalist', 5, 'Expose and inform.')
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  flavor = excluded.flavor,
  updated_at = now();

-- Matchmaking: queue and matches (2 players per match)
create table if not exists public.matchmaking_queue (
  id uuid primary key default gen_random_uuid(),
  user_ref text not null,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  player1_ref text not null,
  player2_ref text not null,
  created_at timestamptz default now(),
  status text not null default 'active'
);

comment on table public.matchmaking_queue is 'Players waiting for a match; 2 are paired into public.matches.';
comment on table public.matches is 'Active matches; one row per game (2 players). Enable Realtime (Table → Replication) for INSERT so clients can subscribe.';

alter table public.matchmaking_queue enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Allow anon all matchmaking_queue" on public.matchmaking_queue;
create policy "Allow anon all matchmaking_queue"
  on public.matchmaking_queue for all to anon using (true) with check (true);

drop policy if exists "Allow anon all matches" on public.matches;
create policy "Allow anon all matches"
  on public.matches for all to anon using (true) with check (true);

-- Signed-in users use role `authenticated`; without these, Join Match fails after login.
drop policy if exists "Allow authenticated all matchmaking_queue" on public.matchmaking_queue;
create policy "Allow authenticated all matchmaking_queue"
  on public.matchmaking_queue for all to authenticated using (true) with check (true);

drop policy if exists "Allow authenticated all matches" on public.matches;
create policy "Allow authenticated all matches"
  on public.matches for all to authenticated using (true) with check (true);

-- When 2+ are in queue, pair the oldest 2 into a match and remove them from queue
create or replace function public.matchmaking_pair()
returns trigger as $$
declare
  ref1 text; ref2 text; id1 uuid; id2 uuid;
begin
  if (select count(*) from public.matchmaking_queue) >= 2 then
    with deleted as (
      delete from public.matchmaking_queue
      where id in (select id from public.matchmaking_queue order by created_at limit 2)
      returning id, user_ref, created_at
    ),
    ordered as (
      select user_ref, row_number() over (order by created_at) as rn from deleted
    )
    insert into public.matches (player1_ref, player2_ref)
    select (select user_ref from ordered where rn = 1), (select user_ref from ordered where rn = 2);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists matchmaking_after_insert on public.matchmaking_queue;
create trigger matchmaking_after_insert
  after insert on public.matchmaking_queue
  for each row execute function public.matchmaking_pair();

-- Realtime: Join Match + game sync require these tables in supabase_realtime (safe to re-run).
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'matches')
     and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'match_game_state')
     and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_game_state'
  ) then
    alter publication supabase_realtime add table public.match_game_state;
  end if;
end $$;
