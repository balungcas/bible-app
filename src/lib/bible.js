// Client-side Bible access. Verses are pre-normalized into static JSON at
// build time (scripts/build-bible-data.mjs) and fetched per book — no external
// Bible API is called at read time.

import { BOOK_BY_CODE, bookName } from './books.js';

const cache = new Map(); // `${version}/${code}` -> { code, chapters }

export async function loadBook(version, bookCode) {
  const key = `${version}/${bookCode}`;
  if (cache.has(key)) return cache.get(key);
  const res = await fetch(`/bible/${version}/${bookCode}.json`);
  if (!res.ok) throw new Error(`Failed to load ${key}`);
  const data = await res.json();
  cache.set(key, data);
  return data;
}

export async function loadChapter(version, bookCode, chapter) {
  const book = await loadBook(version, bookCode);
  return book.chapters[String(chapter)] || [];
}

// Returns the verses for a parsed reference, e.g. { book: 'JHN', chapter: 3, from: 16, to: 18 }
export async function loadPassage(version, ref) {
  const verses = await loadChapter(version, ref.book, ref.chapter);
  const from = ref.from ?? 1;
  const to = ref.to ?? verses.length;
  return verses
    .map((text, i) => ({ verse: i + 1, text }))
    .filter((v) => v.verse >= from && v.verse <= to);
}

export function formatRef(ref, versionId = 'KJV') {
  const book = BOOK_BY_CODE[ref.book];
  const name = book ? bookName(book, versionId) : ref.book;
  let s = `${name} ${ref.chapter}`;
  if (ref.from) {
    s += `:${ref.from}`;
    if (ref.to && ref.to !== ref.from) s += `-${ref.to}`;
  }
  return s;
}
