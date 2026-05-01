# Echoes of Evolution

A card game based on **real-world occupations** (Doctor, Lawyer, Engineer, etc.). Play uses **two 20-sided dice (d20)**: one for **Health** and one for **Evolution points**. Both Health and Evolution points start at **20** at the beginning of the game.

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
- **Supabase** – Player **profiles** (display name, favorite occupation, favorite color) and **card set** tracking (all cards we create live in the DB).

## Tech

- React 18 + Vite
- Supabase (Postgres) for profiles and card set

### Supabase setup

1. In the Supabase dashboard, open your project → **Project Settings → API**. Copy the **Project URL** and **anon** (or publishable) key.
2. In this repo, create `.env.local` (see `.env.local.example`) and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In the dashboard, open **SQL Editor → New query**. Paste and run the contents of **`supabase/schema.sql`**. That creates the `profiles` and `cards` tables, RLS policies, and seeds the 15 base occupation cards.

After that, the app will load and save profiles and show the card set from the database.
