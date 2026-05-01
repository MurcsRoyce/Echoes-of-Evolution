-- Run this in Supabase Dashboard → SQL Editor → New query
-- Creates matchmaking_queue, matches, and the pairing trigger

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
comment on table public.matches is 'Active matches; one row per game (2 players).';

alter table public.matchmaking_queue enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Allow anon all matchmaking_queue" on public.matchmaking_queue;
create policy "Allow anon all matchmaking_queue"
  on public.matchmaking_queue for all to anon using (true) with check (true);

drop policy if exists "Allow anon all matches" on public.matches;
create policy "Allow anon all matches"
  on public.matches for all to anon using (true) with check (true);

create or replace function public.matchmaking_pair()
returns trigger as $$
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
