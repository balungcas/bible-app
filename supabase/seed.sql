-- RTCM Bible — seed data. Run after supabase/migrations/0001_init.sql.
-- Verse text is imported separately by `npm run import:bible`; the canonical
-- book registry is seeded here so the quizzes' foreign keys resolve without
-- depending on the import having run first.

-- ============================================================
-- Books (canonical registry — mirrors src/lib/books.js)
-- ============================================================
insert into books (code, testament, sort_order, name_en, name_tl, chapter_count) values
  ('GEN', 'OT', 1, 'Genesis', 'Genesis', 50),
  ('EXO', 'OT', 2, 'Exodus', 'Exodo', 40),
  ('LEV', 'OT', 3, 'Leviticus', 'Levitico', 27),
  ('NUM', 'OT', 4, 'Numbers', 'Mga Bilang', 36),
  ('DEU', 'OT', 5, 'Deuteronomy', 'Deuteronomio', 34),
  ('JOS', 'OT', 6, 'Joshua', 'Josue', 24),
  ('JDG', 'OT', 7, 'Judges', 'Mga Hukom', 21),
  ('RUT', 'OT', 8, 'Ruth', 'Ruth', 4),
  ('1SA', 'OT', 9, '1 Samuel', '1 Samuel', 31),
  ('2SA', 'OT', 10, '2 Samuel', '2 Samuel', 24),
  ('1KI', 'OT', 11, '1 Kings', '1 Mga Hari', 22),
  ('2KI', 'OT', 12, '2 Kings', '2 Mga Hari', 25),
  ('1CH', 'OT', 13, '1 Chronicles', '1 Mga Cronica', 29),
  ('2CH', 'OT', 14, '2 Chronicles', '2 Mga Cronica', 36),
  ('EZR', 'OT', 15, 'Ezra', 'Ezra', 10),
  ('NEH', 'OT', 16, 'Nehemiah', 'Nehemias', 13),
  ('EST', 'OT', 17, 'Esther', 'Ester', 10),
  ('JOB', 'OT', 18, 'Job', 'Job', 42),
  ('PSA', 'OT', 19, 'Psalms', 'Mga Awit', 150),
  ('PRO', 'OT', 20, 'Proverbs', 'Mga Kawikaan', 31),
  ('ECC', 'OT', 21, 'Ecclesiastes', 'Eclesiastes', 12),
  ('SNG', 'OT', 22, 'Song of Solomon', 'Ang Awit ni Solomon', 8),
  ('ISA', 'OT', 23, 'Isaiah', 'Isaias', 66),
  ('JER', 'OT', 24, 'Jeremiah', 'Jeremias', 52),
  ('LAM', 'OT', 25, 'Lamentations', 'Mga Panaghoy', 5),
  ('EZK', 'OT', 26, 'Ezekiel', 'Ezekiel', 48),
  ('DAN', 'OT', 27, 'Daniel', 'Daniel', 12),
  ('HOS', 'OT', 28, 'Hosea', 'Oseas', 14),
  ('JOL', 'OT', 29, 'Joel', 'Joel', 3),
  ('AMO', 'OT', 30, 'Amos', 'Amos', 9),
  ('OBA', 'OT', 31, 'Obadiah', 'Obadias', 1),
  ('JON', 'OT', 32, 'Jonah', 'Jonas', 4),
  ('MIC', 'OT', 33, 'Micah', 'Mikas', 7),
  ('NAM', 'OT', 34, 'Nahum', 'Nahum', 3),
  ('HAB', 'OT', 35, 'Habakkuk', 'Habacuc', 3),
  ('ZEP', 'OT', 36, 'Zephaniah', 'Sofonias', 3),
  ('HAG', 'OT', 37, 'Haggai', 'Hagai', 2),
  ('ZEC', 'OT', 38, 'Zechariah', 'Zacarias', 14),
  ('MAL', 'OT', 39, 'Malachi', 'Malakias', 4),
  ('MAT', 'NT', 40, 'Matthew', 'Mateo', 28),
  ('MRK', 'NT', 41, 'Mark', 'Marcos', 16),
  ('LUK', 'NT', 42, 'Luke', 'Lucas', 24),
  ('JHN', 'NT', 43, 'John', 'Juan', 21),
  ('ACT', 'NT', 44, 'Acts', 'Mga Gawa', 28),
  ('ROM', 'NT', 45, 'Romans', 'Mga Taga-Roma', 16),
  ('1CO', 'NT', 46, '1 Corinthians', '1 Mga Taga-Corinto', 16),
  ('2CO', 'NT', 47, '2 Corinthians', '2 Mga Taga-Corinto', 13),
  ('GAL', 'NT', 48, 'Galatians', 'Mga Taga-Galacia', 6),
  ('EPH', 'NT', 49, 'Ephesians', 'Mga Taga-Efeso', 6),
  ('PHP', 'NT', 50, 'Philippians', 'Mga Taga-Filipos', 4),
  ('COL', 'NT', 51, 'Colossians', 'Mga Taga-Colosas', 4),
  ('1TH', 'NT', 52, '1 Thessalonians', '1 Mga Taga-Tesalonica', 5),
  ('2TH', 'NT', 53, '2 Thessalonians', '2 Mga Taga-Tesalonica', 3),
  ('1TI', 'NT', 54, '1 Timothy', '1 Timoteo', 6),
  ('2TI', 'NT', 55, '2 Timothy', '2 Timoteo', 4),
  ('TIT', 'NT', 56, 'Titus', 'Tito', 3),
  ('PHM', 'NT', 57, 'Philemon', 'Filemon', 1),
  ('HEB', 'NT', 58, 'Hebrews', 'Mga Hebreo', 13),
  ('JAS', 'NT', 59, 'James', 'Santiago', 5),
  ('1PE', 'NT', 60, '1 Peter', '1 Pedro', 5),
  ('2PE', 'NT', 61, '2 Peter', '2 Pedro', 3),
  ('1JN', 'NT', 62, '1 John', '1 Juan', 5),
  ('2JN', 'NT', 63, '2 John', '2 Juan', 1),
  ('3JN', 'NT', 64, '3 John', '3 Juan', 1),
  ('JUD', 'NT', 65, 'Jude', 'Judas', 1),
  ('REV', 'NT', 66, 'Revelation', 'Pahayag', 22)
on conflict (code) do update set
  testament = excluded.testament,
  sort_order = excluded.sort_order,
  name_en = excluded.name_en,
  name_tl = excluded.name_tl,
  chapter_count = excluded.chapter_count;

-- ============================================================
-- Badges (starter set)
-- ============================================================
insert into badges (code, name, description, icon) values
  ('FIRST_SOAK', 'First SOAK',   'Completed your very first SOAK entry',              '🌱'),
  ('SOAK_30',    'Faithful 30',  'Completed 30 SOAK entries',                         '📖'),
  ('STREAK_7',   'One Week',     'Kept a 7-day SOAK streak',                          '🔥'),
  ('STREAK_30',  'One Month',    'Kept a 30-day SOAK streak',                         '⚡'),
  ('STREAK_100', 'Century',      'Kept a 100-day SOAK streak',                        '🏆'),
  ('BOOK_JOHN',  'Beloved Disciple', 'Read every chapter of the Gospel of John',      '✝️'),
  ('QUIZ_ACE',   'Quiz Ace',     'Answered 10 quiz questions correctly in a row',     '🎯'),
  ('EARLY_BIRD', 'Early Bird',   'Completed your SOAK before 7am, ten times',         '🌅')
on conflict (code) do update
  set name = excluded.name, description = excluded.description, icon = excluded.icon;

-- ============================================================
-- Churches (hardcoded for RTCM-Tunasan deployment)
-- ============================================================
insert into churches (id, name, region, approved) values
  ('a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c', 'RTCM-Tunasan', 'NCR', true)
on conflict (id) do update
  set name = excluded.name, region = excluded.region, approved = excluded.approved;

-- ============================================================
-- Devotions (sample content so Today has something to show)
-- ============================================================
insert into devotions (publish_date, title, scripture_ref, body, author) values
  (current_date, 'Rooted by the River', 'Psalm 1:1-3',
   E'The blessed life is not an accident — it grows from what we delight in and what we meditate on. The psalmist paints a tree planted by rivers of water: unhurried, nourished, fruitful in season.\n\nSOAK is exactly this: planting yourself by the river every day. Not a performance, not a checkbox — a root system. Today, as you read, ask: what am I delighting in? What occupies my quiet thoughts? Let the Word be the stream you drink from first, before the noise of the day begins.',
   'RTCM Devotions Team'),
  (current_date + 1, 'Lamp and Light', 'Psalm 119:105',
   E'"Thy word is a lamp unto my feet, and a light unto my path." A lamp shows the next step — not the whole journey. Scripture rarely hands us a ten-year map; it faithfully lights the ground under our feet today.\n\nAs you SOAK today, resist the urge to see everything at once. Ask instead: what is the one step this passage lights up for me right now? Obedience to the next step is how the whole path gets walked.',
   'RTCM Devotions Team'),
  (current_date + 2, 'Be Doers of the Word', 'James 1:22-25',
   E'James warns us about the mirror problem: hearing the Word and walking away unchanged is like glancing at your reflection and immediately forgetting your own face.\n\nThe A in SOAK — Application — is where the mirror becomes a window. Today, do not close your Bible until you have written one concrete, doable act of obedience. Small is fine. Forgotten is not.',
   'RTCM Devotions Team');

-- ============================================================
-- Quizzes (sample set tied to chapters)
-- ============================================================
insert into quizzes (book_code, chapter, question, choices, correct_index) values
  ('PSA', 1, 'In Psalm 1, the blessed man is compared to what?',
   '["A tree planted by rivers of water", "A strong tower", "An eagle", "A lamp on a stand"]', 0),
  ('PSA', 1, 'What does Psalm 1 say the blessed man delights in?',
   '["The law of the LORD", "The counsel of the ungodly", "The seat of the scornful", "Riches and honor"]', 0),
  ('PSA', 119, 'According to Psalm 119:105, God''s word is a lamp unto my ___ and a light unto my ___.',
   '["feet / path", "eyes / heart", "hands / work", "house / city"]', 0),
  ('JAS', 1, 'James 1:22 tells believers to be ___ of the word, and not hearers only.',
   '["doers", "teachers", "judges", "readers"]', 0),
  ('JAS', 1, 'James compares a hearer-only of the word to a man who…',
   '["forgets his face after seeing it in a mirror", "builds on sand", "hides his lamp", "loses his salt"]', 0),
  ('JHN', 3, 'In John 3:16, God so loved the world that He gave His only begotten Son, that whosoever believeth in Him should not perish, but have…',
   '["everlasting life", "great riches", "perfect peace", "many blessings"]', 0),
  ('JHN', 1, 'John 1:1 — "In the beginning was the ___."',
   '["Word", "Light", "Law", "Spirit"]', 0),
  ('GEN', 1, 'On which day did God create the lights in the firmament (sun, moon, stars)?',
   '["Fourth day", "First day", "Third day", "Sixth day"]', 0),
  ('MAT', 5, 'In the Beatitudes, who does Jesus say will inherit the earth?',
   '["The meek", "The proud", "The rich", "The strong"]', 0),
  ('ACT', 2, 'In Acts 2:38, Peter said: "Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive…"',
   '["the gift of the Holy Ghost", "eternal rest", "a new name", "the keys of the kingdom"]', 0);
