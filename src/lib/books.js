// Canonical book registry — the join key across all translations.
// `source` is the exact book name used in the downloaded JSON files (bibles/*.json).
// Codes follow USFM/Paratext conventions and are stable across languages.

export const BOOKS = [
  { code: 'GEN', source: 'Genesis', en: 'Genesis', tl: 'Genesis', testament: 'OT', chapters: 50 },
  { code: 'EXO', source: 'Exodus', en: 'Exodus', tl: 'Exodo', testament: 'OT', chapters: 40 },
  { code: 'LEV', source: 'Leviticus', en: 'Leviticus', tl: 'Levitico', testament: 'OT', chapters: 27 },
  { code: 'NUM', source: 'Numbers', en: 'Numbers', tl: 'Mga Bilang', testament: 'OT', chapters: 36 },
  { code: 'DEU', source: 'Deuteronomy', en: 'Deuteronomy', tl: 'Deuteronomio', testament: 'OT', chapters: 34 },
  { code: 'JOS', source: 'Joshua', en: 'Joshua', tl: 'Josue', testament: 'OT', chapters: 24 },
  { code: 'JDG', source: 'Judges', en: 'Judges', tl: 'Mga Hukom', testament: 'OT', chapters: 21 },
  { code: 'RUT', source: 'Ruth', en: 'Ruth', tl: 'Ruth', testament: 'OT', chapters: 4 },
  { code: '1SA', source: 'I Samuel', en: '1 Samuel', tl: '1 Samuel', testament: 'OT', chapters: 31 },
  { code: '2SA', source: 'II Samuel', en: '2 Samuel', tl: '2 Samuel', testament: 'OT', chapters: 24 },
  { code: '1KI', source: 'I Kings', en: '1 Kings', tl: '1 Mga Hari', testament: 'OT', chapters: 22 },
  { code: '2KI', source: 'II Kings', en: '2 Kings', tl: '2 Mga Hari', testament: 'OT', chapters: 25 },
  { code: '1CH', source: 'I Chronicles', en: '1 Chronicles', tl: '1 Mga Cronica', testament: 'OT', chapters: 29 },
  { code: '2CH', source: 'II Chronicles', en: '2 Chronicles', tl: '2 Mga Cronica', testament: 'OT', chapters: 36 },
  { code: 'EZR', source: 'Ezra', en: 'Ezra', tl: 'Ezra', testament: 'OT', chapters: 10 },
  { code: 'NEH', source: 'Nehemiah', en: 'Nehemiah', tl: 'Nehemias', testament: 'OT', chapters: 13 },
  { code: 'EST', source: 'Esther', en: 'Esther', tl: 'Ester', testament: 'OT', chapters: 10 },
  { code: 'JOB', source: 'Job', en: 'Job', tl: 'Job', testament: 'OT', chapters: 42 },
  { code: 'PSA', source: 'Psalms', en: 'Psalms', tl: 'Mga Awit', testament: 'OT', chapters: 150 },
  { code: 'PRO', source: 'Proverbs', en: 'Proverbs', tl: 'Mga Kawikaan', testament: 'OT', chapters: 31 },
  { code: 'ECC', source: 'Ecclesiastes', en: 'Ecclesiastes', tl: 'Eclesiastes', testament: 'OT', chapters: 12 },
  { code: 'SNG', source: 'Song of Solomon', en: 'Song of Solomon', tl: 'Ang Awit ni Solomon', testament: 'OT', chapters: 8 },
  { code: 'ISA', source: 'Isaiah', en: 'Isaiah', tl: 'Isaias', testament: 'OT', chapters: 66 },
  { code: 'JER', source: 'Jeremiah', en: 'Jeremiah', tl: 'Jeremias', testament: 'OT', chapters: 52 },
  { code: 'LAM', source: 'Lamentations', en: 'Lamentations', tl: 'Mga Panaghoy', testament: 'OT', chapters: 5 },
  { code: 'EZK', source: 'Ezekiel', en: 'Ezekiel', tl: 'Ezekiel', testament: 'OT', chapters: 48 },
  { code: 'DAN', source: 'Daniel', en: 'Daniel', tl: 'Daniel', testament: 'OT', chapters: 12 },
  { code: 'HOS', source: 'Hosea', en: 'Hosea', tl: 'Oseas', testament: 'OT', chapters: 14 },
  { code: 'JOL', source: 'Joel', en: 'Joel', tl: 'Joel', testament: 'OT', chapters: 3 },
  { code: 'AMO', source: 'Amos', en: 'Amos', tl: 'Amos', testament: 'OT', chapters: 9 },
  { code: 'OBA', source: 'Obadiah', en: 'Obadiah', tl: 'Obadias', testament: 'OT', chapters: 1 },
  { code: 'JON', source: 'Jonah', en: 'Jonah', tl: 'Jonas', testament: 'OT', chapters: 4 },
  { code: 'MIC', source: 'Micah', en: 'Micah', tl: 'Mikas', testament: 'OT', chapters: 7 },
  { code: 'NAM', source: 'Nahum', en: 'Nahum', tl: 'Nahum', testament: 'OT', chapters: 3 },
  { code: 'HAB', source: 'Habakkuk', en: 'Habakkuk', tl: 'Habacuc', testament: 'OT', chapters: 3 },
  { code: 'ZEP', source: 'Zephaniah', en: 'Zephaniah', tl: 'Sofonias', testament: 'OT', chapters: 3 },
  { code: 'HAG', source: 'Haggai', en: 'Haggai', tl: 'Hagai', testament: 'OT', chapters: 2 },
  { code: 'ZEC', source: 'Zechariah', en: 'Zechariah', tl: 'Zacarias', testament: 'OT', chapters: 14 },
  { code: 'MAL', source: 'Malachi', en: 'Malachi', tl: 'Malakias', testament: 'OT', chapters: 4 },
  { code: 'MAT', source: 'Matthew', en: 'Matthew', tl: 'Mateo', testament: 'NT', chapters: 28 },
  { code: 'MRK', source: 'Mark', en: 'Mark', tl: 'Marcos', testament: 'NT', chapters: 16 },
  { code: 'LUK', source: 'Luke', en: 'Luke', tl: 'Lucas', testament: 'NT', chapters: 24 },
  { code: 'JHN', source: 'John', en: 'John', tl: 'Juan', testament: 'NT', chapters: 21 },
  { code: 'ACT', source: 'Acts', en: 'Acts', tl: 'Mga Gawa', testament: 'NT', chapters: 28 },
  { code: 'ROM', source: 'Romans', en: 'Romans', tl: 'Mga Taga-Roma', testament: 'NT', chapters: 16 },
  { code: '1CO', source: 'I Corinthians', en: '1 Corinthians', tl: '1 Mga Taga-Corinto', testament: 'NT', chapters: 16 },
  { code: '2CO', source: 'II Corinthians', en: '2 Corinthians', tl: '2 Mga Taga-Corinto', testament: 'NT', chapters: 13 },
  { code: 'GAL', source: 'Galatians', en: 'Galatians', tl: 'Mga Taga-Galacia', testament: 'NT', chapters: 6 },
  { code: 'EPH', source: 'Ephesians', en: 'Ephesians', tl: 'Mga Taga-Efeso', testament: 'NT', chapters: 6 },
  { code: 'PHP', source: 'Philippians', en: 'Philippians', tl: 'Mga Taga-Filipos', testament: 'NT', chapters: 4 },
  { code: 'COL', source: 'Colossians', en: 'Colossians', tl: 'Mga Taga-Colosas', testament: 'NT', chapters: 4 },
  { code: '1TH', source: 'I Thessalonians', en: '1 Thessalonians', tl: '1 Mga Taga-Tesalonica', testament: 'NT', chapters: 5 },
  { code: '2TH', source: 'II Thessalonians', en: '2 Thessalonians', tl: '2 Mga Taga-Tesalonica', testament: 'NT', chapters: 3 },
  { code: '1TI', source: 'I Timothy', en: '1 Timothy', tl: '1 Timoteo', testament: 'NT', chapters: 6 },
  { code: '2TI', source: 'II Timothy', en: '2 Timothy', tl: '2 Timoteo', testament: 'NT', chapters: 4 },
  { code: 'TIT', source: 'Titus', en: 'Titus', tl: 'Tito', testament: 'NT', chapters: 3 },
  { code: 'PHM', source: 'Philemon', en: 'Philemon', tl: 'Filemon', testament: 'NT', chapters: 1 },
  { code: 'HEB', source: 'Hebrews', en: 'Hebrews', tl: 'Mga Hebreo', testament: 'NT', chapters: 13 },
  { code: 'JAS', source: 'James', en: 'James', tl: 'Santiago', testament: 'NT', chapters: 5 },
  { code: '1PE', source: 'I Peter', en: '1 Peter', tl: '1 Pedro', testament: 'NT', chapters: 5 },
  { code: '2PE', source: 'II Peter', en: '2 Peter', tl: '2 Pedro', testament: 'NT', chapters: 3 },
  { code: '1JN', source: 'I John', en: '1 John', tl: '1 Juan', testament: 'NT', chapters: 5 },
  { code: '2JN', source: 'II John', en: '2 John', tl: '2 Juan', testament: 'NT', chapters: 1 },
  { code: '3JN', source: 'III John', en: '3 John', tl: '3 Juan', testament: 'NT', chapters: 1 },
  { code: 'JUD', source: 'Jude', en: 'Jude', tl: 'Judas', testament: 'NT', chapters: 1 },
  { code: 'REV', source: 'Revelation of John', en: 'Revelation', tl: 'Pahayag', testament: 'NT', chapters: 22 },
];

export const BOOK_BY_CODE = Object.fromEntries(BOOKS.map((b) => [b.code, b]));
export const BOOK_BY_SOURCE = Object.fromEntries(BOOKS.map((b) => [b.source, b]));

export const VERSIONS = [
  { id: 'KJV', label: 'KJV', language: 'en', name: 'King James Version' },
  { id: 'TAGALOG', label: 'Tagalog', language: 'tl', name: 'Ang Biblia (1905)' },
];

export function bookName(book, versionId) {
  return versionId === 'TAGALOG' ? book.tl : book.en;
}
