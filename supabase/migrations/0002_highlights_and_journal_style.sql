-- RTCM Bible — migration 0002: verse highlights + SOAK journal styling.
-- Apply with the Supabase SQL editor or `supabase db push` (after 0001_init.sql).

-- ============================================================
-- Verse highlights (private per-user, like reading_progress)
-- ============================================================
-- Keyed by book/chapter/verse (NOT version) so a highlight shows in KJV,
-- Tagalog, and parallel views alike. Re-highlighting a verse upserts the
-- color; removing a highlight deletes the row.
create table if not exists verse_highlights (
  user_id    uuid not null references auth.users(id) on delete cascade,
  book_code  text not null references books(code),
  chapter    int  not null,
  verse      int  not null,
  color      text not null,           -- 'yellow' | 'green' | 'blue' | 'pink' | 'orange'
  created_at timestamptz default now(),
  primary key (user_id, book_code, chapter, verse)
);

alter table verse_highlights enable row level security;

-- Highlights are private to the owner — same guarantee as soak_entries.
create policy "own highlights"
on verse_highlights for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- SOAK journal styling (paper background + emoji stickers)
-- ============================================================
-- A single JSONB blob keeps the schema stable while the decoration model
-- evolves. Shape:
--   { "paper": "plain" | "lined" | "parchment" | "dotted",
--     "stickers": [ { "e": "🙏", "x": 0.5, "y": 0.3 }, ... ] }
-- x/y are 0..1 fractional coordinates so stickers land correctly at any width.
-- Existing rows default to '{}', which the clients read as plain / no stickers.
alter table soak_entries
  add column if not exists style jsonb default '{}'::jsonb;
