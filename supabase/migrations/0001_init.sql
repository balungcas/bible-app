-- RTCM Bible — initial schema
-- Apply with the Supabase SQL editor or `supabase db push`.

-- ============================================================
-- 4.1 Bible
-- ============================================================

-- Canonical book registry — the join key across all translations.
create table books (
  code          text primary key,        -- 'GEN', 'JHN', 'REV' (stable across languages)
  testament     text not null check (testament in ('OT', 'NT')),
  sort_order    int  not null,
  name_en       text not null,           -- 'John'
  name_tl       text not null,           -- 'Juan'
  chapter_count int  not null
);

create table verses (
  id        bigserial primary key,
  version   text not null,               -- 'KJV' | 'TAGALOG' | (later) 'NET'
  book_code text not null references books(code),
  chapter   int  not null,
  verse     int  not null,
  text      text not null,
  unique (version, book_code, chapter, verse)
);

create index on verses (version, book_code, chapter);

-- Bible text is public-domain content, readable by everyone.
alter table books enable row level security;
alter table verses enable row level security;
create policy "books are public" on books for select using (true);
create policy "verses are public" on verses for select using (true);

-- ============================================================
-- 4.2 Users & Churches
-- ============================================================

create table churches (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  region   text,                         -- e.g. 'NCR', 'Region IV-A'
  approved boolean default false         -- gate user-submitted churches
);

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  church_id  uuid references churches(id),
  created_at timestamptz default now()
);

alter table churches enable row level security;
create policy "approved churches are public"
on churches for select using (approved = true);
-- "My church isn't listed" → any signed-in user may submit an unapproved row.
create policy "submit church for review"
on churches for insert to authenticated
with check (approved = false);

-- security definer helper avoids infinite recursion inside the profiles
-- select policy (a policy on profiles cannot itself select from profiles).
create function current_user_church_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select church_id from profiles where id = auth.uid()
$$;

alter table profiles enable row level security;

-- You can read your own profile, and the profiles of people in your church
-- (for the leaderboard) — the leaderboard exposes no journal data.
create policy "read same church"
on profiles for select
using (
  auth.uid() = id
  or (church_id is not null and church_id = current_user_church_id())
);

create policy "insert own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================================
-- 4.3 The SOAK Journal (core)
-- ============================================================

create table soak_entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  entry_date     date not null,          -- local calendar date, NOT a timestamp
  scripture_ref  text not null,          -- 'John 3:16-18'
  scripture_text text,                   -- snapshot of the passage at time of writing
  observation    text,
  application    text,
  kneel          text,                   -- the 'K' — Kneel (prayer)
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, entry_date)           -- one SOAK per user per day
);

-- Journal entries are private, personal, and spiritual. No policy anywhere may
-- expose soak_entries to another user, including church leaders or admins.
alter table soak_entries enable row level security;

create policy "own entries only"
on soak_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- 4.4 Gamification
-- ============================================================

create table xp_log (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  action_type text not null,             -- 'soak_completed' | 'chapter_read' | 'quiz_correct' | 'devotion_read'
  points      int  not null,
  ref_id      text,                      -- optional: chapter ref, quiz id, etc.
  created_at  timestamptz default now()
);

create index on xp_log (user_id, created_at);

create table streaks (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  current_streak      int  default 0,
  longest_streak      int  default 0,
  last_completed_date date,
  freezes_available   int  default 2     -- grace tokens
);

create table badges (
  code        text primary key,          -- 'STREAK_7'
  name        text not null,
  description text not null,
  icon        text
);

create table user_badges (
  user_id    uuid references auth.users(id) on delete cascade,
  badge_code text references badges(code),
  earned_at  timestamptz default now(),
  primary key (user_id, badge_code)
);

alter table xp_log enable row level security;
create policy "own xp" on xp_log for select using (auth.uid() = user_id);
create policy "log own xp" on xp_log for insert with check (auth.uid() = user_id);

alter table streaks enable row level security;
-- Streaks are readable by same-church members so the Consistency leaderboard works.
create policy "own or same-church streaks"
on streaks for select
using (
  auth.uid() = user_id
  or user_id in (select id from profiles where church_id = current_user_church_id())
);
create policy "insert own streak" on streaks for insert with check (auth.uid() = user_id);
create policy "update own streak" on streaks for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table badges enable row level security;
create policy "badges are public" on badges for select using (true);

alter table user_badges enable row level security;
create policy "own badges" on user_badges for select using (auth.uid() = user_id);
create policy "earn own badges" on user_badges for insert with check (auth.uid() = user_id);

-- ============================================================
-- 4.5 Devotions & Quizzes
-- ============================================================

create table devotions (
  id            uuid primary key default gen_random_uuid(),
  publish_date  date unique not null,
  title         text not null,
  scripture_ref text not null,
  body          text not null,
  author        text
);

create table quizzes (
  id            uuid primary key default gen_random_uuid(),
  book_code     text references books(code),
  chapter       int,
  devotion_id   uuid references devotions(id),
  question      text not null,
  choices       jsonb not null,          -- ["...", "...", "...", "..."]
  correct_index int  not null
);

create table quiz_attempts (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  quiz_id      uuid not null references quizzes(id),
  chosen_index int not null,
  is_correct   boolean not null,
  created_at   timestamptz default now()
);

alter table devotions enable row level security;
create policy "devotions are public" on devotions for select using (true);

alter table quizzes enable row level security;
create policy "quizzes are public" on quizzes for select using (true);

alter table quiz_attempts enable row level security;
create policy "own attempts" on quiz_attempts for select using (auth.uid() = user_id);
create policy "record own attempts" on quiz_attempts for insert with check (auth.uid() = user_id);

-- ============================================================
-- 4.6 Reading Progress
-- ============================================================

create table reading_progress (
  user_id   uuid references auth.users(id) on delete cascade,
  version   text not null,
  book_code text references books(code),
  chapter   int not null,
  read_at   timestamptz default now(),
  primary key (user_id, book_code, chapter)  -- XP awarded once per chapter, ever
);

alter table reading_progress enable row level security;
create policy "own progress" on reading_progress for select using (auth.uid() = user_id);
create policy "record own progress" on reading_progress for insert with check (auth.uid() = user_id);

-- ============================================================
-- 6. Church Leaderboard
-- ============================================================

-- security_invoker: the view runs under the querying user's RLS, so it can
-- only ever surface profiles/streaks the caller is already allowed to read
-- (their own church). It exposes only name / streak / xp — never journal data.
create view church_leaderboard
with (security_invoker = true) as
select
  p.id,
  p.name,
  p.church_id,
  coalesce(s.current_streak, 0) as current_streak,
  coalesce(sum(x.points), 0)    as total_xp,
  coalesce(sum(x.points) filter (
    where x.created_at >= date_trunc('month', now())
  ), 0)                         as month_xp
from profiles p
left join streaks s on s.user_id = p.id
left join xp_log  x on x.user_id = p.id
group by p.id, p.name, p.church_id, s.current_streak;

-- xp_log is only self-readable, so month_xp/total_xp would be null for other
-- users under security_invoker. Expose an aggregate-only RPC instead: it is
-- security definer but returns nothing beyond name/level inputs (xp, streak).
create function church_leaderboard_for(target_church uuid)
returns table (id uuid, name text, current_streak int, total_xp bigint, month_xp bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.name,
    coalesce(s.current_streak, 0),
    coalesce(sum(x.points), 0)::bigint,
    coalesce(sum(x.points) filter (
      where x.created_at >= date_trunc('month', now())
    ), 0)::bigint
  from profiles p
  left join streaks s on s.user_id = p.id
  left join xp_log  x on x.user_id = p.id
  where p.church_id = target_church
    and target_church = (select church_id from profiles where id = auth.uid())
  group by p.id, p.name, s.current_streak
$$;
