-- Player feedback from the in-game form (email + message). Inserts only; no public reads.

create table if not exists public.player_feedback (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists player_feedback_created_at_idx on public.player_feedback (created_at desc);

comment on table public.player_feedback is 'Optional player feedback submitted from the web app.';

alter table public.player_feedback enable row level security;

drop policy if exists "Allow insert player_feedback" on public.player_feedback;
create policy "Allow insert player_feedback"
  on public.player_feedback for insert to anon, authenticated
  with check (char_length(trim(email)) > 0 and char_length(trim(body)) > 0);
