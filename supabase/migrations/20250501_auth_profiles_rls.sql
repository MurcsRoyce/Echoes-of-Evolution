-- Profiles tied to Supabase Auth: authenticated users may insert/update only their own row (id = auth.uid()).
-- Run after enabling Auth in your Supabase project. Existing anon policies remain for backwards compatibility.

create policy "Authenticated users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Authenticated users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
