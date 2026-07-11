// Sample content used by the local demo backend (and mirrored in
// supabase/seed.sql). In production, devotions come from the `devotions`
// table — decide who authors them (admin CMS is a Phase 4 item).

export const DEVOTIONS = [
  {
    title: 'Rooted by the River',
    scripture_ref: 'Psalm 1:1-3',
    ref: { book: 'PSA', chapter: 1, from: 1, to: 3 },
    author: 'RTCM Devotions Team',
    body: `The blessed life is not an accident — it grows from what we delight in and what we meditate on. The psalmist paints a tree planted by rivers of water: unhurried, nourished, fruitful in season.

SOAK is exactly this: planting yourself by the river every day. Not a performance, not a checkbox — a root system. Today, as you read, ask: what am I delighting in? What occupies my quiet thoughts? Let the Word be the stream you drink from first, before the noise of the day begins.`,
  },
  {
    title: 'Lamp and Light',
    scripture_ref: 'Psalm 119:105',
    ref: { book: 'PSA', chapter: 119, from: 105, to: 105 },
    author: 'RTCM Devotions Team',
    body: `"Thy word is a lamp unto my feet, and a light unto my path." A lamp shows the next step — not the whole journey. Scripture rarely hands us a ten-year map; it faithfully lights the ground under our feet today.

As you SOAK today, resist the urge to see everything at once. Ask instead: what is the one step this passage lights up for me right now? Obedience to the next step is how the whole path gets walked.`,
  },
  {
    title: 'Be Doers of the Word',
    scripture_ref: 'James 1:22-25',
    ref: { book: 'JAS', chapter: 1, from: 22, to: 25 },
    author: 'RTCM Devotions Team',
    body: `James warns us about the mirror problem: hearing the Word and walking away unchanged is like glancing at your reflection and immediately forgetting your own face.

The A in SOAK — Application — is where the mirror becomes a window. Today, do not close your Bible until you have written one concrete, doable act of obedience. Small is fine. Forgotten is not.`,
  },
  {
    title: 'Living Water',
    scripture_ref: 'John 4:13-14',
    ref: { book: 'JHN', chapter: 4, from: 13, to: 14 },
    author: 'RTCM Devotions Team',
    body: `At a well in Samaria, Jesus offered something no bucket could draw: water that becomes a spring inside the one who drinks it. Everything else we drink from — approval, success, comfort — leaves us thirsty again by evening.

Today's SOAK is a drink from the well that does not run dry. Come thirsty. Leave the bucket. Ask the Lord to make His Word a spring in you that others can drink from too.`,
  },
  {
    title: 'The Word Endures',
    scripture_ref: 'Isaiah 40:8',
    ref: { book: 'ISA', chapter: 40, from: 6, to: 8 },
    author: 'RTCM Devotions Team',
    body: `Grass withers. Flowers fade. Headlines, trends, and even our strongest feelings have a shelf life. Isaiah sets one thing against all of it: "the word of our God shall stand for ever."

When you journal today, remember you are handling the one thing in your day that will outlast everything else in it. Write slowly. What God says here will still be true when everything urgent about today is forgotten.`,
  },
  {
    title: 'Hidden in the Heart',
    scripture_ref: 'Psalm 119:9-11',
    ref: { book: 'PSA', chapter: 119, from: 9, to: 11 },
    author: 'RTCM Devotions Team',
    body: `"Thy word have I hid in mine heart, that I might not sin against thee." Hiding the Word is not the same as reading it. Hidden things are placed deliberately, kept deliberately, and retrieved when needed.

As you observe today's passage, choose one line to carry with you — into the commute, the kitchen, the conversation you are dreading. The heart keeps what it treasures.`,
  },
  {
    title: 'Strength and Courage',
    scripture_ref: 'Joshua 1:8-9',
    ref: { book: 'JOS', chapter: 1, from: 8, to: 9 },
    author: 'RTCM Devotions Team',
    body: `Before Joshua faced a single battle, God gave him a habit: "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night." Courage, it turns out, is downstream of meditation.

Whatever you are facing this week, the instruction is the same. Do not be afraid — but first, do not be empty. Fill your mouth and mind with the Word, and courage will have something to stand on.`,
  },
];

// Deterministic pick for a local calendar date so everyone sees the same
// devotion on the same day.
export function devotionForDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayIndex = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const dev = DEVOTIONS[dayIndex % DEVOTIONS.length];
  return { id: `local-${dateStr}`, publish_date: dateStr, ...dev };
}

export const QUIZZES = [
  {
    id: 'q1', book_code: 'PSA', chapter: 1,
    question: 'In Psalm 1, the blessed man is compared to what?',
    choices: ['A tree planted by rivers of water', 'A strong tower', 'An eagle', 'A lamp on a stand'],
    correct_index: 0,
  },
  {
    id: 'q2', book_code: 'PSA', chapter: 1,
    question: 'What does Psalm 1 say the blessed man delights in?',
    choices: ['The law of the LORD', 'The counsel of the ungodly', 'The seat of the scornful', 'Riches and honor'],
    correct_index: 0,
  },
  {
    id: 'q3', book_code: 'PSA', chapter: 119,
    question: "According to Psalm 119:105, God's word is a lamp unto my ___ and a light unto my ___.",
    choices: ['feet / path', 'eyes / heart', 'hands / work', 'house / city'],
    correct_index: 0,
  },
  {
    id: 'q4', book_code: 'JAS', chapter: 1,
    question: 'James 1:22 tells believers to be ___ of the word, and not hearers only.',
    choices: ['doers', 'teachers', 'judges', 'readers'],
    correct_index: 0,
  },
  {
    id: 'q5', book_code: 'JAS', chapter: 1,
    question: 'James compares a hearer-only of the word to a man who…',
    choices: ['forgets his face after seeing it in a mirror', 'builds on sand', 'hides his lamp', 'loses his salt'],
    correct_index: 0,
  },
  {
    id: 'q6', book_code: 'JHN', chapter: 3,
    question: 'In John 3:16, whosoever believeth in Him should not perish, but have…',
    choices: ['everlasting life', 'great riches', 'perfect peace', 'many blessings'],
    correct_index: 0,
  },
  {
    id: 'q7', book_code: 'JHN', chapter: 1,
    question: 'John 1:1 — "In the beginning was the ___."',
    choices: ['Word', 'Light', 'Law', 'Spirit'],
    correct_index: 0,
  },
  {
    id: 'q8', book_code: 'GEN', chapter: 1,
    question: 'On which day did God create the lights in the firmament (sun, moon, stars)?',
    choices: ['Fourth day', 'First day', 'Third day', 'Sixth day'],
    correct_index: 0,
  },
  {
    id: 'q9', book_code: 'MAT', chapter: 5,
    question: 'In the Beatitudes, who does Jesus say will inherit the earth?',
    choices: ['The meek', 'The proud', 'The rich', 'The strong'],
    correct_index: 0,
  },
  {
    id: 'q10', book_code: 'ACT', chapter: 2,
    question: 'In Acts 2:38, Peter said: "Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive…"',
    choices: ['the gift of the Holy Ghost', 'eternal rest', 'a new name', 'the keys of the kingdom'],
    correct_index: 0,
  },
];

// Three quiz questions per day, rotated deterministically by date.
export function quizzesForDate(dateStr, count = 3) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayIndex = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(QUIZZES[(dayIndex * count + i) % QUIZZES.length]);
  }
  return out;
}

export const SAMPLE_CHURCHES = [
  { id: 'ch-01', name: 'UPC Makati', region: 'NCR', approved: true },
  { id: 'ch-02', name: 'UPC Quezon City', region: 'NCR', approved: true },
  { id: 'ch-03', name: 'UPC Caloocan', region: 'NCR', approved: true },
  { id: 'ch-04', name: 'UPC Antipolo', region: 'Region IV-A', approved: true },
  { id: 'ch-05', name: 'UPC Batangas', region: 'Region IV-A', approved: true },
  { id: 'ch-06', name: 'UPC Cebu', region: 'Region VII', approved: true },
  { id: 'ch-07', name: 'UPC Davao', region: 'Region XI', approved: true },
  { id: 'ch-08', name: 'UPC Baguio', region: 'CAR', approved: true },
  { id: 'ch-09', name: 'UPC Iloilo', region: 'Region VI', approved: true },
  { id: 'ch-10', name: 'UPC Cagayan de Oro', region: 'Region X', approved: true },
];
