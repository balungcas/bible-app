# RTCM Bible

A gamified Bible reading, devotional, and journaling web app built around the daily **SOAK** practice (**S**cripture · **O**bservation · **A**pplication · **K**neel) for the UPC PH community.

One brand, one habit, one streak:

```
RTCM Bible
├── Read      (Bible — KJV ⇄ Tagalog, parallel view, reading progress + XP)
├── Today     (Daily devotion + today's SOAK entry + daily quiz)
├── Journal   (past SOAK entries + badges)
└── Community (church-scoped leaderboard)
```

## Tech stack

- **Frontend:** React + Tailwind (Vite)
- **Backend / DB / Auth:** Supabase (Postgres + Auth + Row Level Security)
- **Bible data:** Pre-downloaded JSON (KJV + Ang Biblia 1905 Tagalog — both public domain), normalized at build time and served as static JSON. No external Bible API is called at read time.

The app also runs in a **local demo mode** (localStorage, single browser) when no Supabase credentials are configured — useful for trying it out and for development.

## Getting started

```bash
npm install
npm run dev        # generates public/bible/ from bibles/*.json, then starts Vite
```

Without a `.env`, the app runs in demo mode. Data (account, journal, XP) stays in the browser.

## Production setup (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (schema + RLS + leaderboard).
3. Run `supabase/seed.sql` (book registry, badges, sample churches, sample devotions/quizzes).
4. Import the Bible text (one-time job, batched at 1,000 rows):
   ```bash
   SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
   npm run import:bible
   ```
5. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
6. `npm run build` and deploy `dist/` to any static host.

## How the gamification works

| Action | XP | Cap |
|---|---|---|
| Complete daily SOAK | 50 | 1/day |
| Read a chapter (first time ever) | 10 | 5 chapters/day |
| Read the daily devotion | 15 | 1/day |
| Correct quiz answer | 5 | 3/day |

- **Streaks** advance only when the daily SOAK is completed — reading and quizzes earn XP but don't protect the streak. Missing a day consumes a streak freeze if available (max 2, +1 regenerates every 14 consecutive days); otherwise the streak resets. All date math runs in the user's local timezone (`entry_date` is a calendar date, never a timestamp).
- **Levels:** Seeker (0) → Learner (500) → Disciple (1,500) → Steward (3,500) → Servant (7,000) → Elder (12,000).
- **Badges:** FIRST_SOAK, SOAK_30, STREAK_7/30/100, BOOK_JOHN, QUIZ_ACE, EARLY_BIRD.
- **Leaderboard** is scoped to the user's own church (never global) with two tabs: Consistency (current streak) and Points (XP this month — resets monthly). It exposes only name/level/streak/XP.
- **Soft gate, not hard lock:** the app never blocks until SOAK is done — a persistent card on Today and the streak itself do the work.

## Privacy (non-negotiable)

Journal entries are private, personal, and spiritual. `soak_entries` is protected by RLS (`auth.uid() = user_id` for every operation) and **no policy anywhere exposes it to another user** — including church leaders and admins. The leaderboard never surfaces journal content.

## Bible data & licensing

| Version | Status |
|---|---|
| KJV | Public domain |
| Ang Biblia (1905 Tagalog) | Public domain |
| NET Bible | Phase 2 — copyrighted with a free-use license; review Biblical Studies Press terms before adding |
| Modern Tagalog (e.g. MBB) | Requires licensing from the Philippine Bible Society — do not include without permission |

No Bible text is ever machine-translated.

## Project layout

```
bibles/                    # source JSON (KJV, TagAngBiblia) — checked in
scripts/
  normalize.mjs            # one normalizer per source → common row shape, + validation
  build-bible-data.mjs     # emits public/bible/{VERSION}/{BOOK}.json for the app
  import-bible.mjs         # one-time bulk import into Supabase `verses`
supabase/
  migrations/0001_init.sql # full schema + RLS + leaderboard view/RPC
  seed.sql                 # badges, churches, sample devotions & quizzes
src/
  lib/books.js             # canonical book registry (code / name_en / name_tl)
  lib/gamification.js      # XP rules, levels, streak math, badges (pure)
  lib/game.js              # orchestration: caps, awards, badge checks
  lib/backend/             # supabase.js + local.js behind one interface
  pages/                   # Read / Today / Journal / Community / Auth
```

## Open decisions (from the build spec)

- **K** is currently labeled **Kneel (prayer)** — confirm with the church and adjust the UI label if needed.
- Devotion authorship: seed content ships in `supabase/seed.sql`; an admin CMS is a Phase 4 item.
- Church list: seeded with samples — replace with the official UPC PH directory. User-submitted churches land unapproved for admin review.
- Monthly points-board reset: implemented (the Points tab ranks by current-month XP).
