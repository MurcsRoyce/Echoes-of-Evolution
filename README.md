# Echoes of Evolution

Strategic **tabletop card game** (digital playtest in this repo): **real-world occupations** (Doctor, Lawyer, Engineer, and more). Play uses **two 20-sided dice (d20)** for **Health** and **Evolution points**, both starting at **20**.

## Run the app

```bash
cd echoes-of-evolution
npm run dev
```

Open the URL in your browser (e.g. http://localhost:5173).

## Current features

- **Health** and **Evolution points** – Both start at 20; two d20s for rolling.
- **15 occupation cards** (tiered: Society Foundations, Power & Order, Economy & Influence, Culture & Mind, Wildcard). Draw, select, play to the field.
- **9 evolutionary colors** – Red, Blue, Yellow, Green, Orange, Purple, Amber, Teal, Magenta.
- **Supabase** – Player **profiles** (display name, favorite occupation, favorite color), **card set** tracking, **matchmaking**, and **multiplayer** game state.

## Tech

- React 18 + Vite
- Supabase (Postgres, Auth, Realtime) for profiles, cards, matches, and sync

### Supabase setup

1. In the Supabase dashboard, open your project → **Project Settings → API**. Copy the **Project URL** and **anon** (or publishable) key.
2. In this repo, create `.env.local` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In the dashboard, open **SQL Editor → New query**. Run **`supabase/schema.sql`**, then the SQL files under **`supabase/migrations/`** as needed (game state, chat, auth RLS, etc.).

After that, the app can load profiles, the card set from the database, and online matches.
