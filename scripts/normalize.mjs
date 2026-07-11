// Shared normalizer: one normalizer per source, all emitting the same target
// shape — { version, book_code, chapter, verse, text }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS, BOOK_BY_SOURCE } from '../src/lib/books.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SOURCES = [
  { version: 'KJV', file: path.join(ROOT, 'bibles', 'KJV.json') },
  { version: 'TAGALOG', file: path.join(ROOT, 'bibles', 'TagAngBiblia.json') },
];

function cleanText(text) {
  // Strip italics markers ([...]) present in a handful of KJV verses and
  // collapse stray whitespace.
  return text.replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

// Both current sources share the nested { books: [{ name, chapters: [{ chapter,
// verses: [{ verse, text }] }] }] } shape. Add a new normalizer here if a
// future source (e.g. NET) arrives in a different shape.
export function normalizeNested(doc, version) {
  const rows = [];
  for (const book of doc.books) {
    const meta = BOOK_BY_SOURCE[book.name];
    if (!meta) {
      // Throw loudly — a silent `undefined` book_code corrupts the whole table.
      throw new Error(`[${version}] Unmapped book name: "${book.name}"`);
    }
    for (const ch of book.chapters) {
      for (const v of ch.verses) {
        rows.push({
          version,
          book_code: meta.code,
          chapter: Number(ch.chapter),
          verse: Number(v.verse),
          text: cleanText(v.text),
        });
      }
    }
  }
  return rows;
}

export function loadNormalized(source) {
  const doc = JSON.parse(fs.readFileSync(source.file, 'utf8'));
  return normalizeNested(doc, source.version);
}

export function validate(rowsByVersion) {
  const problems = [];
  const counts = {};
  for (const [version, rows] of Object.entries(rowsByVersion)) {
    counts[version] = rows.length;
    if (rows.length < 30000 || rows.length > 32000) {
      problems.push(`${version}: unexpected total verse count ${rows.length} (expected ~31,100)`);
    }
    const seenBooks = new Set(rows.map((r) => r.book_code));
    for (const b of BOOKS) {
      if (!seenBooks.has(b.code)) problems.push(`${version}: missing book ${b.code}`);
    }
    for (const r of rows) {
      if (!r.text) problems.push(`${version}: empty text at ${r.book_code} ${r.chapter}:${r.verse}`);
    }
  }
  // Cross-version verse-count comparison — minor variance is normal
  // (versification differs between translation traditions); log for review.
  const versions = Object.keys(rowsByVersion);
  if (versions.length === 2) {
    const perChapter = (rows) => {
      const m = new Map();
      for (const r of rows) {
        const k = `${r.book_code} ${r.chapter}`;
        m.set(k, (m.get(k) || 0) + 1);
      }
      return m;
    };
    const [a, b] = versions;
    const ma = perChapter(rowsByVersion[a]);
    const mb = perChapter(rowsByVersion[b]);
    for (const [k, n] of ma) {
      if (mb.get(k) !== n) {
        console.warn(`  note: verse count differs at ${k}: ${a}=${n} ${b}=${mb.get(k) ?? 0}`);
      }
    }
  }
  return { problems, counts };
}
