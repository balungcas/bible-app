-- RTCM Bible — seed data.
-- Books + verses are imported by `npm run import:bible` (not here).

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
-- Churches (sample seed — replace with the official UPC PH directory)
-- ============================================================
insert into churches (name, region, approved) values
  ('UPC Makati',       'NCR',          true),
  ('UPC Quezon City',  'NCR',          true),
  ('UPC Caloocan',     'NCR',          true),
  ('UPC Antipolo',     'Region IV-A',  true),
  ('UPC Batangas',     'Region IV-A',  true),
  ('UPC Cebu',         'Region VII',   true),
  ('UPC Davao',        'Region XI',    true),
  ('UPC Baguio',       'CAR',          true),
  ('UPC Iloilo',       'Region VI',    true),
  ('UPC Cagayan de Oro', 'Region X',   true);

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
